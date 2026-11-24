---
title: "TDCTF 2026 Misc wp"
slug: "tdctf-2026-misc-wp"
date: 2026-11-23
updated: 2026-11-23
published: false
categories: ["CTF Writeup"]
tags: ["TDCTF 2026", "Misc"]
---

# TDCTF 2026 Misc wp

> 发布于 2026-11-23 06:25:00

这次校赛的 10 道杂项题，基本覆盖了常见的入门考点，记录一下做法。

### misc01_yuanhui.txt

拿到是个 `.txt` 文件，老规矩先用 `file` 看一下真实类型：

```
misc01_yuanhui.txt: PNG image data, 200 x 200, 8-bit/color RGB, non-interlaced
```

实际上是一张 PNG 图片，顺手 `head` 看了一眼文件头，直接在 PNG 的 `tEXtComment` 块里看到 flag 了。

flag{yuanhu1_f1l3_h34d3r}

### misc02_strings.bin

未知二进制文件，先丢 `strings` 搜一波：

```
strings misc02_strings.bin
```

直接打印出明文 flag。

flag{str1ngs_1s_y0ur_fr13nd}

### misc03_yuanhui_exif.jpg

一张 jpg 图片，`file` 或者 `exiftool` 看一下元数据，Exif 的 `description` 里直接写着 flag：

```
description=flag{yuanhu1_3x1f_m3t4d4t4}
```

flag{yuanhu1_3x1f_m3t4d4t4}

### misc04_zip.zip

里面有个 `flag.txt`，解压要密码。看了一下是传统 ZipCrypto 加密，直接拿 Python 跑一下常见弱口令：

```python
import zipfile

zf = zipfile.ZipFile("misc04_zip.zip")
for pwd in [b"123456", b"12345", b"1234", b"password", b"tdctf2026"]:
    try:
        print(pwd, zf.read("flag.txt", pwd=pwd))
        break
    except Exception:
        pass
```

密码是 `12345`，直接解出。

flag{z1p_p4ssw0rd_brut3f0rc3}

### misc05_pseudo.zip

看名字 `pseudo` 就知道是伪加密了。

检查了一下本地文件头（`PK\x03\x04`）和中央目录（`PK\x01\x02`）的加密标志位，本地文件头是 `0x01`，中央目录是 `0x00`，把标志位清零再解压就行：

```python
import zipfile

data = bytearray(open("misc05_pseudo.zip", "rb").read())
i = 0
while i < len(data) - 10:
    if data[i:i + 4] == b"PK\x03\x04":
        data[i + 6] &= ~1
    elif data[i:i + 4] == b"PK\x01\x02":
        data[i + 8] &= ~1
    i += 1

open("misc05_fixed.zip", "wb").write(data)
with zipfile.ZipFile("misc05_fixed.zip") as zf:
    print(zf.read("flag.txt").decode())
```

flag{z1p_p53ud0_3ncrypt10n}

### misc06_traffic.pcap

才 303 字节的小流量包，直接拿 Wireshark 打开或者 `strings` 就能看到里面的 HTTP 明文请求和响应：

```
GET /flag.txt HTTP/1.1
Host: tdctf.local

HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 29

flag{http_cl34r_t3xt_1n_pc4p}
```

flag{http_cl34r_t3xt_1n_pc4p}

### misc07_yuanhui_lsb.png

文件名提示 `lsb`，用 Python 的 `PIL` 把 RGB 三个通道的最低位分别抽出来看看，在 **R 通道** 开头直接就出 flag 了：

```python
from PIL import Image

img = Image.open("misc07_yuanhui_lsb.png")
bits = [p[0] & 1 for p in img.getdata()]
data = bytes(
    sum(bits[i + j] << (7 - j) for j in range(8))
    for i in range(0, len(bits) - 7, 8)
)
print(data[:30])
```

flag{yuanhu1_lsb_st3g4n0}

### misc08_yuanhui_concat.png

文件名提示 `concat`，经典图种。找 PNG 结尾标志 `IEND`，发现后面拼着一个 `PK\x03\x04` 开头的 ZIP 文件，里面是个 `secret.txt`，直接读出来就行。

flag{yuanhu1_c0nc4t3n4t10n}

### misc09_encoded.txt

和 crypto01 一样的套娃，文件内容是十六进制，按 Hex -> Base32 -> Base64 顺序解三层：

```python
import base64

s = open("misc09_encoded.txt").read().strip()
print(base64.b64decode(base64.b32decode(bytes.fromhex(s))).decode())
```

flag{3nc0d1ng_m4tr0shk4}

### misc10_secret.docx

`.docx` 本质上就是个 ZIP 压缩包。解压或者用 Python 的 `zipfile` 打开，看 `word/document.xml`，flag 藏在最后的 XML 注释里：

```xml
<!-- flag{d0cx_1s_ju5t_4_z1p} -->
```

flag{d0cx_1s_ju5t_4_z1p}
