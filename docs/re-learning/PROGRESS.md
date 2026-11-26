# 当前学习进度看板（PROGRESS）

> 最后更新：2026-11-26  
> 当前所在阶段：**阶段 2（高频加密盲解 + Z3 `BitVec` 进阶 + C++ 逆向映射）**

---

## 一、当前主线焦点（防跑偏锚点）

1. **最新里程碑 🎉**：零提示打穿 **花指令「无提示去花」实战训练营（Level 1 ~ 4 + 结业大考 `final_exam`）**，从手工 IDA `U/90/C/P/F5` 进阶到 Python 增量多字节特征批量去花，独立清平 PIE 去符号大考中的 6 种混合花指令并解出 `flag{d3junk_m4st3r_s_r4nk_2026}`，**模块 E「花指令识别与去花」正式点亮 `[x]`，累计点亮 11 颗 `[x]` 星点！**
2. **前序里程碑**：零提示独立打穿 **CTF 逆向动调综合结业大考**（`flag{gdb_gr4du4t3_s_r4nk_2026}`），Linux 动调全部 4 个核心节点毕业。
3. **阶段 2 主线（预计 2~3 周）**：
   - **经典加密盲解**：无提示独立解出 换表 Base64、魔改 RC4、魔改 TEA/XTEA 各 1~2 题；
   - **Z3 进阶**：补齐 `ULT/UGT`、`Concat/Extract` 与可见字符集约束；
   - **C++ 逆向映射**：用自己写的 C++（`class`/`std::string`/`std::vector`/虚表）对照 IDA 伪代码；
   - **真实 CTF 平台实战**：穿插刷 BUUCTF / NSSCTF / MoeCTF 的 Linux Reverse 真题保持手感。

---

## 二、阶段 2 实战任务队列

| 编号 | 训练专题 | 目标能力点 | 状态 | 备注 |
|---|---|---|---|---|
| S2-01 | `MYCTF 字节锁链` + `动调结业大考` | 无 F5 汇编 + `watch`/条件断点/SMC `dump` | ✅ 已完成 | 独立解出 `flag{Asm_1s_n0t_th4t_h4rd}` 与 `flag{gdb_gr4du4t3_s_r4nk_2026}` |
| S2-01b | `junk-code-lab` 无提示去花训练营（5 关） | 互补跳转 / 假 `call` 平栈 / 重叠指令 / 不透明谓词 / Python 批量去花 | ✅ 已完成 | 5 关全通，结业大考 `flag{d3junk_m4st3r_s_r4nk_2026}` S-RANK 毕业 |
| S2-02 | `换表 Base64` 盲解实战 | 识别 64 字节自定义码表与魔改填充 | ⏳ 待做 | 下一站主线 |
| S2-03 | `魔改 RC4` 盲解实战 | 识别 KSA/PRGA 256 字节 S 盒与魔改点 | ⏳ 待做 | 不看 WP 独立写解密 |
| S2-04 | `魔改 TEA / XTEA` 盲解实战 | 识别 `0x9E3779B9` 魔数、32 轮与 `& 0xffffffff` | ⏳ 待做 | 练 32 位 ARX 逆推 |
| S2-05 | `Z3 BitVec` 综合约束题 | `LShR` + `ULT/UGT` + `Extract/Concat` | ⏳ 待做 | 练工程化 Z3 建模 |
| S2-06 | `C++ 逆向映射` 实验 | `this` 指针、`std::string`、`std::vector`、虚表 | ⏳ 待做 | 结合 `cpp-xue-xi-2.md` 实战 |

---

## 三、已完成历史队列（阶段 1 归档）

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

## 四、下一步具体行动（下次对话直接从这里开始）

- **立即开始**：开启 **S2-02 `换表 Base64` 盲解实战**（无提示独立识别 64 字节自定义码表、魔改填充并编写 Python 解密脚本），稳步推进阶段 2 经典加密盲解主线。
