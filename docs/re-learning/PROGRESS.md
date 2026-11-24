# 当前学习进度看板（PROGRESS）

> 最后更新：2026-11-24  
> 当前所在阶段：**阶段 1 收官（动态调试核心短板已打通，准备进入阶段 2）**

---

## 一、当前主线焦点（防跑偏锚点）

1. **刚完成的突破**：独立通关 `ctf-debug-lab` 4 关（含 Mini Boss：PIE + Stripped + `ptrace` 反调试 + 跳过 PIN + 抓 Flag），写出完整笔记 `gdb-0-1-stady-1.md`，**能力树首批 2 颗 `[x]` 星点已点亮**！
2. **阶段 1 最后收尾**：用刚练熟的 `entry` + `b *$rebase()` + `x/Nbx` 顺手复现 `06 ComputeTheKey`（或直接做 1 道内存数组 dump 实战），即可正式毕业进入 **阶段 2（经典加密盲解 + Z3 进阶 + C++ 逆向映射）**。

---

## 二、`pwndbg` 动调实战通关记录

| 关卡 | 文件名 | 核心思路 | 实战命令 | 状态 |
|---|---|---|---|---|
| Level 1 | `ctf-debug-lab/level1` | 在 `strcmp` 刹车偷看明文 | `disas` / `b *addr` / `x/s $rsi` | ✅ 已通关 |
| Level 2 | `ctf-debug-lab/level2` | 绕过 `ptrace` + 改寄存器/劫持 `$rip` | `set $rax=0` / `set $eax=1` / `set $rip=...` | ✅ 已通关 |
| Level 3 | `ctf-debug-lab/level3` | PIE + 去符号偏移下断点偷看明文 | `entry` / `piebase` / `b *$rebase(...)` | ✅ 已通关 |
| Level 4 | `ctf-debug-lab/level4` (Mini Boss) | PIE + 去符号 + `ptrace` + 跳 PIN 校验 + 抓 Flag | 多断点连招 + `set $rip=$rebase(...)` | ✅ 已通关 |

---

## 三、Crackmes.one 实战题队列

来源：`src/content/posts/CTF-shua-ti-ri-zhi-dwadw.md`（Crackmes.one Level 1 → Level 2）

| 编号 | 题目名 | 难度 / 训练点 | 状态 | 备注 |
|---|---|---|---|---|
| 01 | `nasm crack` | 1.0 · 汇编与输入校验 | ✅ 已完成 | 密码 `supersecret` |
| 02 | `Plain sight` | 1.1 · IDA 导航、查找校验 | ✅ 已完成 | 密码 `do_not_hardcode`（识别了 C++ `std::cin` / `operator==`） |
| 03 | `PieIsMyFav` | 1.0 · 算术判断与汇编阅读 | ✅ 已完成 | 密码 `3` |
| 04 | `simple XOR crackme` | 1.9 · 输入校验、字节处理 | ✅ 已完成 | 密码 `ABC&E@GH98K51NOP`（独立处理 `__m128i` 小端序与 XOR） |
| 05 | `jumpjumpjump` | 2.0 · 控制流与条件分析 | ✅ 已完成 | 密码 `!#&*/5<DMW`（还原 `strcat_str` 递推） |
| 06 | `ComputeTheKey` | 2.3 · 综合静态逆向 + 动态取密钥 | 📖 已看 WP（待复现） | 需用 `pwndbg` 亲手下 `$rebase(0x11C3)` 断点抓出 `fd c0 de` 才算吃透 |

> 注：如果本地还有其他待做的算法题，随时补充到本表。

---

## 三、下一步具体行动（下次对话直接从这里开始）

- **立即开始**：拆解 `06 ComputeTheKey`——先看核心变换函数 `sub_11A9`，再结合 `pwndbg` 获取运行时生成的 `byte_4018` 与 `qword_4010`（顺便实战体会软件断点 `0xcc` 对代码校验的影响）。
- **阶段 1 结束后**：核对阶段 1 验收标准，把能力树中对应节点从 `[~]` 点亮为 `[x]`，进入阶段 2（加密盲解 + Z3 进阶 + C++ 逆向映射）。
