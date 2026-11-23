# 当前学习进度看板（PROGRESS）

> 最后更新：2026-11-20  
> 当前所在阶段：**阶段 1（夯实基础算法逆向 + 补强 `pwndbg` 动态调试与汇编追踪）**

---

## 一、当前主线焦点（防跑偏锚点）

1. **主线任务**：从零攻克 **`pwndbg` 4 关新手道场**（`/home/qinyuanxin132/.gemini/antigravity/scratch/pwndbg-dojo`），把动态调试从“完全不会”练到能独立处理 PIE、改寄存器、抓内存密钥、绕过 `ptrace`。
2. **前置战果**：Crackmes.one 前 5 题已全部独立完成，第 6 题 `ComputeTheKey` 已看 WP，等打通道场后回来秒杀复现。

---

## 二、`pwndbg` 新手道场进度

| 关卡 | 文件名 | 核心思路 | 新学命令 | 状态 |
|---|---|---|---|---|
| Level 1 | `lv1_watch` | 在 `strcmp` 刹车偷看明文 | `start` / `b` / `c` / `x/s` | ✅ 已通关 |
| Level 2 | `lv2_patch_reg` | 单步跟踪 + 改寄存器绕过检查 | `ni` / `si` / `set $eax=...` | 🔄 进行中 |
| Level 3 | `lv3_pie_key` | PIE 去符号偏移下断点 + 抓内存表 | `starti` / `$rebase()` / `x/16bx` | ⏳ 待做 |
| Level 4 | `lv4_antidebug` | 绕过 `ptrace` 反调试 + 改控制流 | `catch syscall` / `set $rax=0` | ⏳ 待做 |

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
