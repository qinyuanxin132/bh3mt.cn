# 学习者能力画像与诊断（PROFILE）

> 最后更新：2026-11-24  
> 当前定位：**CTF Reverse 入门向中级过渡期（Level 1.5 → Level 2）**  
> 实验环境：Arch Linux x86-64 / GCC 16 / GDB + pwndbg / IDA Pro / DIE / Python (venv + z3-solver)

---

## 一、能力维度总评（基于博客梳理 + 摸底小测 + 2026-11-23 GDB 4 关实战）

| 能力维度 | 真实掌握度 | 当前状态与表现 |
|---|---|---|
| **算法逆推思维** | 🟢 已有感觉 | 能快速理清正向/逆向运算顺序，能识别 ROL/ROR、XOR、数组置换；偶有漏写 `& 0xff` 截断 |
| **GDB / pwndbg 动态调试** | 🟢 已有感觉 | 已独立打通 Level 1~4（Mini Boss），熟练掌握 `entry` / `piebase` / `b *$rebase()`、`x/s $rsi`、`set $rax=0`、`set $rip=$rebase(...)` 绕过 `ptrace` 与跳过校验；待补内存数组 dump（`x/Nbx`）与 `watch`/硬件断点 |
| **Z3 约束求解** | 🟡 入门偏上 | 知道面对位运算应选 `BitVec`，已亲手踩过 `>>`（算术右移）与 `LShR`（逻辑右移）的坑；待补齐无符号比较与位拼接 |
| **x86-64 汇编阅读** | 🟡 中等偏弱 | 能看懂基础指令、栈帧与有符号跳转（`test`/`jle`），但容易把多个寄存器混成一个变量，对算术/移位指令隐式修改标志位（如 `shr` 改 `ZF`）不敏感 |
| **静态工具链与文件格式** | 🟡 入门 | 熟悉 DIE + IDA 基础导航与 F5；了解 PE/ELF 基础结构与简单 Patch；接触过标准 `upx -d`、简单 `.pyc`、APK `apktool` |
| **编程语言基础** | 🟡 稳步推进 | C 语言（含指针）已有基础；C++ 刚入门（2026-11-15 起步），尚未与 IDA 的 C++ 伪代码建立映射 |
| **对抗与混淆（壳/花指令/反调试）** | 🟡 初探门径 | 已实战绕过 Linux `ptrace` 反调试；壳与混淆仍停留在标准 `upx -d` 和带提示花指令，未做魔改壳/无提示去花/SMC |

---

## 二、博客已记录知识点盘点（接触过 ≠ 掌握）

来源：`src/content/posts/`

- **基础语言**：C 语言 #1~#5（含指针）、C++ #1~#2（基础语法 + 文字 RPG 实战）、Verilog 入门
- **汇编与编译优化**：x86-64 System V ABI、栈帧（`push rbp`/`call`/`ret`/`leave`）、`cmp`/`test` 与有符号/无符号跳转、GCC `-O0` vs `-O2`（`cmov`/`setcc`/指针步进）
- **文件结构与修改**：PE 结构 #1~#2（DOS/NT 头、RVA/RAW、Stud_PE）、ELF 文件结构入门、ELF Patch 实战 #1
- **常见逆向题型**：
  - 查壳脱壳：标准 UPX（`upx -d`）
  - 编码与加密：凯撒、XOR、Base64、ROL/ROR、RC4（西电 CTF 反方向的 RC4）、TEA/ARX 逆向通用原理（西电 CTF 请你喝茶 / 请 fanchai 喝茶）
  - 求解工具：Z3 入门（`z3-solver` 解 `license_check` 等）
  - 杂项与异构：简单花指令（`ez_flower`）、`.pyc` 版本识别与反编译（`pyinstxtractor` / Decompyle++）、Android APK（`apktool`）、8086 DOSBox

---

## 三、个人高频踩坑备忘录（做题前自查）

1. **读汇编先把寄存器分角色**：遇到多寄存器循环，先写注释标清每个寄存器对应什么变量（例如 `eax=cnt, edx=tmp, edi=arg`），不要混写成同一个变量。
2. **注意隐式修改标志位的指令**：`shr`、`sub`、`add`、`and`、`dec` 等执行后会直接更新 `ZF`/`SF`，后面的 `jne`/`je`/`jle` 往往直接用它们的结果，不一定有显式 `cmp`/`test`。
3. **纯 Python 写 8/32 位逆推必加掩码**：Python 整数无固定位宽，做完减法或移位容易出现负数或高位溢出，8 位随手 `& 0xff`，32 位随手 `& 0xffffffff`。
4. **区分纯 Python 与 Z3 写法**：`LShR(x, n)` 是 Z3 的 `BitVec` 专用逻辑右移；纯 Python 非负整数直接 `x >> n`。
5. **Z3 `BitVec` 有符号/无符号陷阱**：
   - 无符号右移必须用 `LShR(a, n)`，**不要用 `a >> n`**（默认算术右移）。
   - 无符号比较必须用 `ULT` / `ULE` / `UGT` / `UGE`，不要直接用 `<` / `>`。
6. **PIE 程序在 `pwndbg` 下断点**：先 `start` 或 `starti` 加载进程，再 `b *$rebase(0x偏移)`（或 `piebase` 后手动相加）。
7. **反编译赋值回看汇编位宽**：看到 `byte_xxxx = func()` 时确认汇编是 `mov ..., al`（只改 1 字节）还是整块覆盖，避免漏掉后面紧邻的静态数据。
8. **代码自校验（Anti-Tamper）避开 `0xCC`**：如果程序对 `main` 自身机器码算哈希，不要在 `main` 内部下普通软件断点（`b` 会写入 `0xCC` 改坏哈希）；改在被校验范围外的函数（如加密函数入口）下断点，或使用硬件断点 `hb`。
9. **分清 GDB 的 `p` 和 `x`**：`x/s $rax` 是把 `$rax` 当成内存地址去读取字符串；只想看寄存器本身的值（比如确认 `ptrace` 返回 `-1` 还是 `0`）应该用 `p/x $rax` 或 `i r rax`。
