# 学习者能力画像与诊断（PROFILE）

> 最后更新：2026-11-25  
> 当前定位：**CTF Reverse 中级起步（Level 2+，Linux 动调专题 S-RANK 毕业）**  
> 实验环境：Arch Linux x86-64 / GCC 16 / GDB + pwndbg / IDA Pro / DIE / Python (venv + z3-solver)

---

## 一、能力维度总评（截至 2026-11-25 · 动调综合大考 S-RANK 毕业）

| 能力维度 | 真实掌握度 | 当前状态与表现 |
|---|---|---|
| **GDB / pwndbg 动态调试** | 🟢 已稳（重大突破） | 零提示打穿 Level 1~7 + 结业大考，熟练串联 `entry` / `$rebase()` / `set $rax` / `set $rip` / `watch` 抓 `.init_array` / 条件断点 `b ... if` / `search` / `dump binary memory` 破 SMC |
| **算法逆推思维** | 🟢 已稳 | 独立完成 ROL/ROR、XOR、索引加法、CBC 链式状态逆推，Python `& 0xff` 位宽截断已成肌肉记忆 |
| **x86-64 汇编阅读** | 🟢 已稳 | 脱离 IDA F5，纯手读 59 行含 8 个协作寄存器的 Win64 汇编独立还原逻辑并解出 `MYCTF 字节锁链` |
| **对抗与混淆（壳/花指令/反调试）** | 🟡 快速进阶 | 已实战掌握 Linux `ptrace` 绕过、`.init_array` 隐蔽初始化定位、SMC 动态 Dump 与二次反编译；待补魔改 UPX 修复与无提示去花指令 |
| **Z3 约束求解** | 🟡 入门偏上 | 知道选 `BitVec` 与 `LShR`；待补齐无符号比较（`ULT/UGT`）、位拼接（`Concat/Extract`）与多解约束 |
| **经典加密盲解（Base64/RC4/TEA）** | 🟡 待独立验收 | 懂原理、看过 WP，但尚未经过“无提示独立盲解真题”的验收（当前阶段 2 核心主线） |
| **C++ 逆向与多平台** | 🟡 稳步推进 | C 去符号 ELF 已稳，C++ 刚入门，待建立 C++（`std::string`/`std::vector`/虚表）与 IDA 伪代码的映射；Windows 动调待解锁 |

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
