# CTF Reverse 个性化学习路线与整体大纲（ROADMAP）

> 制定与校准日期：2026-11-20  
> 状态说明：`[ ]` 未接触 ｜ `[~]` 学过/记过笔记但未独立验收 ｜ `[x]` 独立实战验收通过

---

## 一、整体能力大纲（CTF Reverse 全景图）

### 模块 A：底层与汇编阅读
- [x] x86-64 寄存器、调用约定（System V / Win64）与栈帧
- [x] 条件跳转（有符号 `jg/jle` vs 无符号 `ja/jbe`）与标志位（`ZF/SF/CF/OF`）
- [x] 多寄存器数据流追踪（无 F5 独立还原优化汇编函数）
- [~] ELF 文件结构（节区、段、符号表、动态链接 PLT/GOT）与手动 Patch
- [~] PE 文件结构（DOS/NT 头、区段表、RVA/FOA、导入表 IAT）

### 模块 B：动态调试与运行时分析（Linux 动调已毕业 ✅）
- [x] GDB + pwndbg 基础（断点、单步、查寄存器/栈/内存）
- [x] PIE 程序动态定位与偏移下断点（`entry` / `start` / `piebase` / `$rebase()`）
- [x] 运行时修改寄存器/内存绕过校验、从内存 dump 解密数据或密钥表（`set` / `dump binary memory`）
- [x] 条件断点（`b ... if`）、硬件观察点（`watch`）、全内存搜索（`search`）与调用栈回溯（`bt`）
- [ ] Windows 动态调试（x64dbg / IDA 远程调试）基础

### 模块 C：算法与密码学逆向
- [x] 位运算与字节变换（XOR、ROL/ROR、移位、掩码、链式异或）与 Python 位宽处理
- [~] 编码类（标准 Base64 / 换表 Base64 / 魔改 Base32/Base58）
- [~] 流密码与分组密码入门（RC4、TEA / XTEA / XXTEA 盲识别与独立写解密）
- [ ] 经典密码学特征识别（AES S-box / MD5 / SHA256 / SM4 / CRC32，结合 FindCrypt）
- [~] 约束求解 Z3（`BitVec`、`LShR`、`ULT/UGT`、`Extract/Concat`、字符集约束）
- [ ] 简单数学/矩阵/状态机/DFS 迷宫类逆向

### 模块 D：多语言二进制逆向
- [x] C 语言去符号 ELF/PE 逆向
- [ ] C++ 逆向基础（`this` 指针、`std::string`、`std::vector`、类继承与虚表 vtable）
- [~] Python 逆向（PyInstaller 解包、`.pyc` 魔数/反编译、手读 `dis` 字节码）
- [~] Android 逆向入门（APK 结构、`apktool`/JADX 看 Java/Kotlin）
- [ ] Android Native 层入门（JNI `.so` 分析 + Frida Hook 基础）
- [ ] Go / Rust / .NET（dnSpy）逆向入门

### 模块 E：壳、混淆与反调试对抗
- [~] 标准 UPX 查壳与脱壳（`upx -d`）
- [ ] 魔改 UPX 修复（特征字节/区段名被破坏）与动态找 OEP 手动脱壳
- [~] 花指令识别与去花（从带提示进阶到无提示识别永恒跳转 + 手动/IDAPython Patch）
- [~] Linux / Windows 常见反调试识别与绕过（`ptrace`、`TracerPid`、`IsDebuggerPresent`、时间差检测）
- [x] SMC（代码自修改）与动态 Dump（`mprotect` + `dump binary memory` + IDA 二次反编译）
- [ ] OLLVM 常见混淆（控制流平坦化 / 虚假控制流）初识与应对思路

### 模块 F：高阶专项（长期拓展）
- [ ] 自定义 VM（虚拟机保护）逆向入门（识别虚拟寄存器/栈、opcode 分发器、写反汇编脚本）
- [ ] 符号执行（angr 入门）与自动化脚本（IDAPython）

---

## 二、4 阶段个性化执行路线

### 阶段 1（已完成 ✅）：边刷算法实战题，边补“动态调试 + 汇编追踪”短板
- **核心目标**：把“看懂笔记”转化为“脱离提示独立解出”，把 `pwndbg` 变成顺手工具。
- **具体任务**：
  1. 完成 Crackmes.one 实战队列（5/6 独立解出，第 6 题吸收了代码自校验与 `al` 位宽知识）。
  2. 独立打通 `ctf-debug-lab` 4 关（含 PIE + 去符号 + `ptrace` 反调试 + 跳 PIN 校验）。
  3. 脱离 IDA F5，纯手读 59 行多寄存器汇编独立解出 `MYCTF 字节锁链`（`flag{Asm_1s_n0t_th4t_h4rd}`）。
- **验收标准**：
  - 已独立完成多寄存器无 F5 汇编逆向 + 字节变换逆推；
  - 已能在 `pwndbg` 中独立完成 PIE `$rebase()` 下断点、改寄存器/劫持 `$rip` 与 `ptrace` 绕过。

### 阶段 2（当下 · 预计 2~3 周）：高频加密盲解 + Z3 进阶 + C++ 逆向映射
- **核心目标**：建立经典加密盲解能力，补齐 Z3 工程用法，趁热打铁打通 C++ 逆向。
- **具体任务**：
  1. **加密盲解专项**：不看 WP，独立完成换表 Base64、魔改 RC4、魔改 TEA/XTEA 各 1~2 道真题。
  2. **Z3 补齐**：用 `BitVec` + `LShR` + `ULT/UGT` + 可见字符约束解决 2 道含位运算/多解的逆向题。
  3. **C++ 逆向映射**：把正在学的 C++（含 `class`、虚函数、`std::string`、`std::vector`）用 `g++ -O0` 和 `-O2` 编译后拖进 IDA 对比分析，总结一份自己的“C++ 伪代码速查表”。
- **验收标准**：
  - 30~45 分钟内独立盲解一道去符号、含单层魔改加密（Base64/RC4/TEA）的 ELF；
  - 看到 IDA 里的 `std::__cxx11::basic_string` 和虚表调用不再发怵。

### 阶段 3（第 5~8 周）：对抗与混淆实战
- **核心目标**：从“能分析清晰代码”进阶到“能先剥掉保护拿到清晰代码”。
- **具体任务**：
  1. **反调试实战**：在 Linux 上实操绕过 `ptrace`、`/proc/self/status`（`TracerPid`），熟练使用动态改返回值和 Patch 两种方法。
  2. **魔改 UPX 修复**：结合 ELF/PE 结构知识，手动修复被破坏魔数/区段名的 UPX 样本并脱壳。
  3. **无提示去花与 SMC**：识别常见花指令模式（`jz/jnz`、`call $+5` 等）并 Patch 恢复 F5；练 1~2 道 SMC 动态 dump 题。
- **验收标准**：
  - 遇到“IDA 报红反编译失败”“`upx -d` 报错”“进 GDB 直接退出”三类经典阻碍时，能独立排查并打通。

### 阶段 4（长期进阶）：比赛高频专项突破
- 按比赛目标与兴趣依次解锁：
  1. 标准密码学常量识别（AES / MD5 / SHA256 / SM4）
  2. 自定义 VM 逆向入门
  3. Python 字节码深入 / Android `.so`（JNI + Frida） / Go & Rust 逆向
