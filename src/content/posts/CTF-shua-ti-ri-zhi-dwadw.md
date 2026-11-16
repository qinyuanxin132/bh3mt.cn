---
title: "《CTF Reverse 刷题日志｜从基础校验到算法逆向》"
slug: "CTF-shua-ti-ri-zhi-dwadw"
date: 2026-11-15
updated: 2026-11-15
published: true
categories: [""]
tags: [""]
---

# 《CTF Reverse 刷题日志｜从基础校验到算法逆向》

> 发布于 2026-11-15 16-19-46

```
Level 1 → Level 2
6 道真题 · 由易到难 · 独立分析训练

适合当前阶段

01	nasm crack
https://crackmes.one/download/crackme/5ea48a1433c5d47611746436?utm_source=chatgpt.com
难度 1.0 · 汇编与输入校验	下载 ZIP
02	Plain sight
https://crackmes.one/download/crackme/6513567328b5870bef263329?utm_source=chatgpt.com
难度 1.1 · IDA 导航、查找校验	下载 ZIP
03	PieIsMyFav
https://crackmes.one/download/crackme/5c11e1f333c5d41e58e00579?utm_source=chatgpt.com
难度 1.0 · 算术判断与汇编阅读	下载 ZIP
04	simple XOR crackme
https://crackmes.one/download/crackme/6946be18523504d8c842eb7e?utm_source=chatgpt.com
难度 1.9 · 输入校验、字节处理	下载 ZIP
05	jumpjumpjump
https://crackmes.one/download/crackme/5c1a939633c5d41e58e005d1?utm_source=chatgpt.com
难度 2.0 · 控制流与条件分析	下载 ZIP
06	ComputeTheKey
https://crackmes.one/download/crackme/6a53f2cb055757d3df60fcd4?utm_source=chatgpt.com
难度 2.3 · 综合静态逆向	下载 ZIP

题目及对应平台、架构、难度已根据 Crackmes.one 的题目页面核对。
Crackmes.one 的压缩包统一密码是：
crackmes.one
```

# 第一题

尝试运行

```fish
 /home/qinyuanxin132/Downloads/5ea48a1433c5d47611746436/nasm_crack
Enter your password: dawd
Wrong!
```

这个应该是密码效验题，打开IDA

反编译后

```c
if ( memcmp((const void *)0x402031, &passwd, 0xBu) )
```

这个就是效验，直接看&passwd

```
.data:0000000000402026 passwd          db  73h ; s             ; DATA XREF: _start+36↑o
.data:0000000000402027                 db  75h ; u
.data:0000000000402028                 db  70h ; p
.data:0000000000402029                 db  65h ; e
.data:000000000040202A                 db  72h ; r
.data:000000000040202B                 db  73h ; s
.data:000000000040202C                 db  65h ; e
.data:000000000040202D                 db  63h ; c
.data:000000000040202E                 db  72h ; r
.data:000000000040202F                 db  65h ; e
.data:0000000000402030                 db  74h ; t
```

```
 /home/qinyuanxin132/Downloads/5ea48a1433c5d47611746436/nasm_crack
Enter your password: supersecret
Correct!
```

完成

# 第二题

![alt text](image-15.png)

```
 /home/qinyuanxin132/Downloads/6513567328b5870bef263329/plain_sight
Enter the password: dwadw
Wrong password!
```

又是密码效验

