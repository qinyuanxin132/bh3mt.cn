---
title: "Reverse 01-10 wp"
slug: "rev01-rev10-wp"
date: 2026-11-23
updated: 2026-11-23
published: true
categories: ["CTF"]
tags: ["CTF", "Reverse"]
---

# Reverse 01-10 wp

这组题都是 Linux 下的 ELF 文件，放进 IDA 看 main 函数就可以开始分析。前几题主要是字符串比较和简单变换，后面几题把比较方式稍微藏了一下。

## rev01

先用 strings 看一下，发现程序里直接有一串 flag：

```
flag{str1ngs_1s_4ll_y0u_n33d}
```

题目名也在提醒我们用 strings，直接运行验证一下就可以。

## rev02

打开 IDA 看 main，程序先检查输入长度是 30，然后循环处理每一个字符。关键部分是：

```
输入字符 ^ 0x5a == enc[i]
```

异或两次会变回原来的值，所以把 enc 数组的每个字节再异或一次 `0x5a` 就能得到输入。

```
flag{x0r_3ncrypt10n_1s_s1mpl3}
```

## rev03

这题同样是逐个字符比较。IDA 里看到 `cmp` 数组每项占 4 字节，存放的是字符对应的 ASCII 值。把数组按小端的 32 位整数读出来，转成字符就是 flag。

```
flag{ch4r_by_ch4r_c0mp4r3}
```

## rev04

先看到一串密文：

```
iodj~vk4iwb6qfu|sw43q
```

回到 main，比较逻辑相当于把输入字符加 3 后和密文比较：

```
input[i] + 3 == enc[i]
```

所以每个密文字符减 3 就是原字符。解出来后得到：

```
flag{sh1ft_3ncrypt10n}
```

## rev05

这里 `check` 函数看起来有点绕，实际只做一件事：返回输入第 i 个字符。main 根据 i 的奇偶选择调用方式，最后还是拿返回值和数组逐项比较。

`cmp.0` 数组每项是一个 32 位整数，按小端读出后转成字符即可：

```
flag{junk_c0d3_1s_4nn0y1ng}
```

## rev06

main 把输入交给 `verify`，直接跟进去看。验证函数里能看到程序逐字节检查输入，正确字符串也能在数据区找到。用 strings 搜索 `flag{` 就能直接看到：

```
flag{gdb_1s_y0ur_fr13nd}
```

## rev07

这题的单字符变换是：

```
enc[i] = input[i] * 7 + 13
```

因为字符是 1 字节，运算会保留低 8 位。要反过来解，先减 13，再乘 7 在模 256 下的逆元 183：

```
input[i] = (enc[i] - 13) * 183 mod 256
```

解出来是：

```
flag{l1n34r_tr4nsf0rm4t10n}
```

## rev08

这题的比较逻辑被直接写成了几段常量比较，不过相邻的 8 字节可以按小端顺序读成字符串。在 rodata 里把这些片段拼起来，就能得到完整 flag：

```
flag{cust0m_b4s364_4lph4b3t}
```

## rev09

数组里存着每个字符的 ASCII 值，和 rev03、rev05 类似。按小端读出 27 个 32 位整数，再转成字符：

```
flag{upx_1s_34sy_t0_unp4ck}
```

## rev10

最后一题对每个输入字符先异或 `0x33`，再加 7，然后跟 enc 数组比较：

```
(input[i] ^ 0x33) + 7 == enc[i]
```

倒着算就是先减 7，再异或 `0x33`：

```
input[i] = (enc[i] - 7) ^ 0x33
```

得到：

```
flag{f1n4l_b0ss_0f_r3v3rs1ng}
```

把每个 flag 输入对应程序后，都能看到“恭喜你，答对了！”。
