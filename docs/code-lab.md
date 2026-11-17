# 代码实验室

入口 `/lab/`，纯静态页面，无编译后端或 API 密钥。语言环境全部自托管，仅在点击运行后加载。

## 支持的语言

| 语言       | 环境                                  | 输入方式                                           |
| ---------- | ------------------------------------- | -------------------------------------------------- |
| Python     | Pyodide 0.27.7                        | `input()` / `sys.stdin`                            |
| C / C++    | browsercc 0.1.1，Clang，C17 / C++20   | 标准输入；libc / libc++                            |
| JavaScript | 浏览器 Worker                         | `stdin` 全文、`readline()` 逐行，EOF 返回 null     |
| TypeScript | Sucrase 转译后运行                    | 同 JavaScript，不做类型检查                        |
| Java       | javac + TeaVM，@browserrun/java 0.1.0 | UTF-8 `System.in` 桥接及常用 Scanner 兼容类        |
| Go         | Yaegi，@browserrun/go 0.1.0           | `fmt.Scan` / `os.Stdin`，解释执行                  |
| PHP        | WordPress PHP.wasm 8.4，3.1.63        | STDIN / php://stdin；单独文件引入保留 strict_types |
| Ruby       | mruby-wasm-js 0.2.0                   | `gets`；核心 Ruby，无 gems / CRuby 扩展            |
| Lua        | Wasmoon 1.16.0，Lua 5.4               | `io.read()`；输出连接浏览器结果区                  |
| SQL        | sql.js 1.16.0，SQLite                 | 每行输入位于 `stdin(line)` 表；每次从空数据库开始  |

提供 11 种语言，每种三个可运行示例：中文问候、输入求和、斐波那契。暂不提供 Node.js 模块、系统进程、线程、cgo、第三方包安装或 C++ 异常。Java 使用精简类库，部分完整 JDK API 不可用；Scanner 兼容类实现常用 token / 行 / 数字读取。

## 实现

- `src/data/code-lab.ts`：语言清单、文件名、输入提示和示例，共用于页面及客户端。
- `src/pages/lab.astro`、`src/styles/code-lab.css`：独立页面及响应式布局。
- `src/scripts/code-lab.ts`：CodeMirror 编辑器、逐语言草稿、标准输入、下载及 Worker 生命周期。语法支持按语言加载。
- `src/scripts/code-lab.worker.ts`：消息、输出与下载错误处理、Python 和 C/C++。
- `src/scripts/code-lab-extra.ts`：新增八种语言的适配，JS 异步执行与计时器、WASI、Java 和 PHP 启动。
- `src/runtime/java/`：项目自有输入兼容层。Java 字符串和注释中的 `System.in` / `java.util.Scanner` 不被改写。可执行引用连接内存输入流，并提供 Scanner 的常用方法；源文件仍以本来的类名编译。
- `scripts/prepare-code-lab.mjs`：从锁定 npm 包复制所需运行文件和许可证，生成大小 / SHA256 清单；SQL loader 添加局部 CommonJS 兼容绑定及 ESM export，保留原始文件。

`npm run dev` / `npm run build` 会自动重建被 Git 忽略的 `public/vendor/code-lab/`。GitHub Actions 安装锁定依赖后生成并发布，无须把大型二进制提交到 Git。升级版本时同步修改准备脚本、适配器路径和页面说明，保留 PHP loader 的相对目录。

## 执行行为

每次创建新的模块 Worker，结束、停止、超时后销毁，避免跨次状态与内存残留。准备和编译各有 120 秒上限；执行可选 5 / 10 / 30 秒。输出上限为 100,000 字符，结果与错误均按文本显示。JS / TS 支持顶层 await 和普通计时器；未清除的 interval 会由执行上限终止。

localStorage 键 `bh3mt:code-lab:v1` 分语言保存源码和输入，兼容原有三种语言草稿；存储不可用时仍可在当前页面编辑、切换与运行。源码和草稿不会上传编译服务器。

## 验证

`npm run build` 后，运行 `python3 -m http.server 4322 --bind 127.0.0.1 --directory dist`，再运行 `npm run check:lab`。需要系统 Chrome，可用 `CHROMIUM_PATH` 指定浏览器，`URL` 指定测试地址。

覆盖 33 个示例、JavaScript 计时器、Java 中文 / emoji / package / 字符串保留、PHP strict_types / 非零退出、各语言错误、输入 / EOF、超时、停止、重新运行、草稿恢复、源码下载、手机布局和下载失败状态。初始环境资源请求为零，运行请求全部同源。
