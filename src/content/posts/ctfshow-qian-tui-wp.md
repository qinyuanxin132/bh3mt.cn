---
title: "ctfshow 签退 wp"
slug: "ctfshow-qian-tui-wp"
date: 2026-10-12
updated: 2026-10-12
published: true
categories: ["ctfshow wp"]
tags: ["ctfshow wp"]
---

# ctfshow 签退 wp

> 发布于 2026-10-12 12:28:00

pyc文件，直接用pyinstxtractor

得到py

```
# Source Generated with Decompyle++
# File: re3.pyc (Python 2.7)

import string
c_charset = string.ascii_uppercase + string.ascii_lowercase + string.digits + '()'
flag = 'BozjB3vlZ3ThBn9bZ2jhOH93ZaH9'

def encode(origin_bytes):
    c_bytes = [ '{:0>8}'.format(str(bin(b)).replace('0b', '')) for b in origin_bytes ]
    resp = ''
    nums = len(c_bytes) // 3
    remain = len(c_bytes) % 3
    integral_part = c_bytes[0:3 * nums]
    for x in [
        0,
        6,
        12,
        18]:
        tmp_unit = [][int(tmp_unit[x:x + 6], 2)]
        resp += ''.join([ c_charset[i] for i in tmp_unit ])
        integral_part = integral_part[3:]
    if remain:
        remain_part = ''.join(c_bytes[3 * nums:]) + (3 - remain) * '0' * 8
        tmp_unit = [ int(remain_part[x:x + 6], 2) for x in [
            0,
            6,
            12,
            18] ][:remain + 1]
        resp += ''.join([ c_charset[i] for i in tmp_unit ]) + (3 - remain) * '.'
    return rend(resp)

def rend(s):
    
    def encodeCh(ch):
        
        f = lambda x: chr(((ord(ch) - x) + 2) % 26 + x)
        if ch.islower():
            return f(97)
        if (None,).isupper():
            return f(65)

    return (''.join,)((lambda .0: pass)(s))
```

上面是base64，下面还有凯撒

码表是一对变量拼起来的

```
c_charset = string.ascii_uppercase + string.ascii_lowercase + string.digits + '()'
```

拼出来等价

c_charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789()"

写个python程序解码base64+凯撒

```
import base64

def shift_back(s, shift=2):
    res = ''
    for ch in s:
        if 'a' <= ch <= 'z':
            res += chr((ord(ch) - ord('a') - shift) % 26 + ord('a'))
        elif 'A' <= ch <= 'Z':
            res += chr((ord(ch) - ord('A') - shift) % 26 + ord('A'))
        else:
            res += ch  # 数字和括号原样保留
    return res

enc_str = 'BozjB3vlZ3ThBn9bZ2jhOH93ZaH9'
step1 = shift_back(enc_str, 2)
print("凯撒-2后:", step1)

custom_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789()"
std_alphabet    = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

trans_table = str.maketrans(custom_alphabet, std_alphabet)
step2 = step1.translate(trans_table)

# 补齐 '='
padding = (4 - len(step2) % 4) % 4
step2 += '=' * padding
print("标准Base64:", step2)

try:
    decoded = base64.b64decode(step2)
    print("解码(Hex):", decoded.hex())
    print("解码(文本):", decoded.decode('utf-8', errors='ignore'))
except Exception as e:
    print("失败:", e)
```

得出

flag{c_t_f_s_h_0_w_!}
