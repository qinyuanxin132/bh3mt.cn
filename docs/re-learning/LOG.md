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

---

## 2026-11-23 ~ 2026-11-24｜GDB 动调从 0 到 0.1 突破，首批能力树节点点亮！

- 独立打通 `ctf-debug-lab` 全部 4 关并沉淀为博客文章 [GDB学习0-->0.1](../../src/content/posts/gdb-0-1-stady-1.md)：
  - Level 1：在 `strcmp@plt` 下断点，用 `x/s $rsi` 偷看明文 Flag。
  - Level 2：用 `set $rax = 0` 绕过 `ptrace` 反调试，并用 `set $eax = 1` 与 `set $rip = 0x4012fc` 两种方式通关。
  - Level 3（PIE + Stripped）：实战掌握 `entry` → `piebase` → `b *$rebase(偏移)` 黄金三连。
  - Level 4（Mini Boss）：独立组合 `ptrace` 绕过 + `set $rip = $rebase(0x13e2)` 跳过 Admin PIN 校验 + 校验点 `x/s $rsi` 拿 Flag。
- **能力树跃迁**：
  - 模块 B「GDB + pwndbg 基础」：`[~]` → `[x]`
  - 模块 B「PIE 程序动态定位与偏移下断点」：`[ ]` → `[x]`
  - 模块 B「运行时修改寄存器/内存绕过校验」：`[ ]` → `[~]`
  - 模块 E「Linux / Windows 常见反调试识别与绕过」：`[ ]` → `[~]`
- **小细节备忘**：看寄存器本身数值用 `p/x $rax` 或 `i r rax`，`x/s $rax` 是把寄存器当指针解引用读字符串。

---

## 2026-11-24｜无 F5 纯汇编独立解出 `MYCTF 字节锁链`，阶段 1 正式毕业！

- 仅凭纯 `objdump` 反汇编（`disasm.txt`，无 IDA F5 伪代码），独立分析 59 行 Win64 汇编并解出 `flag{Asm_1s_n0t_th4t_h4rd}`，撰写 [myctf 字节锁链 wp](../../src/content/posts/MYCTF-zi-jie-suo-lian-wp.md)。
- **核心亮点**：
  - 彻底克服 5 天前摸底时“多寄存器混成一个变量”的短板，精准理清 `r12`/`r15`/`r14`/`r13d`/`rbx`/`rax`/`rcx`/`edx`/`esi` 的职责。
  - 一眼看穿 CBC 链式状态 `r13d = eax` 在校验通过时必然等于上一轮目标密文 `r14[i-1]`，直接构造前驱数组一步逆推。
  - `ROL3` → `ROR3` 逆推顺序与 `& 0xff` 位宽截断零失误。
- **能力树跃迁（累计点亮 6 颗 `[x]`）**：
  - 模块 A「x86-64 寄存器、调用约定与栈帧」：`[~]` → `[x]`
  - 模块 A「条件跳转与标志位」：`[~]` → `[x]`
  - 模块 A「多寄存器数据流追踪（无 F5 独立还原）」：`[ ]` → `[x]`
  - 模块 C「位运算与字节变换与 Python 位宽处理」：`[~]` → `[x]`
- **路线推进**：阶段 1 正式毕业 ✅，主线切换至 **阶段 2（经典加密盲解 + Z3 进阶 + C++ 逆向映射）**。

---

## 2026-11-25｜动调专题 S-RANK 结业大考通关，累计点亮 10 颗 `[x]`！

- 接续打穿 `ctf-debug-lab` Level 5 ~ Level 7 及最终综合结业大考，完善 [GDB学习0-->0.1](../../src/content/posts/gdb-0-1-stady-1.md)：
  - Level 5：使用 `watch *(int*)$rebase(0x4094)` 抓出 `.init_array` 隐藏初始化现行，并结合 `search "flag{"` 定位栈明文。
  - Level 6：使用条件断点 `b *$rebase(0x13AD) if ...` 在 300 轮变换中精准断在明文轮次。
  - Level 7 & 结业大考：零提示独立打穿 **PIE + 去符号 + `ptrace` 反调试 + `.init_array` 隐藏密钥 + SMC（`mprotect` 自解密） + `dump binary memory` + IDA 二次反编译 + Python 逆推**，成功拿到 `flag{gdb_gr4du4t3_s_r4nk_2026}`。
- **能力树跃迁（6 颗 → 10 颗 `[x]`）**：
  - 模块 B「运行时修改寄存器/内存绕过校验与内存 dump」：`[~]` → `[x]`
  - 模块 B「条件断点、硬件观察点（`watch`）、全内存搜索与调用栈回溯」：`[ ]` → `[x]`
  - 模块 D「C 语言去符号 ELF/PE 逆向」：`[~]` → `[x]`
  - 模块 E「SMC（代码自修改）与动态 Dump」：`[ ]` → `[x]`

---

## 2026-11-26｜花指令「无提示去花」专题 S-RANK 毕业，累计点亮 11 颗 `[x]`！

- 在本地实战靶场 `junk-code-lab` 独立打穿全部 5 关（去符号 Linux x86-64 ELF，含 PIE 结业大考）：
  - **Level 1**（互补条件永恒跳转 `jz/jnz`、`jb/jae` + `0xE8`/`0xE9`）：掌握 IDA `U → Patch 0x90 → C → P → F5` 标准手法，解出 `flag{e8_jnz_jz_nop_it_all}`。
  - **Level 2**（假 `call $+5` + `add [rsp], N; ret` 与假 `call` + `add rsp, 8`）：掌握返回地址落点加法、栈平衡成对消除铁律、删除残缺函数重建 `P` 修复 `sp-analysis failed`，解出 `flag{f4k3_c4ll_r3t_st4ck_f1x}`。
  - **Level 3**（`jmp loc+1` 重叠指令 + 不透明谓词 + 套娃组合）：掌握无需背机器码的“`U` 拆跳转 → `+1` 目标按 `C` 让 IDA 自己翻译”通解，解出 `flag{0v3rl4p_jmp_4nd_0p4qu3}`。
  - **Level 4**（15 处跨函数重复花指令）：编写 Python 增量特征匹配脚本批量替换等长 `0x90` 生成 `_patched` ELF，0.01 秒全图自动去花并直接 F5，解出 `flag{pyth0n_b4tch_d3junk_pr0}`。
  - **Final Exam**（PIE + 去符号 + 6 种混合花指令 + `ROL2` + 魔数 `i % 5` + CBC 链式校验）：独立使用 Python 多字节特征增量去花把全部核心函数洗净出 F5，解出 `flag{d3junk_m4st3r_s_r4nk_2026}`，S-RANK 毕业！
- **能力树跃迁（10 颗 → 11 颗 `[x]`）**：
  - 模块 E「花指令识别与去花」：`[~]` → `[x]`
- **实用技巧沉淀**：IDA 开启操作码字节数显示、`Shift+E` 一键导出数组、自动化去花永远用整块多字节特征并先 `count()` 防误杀、GCC 魔数 `0xCCCCCCCCCCCCCCCD` 识别为 `i % 5`。




