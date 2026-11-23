# 学习与实战日志（LOG）

> 按时间倒序或顺序追加，记录每次测验、刷题突破、踩坑与掌握度变化。

---

## 2026-11-19 ~ 2026-11-20｜建档与首次摸底小测

### 1. 博客盘点与建档
- 梳理了 `src/content/posts/` 下的全部逆向/C/C++/汇编/PE/ELF/Z3 笔记与 WP。
- 在 `docs/re-learning/` 建立持久化学习档案项目（`README.md`、`PROFILE.md`、`ROADMAP.md`、`PROGRESS.md`、`LOG.md`），便于长期追踪与多 AI 无缝交接。

### 2. 首次摸底小测（4 题）结果
- **题 1（x86-64 `-O2` 优化汇编阅读：popcount 函数）**：
  - 做对：识别 1 个参数 `edi`、返回值 `eax=0`、`test/jle` 对应 `if (a <= 0) return 0`。
  - 暴露问题：把 `eax`/`edx`/`edi` 混写成同一个变量 `b`；对 `shr edi, 1` 隐式更新 `ZF` 配合 `jne` 的机制不熟。
- **题 2（字节变换逆推：`ROR2 + ADD + XOR`）**：
  - 做对：逆运算顺序与 `ROL2` 逆变换完全正确。
  - 暴露问题：纯 Python 减法漏写 `& 0xff` 截断；混写了 Z3 的 `LShR` 到纯 Python 表达式里。
- **题 3（Z3 `BitVec` 无符号右移避坑）**：
  - 做对：正确选择 `BitVec(..., 8)`。
  - 现场踩坑并当场修正：初版写了 `a >> 1`，Z3 按算术右移给出伪解 `[a=230, b=102]`；改用 `LShR(a, 1)` 后立即跑出正解 `[a=96, b=35]`。
- **题 4（`pwndbg` PIE 下断点 + `ptrace` 反调试绕过）**：
  - 诚实反馈“不会，只知道大概和内存偏移有关”。
  - 确认 **GDB/pwndbg 动态调试** 为当前最优先补齐的核心短板，已补充 `start` + `b *$rebase(0x偏移)` 与 `ptrace` 绕过两条基础招式。

### 3. 下一步计划
- 立刻进入阶段 1，从 `02 Plain sight` 开始逐题刷完剩余 5 道 Crackme，并强制结合 `pwndbg` 动手练习。

---

## 2026-11-20｜连破 5 道 Crackme，挺进综合题 `ComputeTheKey`

- 独立完成 `02 Plain sight`、`03 PieIsMyFav`、`04 simple XOR crackme`、`05 jumpjumpjump` 共 4 题（累计 5/6）。
- **亮点**：第 2 题独立看懂了 C++ 的 `std::cin` 与 `std::operator==`；第 4 题遇到 `__m128i` 16 字节 SIMD 常量时，自己反应出小端序字节排列并写了带 `& 0xff` 的 Python 脚本一次验证通过。
- **当前卡点**：第 6 题 `ComputeTheKey` 的 `sub_11C3` 代码较长且有 `sub_1312(main, ...)`，产生畏难情绪；准备通过“拆解核心 `sub_11A9` + `pwndbg` 动态抓取密钥”带练突破。

