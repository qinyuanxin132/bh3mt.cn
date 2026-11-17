# 代码实验室

入口 `/lab/`，公共主导航包含“实验室”。纯静态页面，无编译后端、API 密钥或跨域隔离头要求。

## 实现

- `src/pages/lab.astro`、`src/styles/code-lab.css`：独立页面及响应式布局。
- `src/scripts/code-lab.ts`：CodeMirror 编辑器、三种语言草稿、标准输入、源码下载、快捷键及 Worker 生命周期。
- `src/scripts/code-lab.worker.ts`：Pyodide Python；browsercc Clang / LLD 编译 C17、C++20，使用 browser_wasi_shim 运行 WASI 模块。
- `scripts/prepare-code-lab.mjs`：从锁定的 npm 包复制必要运行文件，生成包含大小与 SHA256 的清单。`npm run dev` / `npm run build` 会自动准备。

工具链按首次运行加载，全由本站提供。生成目录 `public/vendor/code-lab/` 不进入 Git，由 GitHub Actions 安装锁定依赖后生成并打包发布。不要改成只复制 JS，Wasm、sysroot 和 Python 标准库都是必须资源。

依赖固定 `pyodide@0.27.7`、`browsercc@0.1.1`。升级时同时更新 Worker 路径和页面说明。上游及许可证保留在 `public/vendor/code-lab-licenses/`，browsercc 生成目录也保留 MIT LICENSE。LLVM、Pyodide 代码与构建来源见各自上游项目。

## 执行行为

每次运行创建新的模块 Worker，结束或停止后销毁，避免跨次状态和内存残留。准备及编译各有 120 秒上限；程序执行可选 5 / 10 / 30 秒。输出最多 100,000 字符；输出和诊断始终作为文本显示。

输入按 UTF-8 原样读取，读完返回 EOF；需要交互输入的程序请先填标准输入框。支持单文件及所带标准库，不提供安装包、线程、系统进程、套接字或 C++ 异常。程序运行时间不包含下载和编译。

localStorage 键 `bh3mt:code-lab:v1` 为每种语言保存源码和输入；存储不可用时仍可在当前页面编辑、切换与运行。

## 验证

`npm run build` 后，在单独终端运行 `python3 -m http.server 4322 --bind 127.0.0.1 --directory dist`，再运行 `npm run check:lab`。需要系统 Chrome，可用 `CHROMIUM_PATH` 指定浏览器；可用 `URL` 指定其他测试地址。

浏览器检查覆盖三种语言的示例、标准输入、中文、Python traceback / EOF、C 编译错误、退出码、输出转义、快捷键、执行超时、停止、重新运行、草稿恢复、源码下载、手机布局及下载失败状态。工具链资源应在首次运行前保持零请求，运行请求均为同源。
