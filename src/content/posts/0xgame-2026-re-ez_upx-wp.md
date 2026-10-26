---
title: "0xGame 2026 Re ez_upx wp"
slug: "0xgame-2026-re-ez_upx-wp"
date: 2026-09-29
updated: 2026-10-17
published: true
categories: ["0xGame"]
tags: ["0xGame"]
---

# 0xGame 2026 Re ez_upx wp

> 发布于 2026-09-29 06:52:00

使用DIE查看

*语言: C/C++*

*打包工具: UPX(5.02)[LZMA,brute]*

尝试使用UPX脱壳

在装好upx并配好环境变量后

```
upx -d attachment1.exe -o unpacked.exe
```

`-d`：**decompress（解压缩/脱壳）**。
告诉 UPX 当前要执行的是“解压”操作，也就是去掉壳，把程序还原成原始状态。如果没有这个参数，UPX 默认是去“压缩”文件。

`-o`：**output（输出文件）**。
指定脱壳后的新文件名。如果你不加 `-o unpacked.exe`，UPX 可能会直接覆盖你原来的

```
D:\MoeCTF.RE.Tools\temp>upx -d attachment1.exe -o unpacked.exe
                       Ultimate Packer for eXecutables
                          Copyright (C) 1996 - 2026
UPX 5.2.1       Markus Oberhumer, Laszlo Molnar & John Reiser   Aug 27th 2026

        File size         Ratio      Format      Name
   --------------------   ------   -----------   -----------
     17408 <-     10752   61.76%    win64/pe     unpacked.exe

Unpacked 1 file.
```

将unpacked.exe拖入ida

```
int __fastcall main(int argc, const char **argv, const char **envp)
{
  FILE *v3; // rax
  FILE *v4; // rax
  char Buffer[136]; // [rsp+20h] [rbp-90h] BYREF
  size_t v7; // [rsp+A8h] [rbp-8h]

  sub_401A70(argc, argv, envp);
  SetConsoleOutputCP(0xFDE9u);
  printf("Input flag: ");
  v3 = (FILE *)off_404070();
  fflush(v3);
  v4 = (FILE *)off_404070();
  if ( fgets(Buffer, 128, v4) )
  {
    v7 = strcspn(Buffer, "\r\n");
    Buffer[v7] = 0;
    if ( (unsigned int)sub_40184A(Buffer) )
      puts("Correct! Welcome to reverse engineering.");
    else
      puts("Wrong flag. Try again!");
    puts("Press Enter to exit...");
    getchar();
    return 0;
  }
  else
  {
    puts("Input error.");
    return 1;
  }
}
```

逻辑很清晰：读取用户输入，去掉换行符后交给 `sub_40184A` 校验。若返回非 0 则输出 `Correct!`，否则输出 `Wrong flag. Try again!`。

跟进 `sub_40184A`，反编译如下：

```
_BOOL8 __fastcall sub_40184A(const char *a1)
{
  char Str1[48]; // [rsp+20h] [rbp-50h] BYREF
  _BYTE v3[32]; // [rsp+50h] [rbp-20h] BYREF

  if ( strlen(a1) != 29 )
    return 0;
  sub_401550(a1, v3, 29);
  return sub_4015C7(v3, 29, Str1) == 40 && strcmp(Str1, "RhExDlhVDSdGGEJHKRBGGmpbGFkBMGBgLkhXTkg=") == 0;
}
```

关键点：

- **长度校验**：输入字符串长度必须为 `29`。

- **第一次处理**：`sub_401550(a1, v3, 29)`，将输入 `a1` 处理后存入 `v3`。

- **第二次处理**：`sub_4015C7(v3, 29, Str1)`，将 `v3` 处理后存入 `Str1`，返回值必须为 `40`。

- **最终比较**：`Str1` 必须与字符串 `"RhExDlhVDSdGGEJHKRBGGmpbGFkBMGBgLkhXTkg="` 完全相同。

返回值 `40` 和密文末尾的 `=` 提示我们：`sub_4015C7` 很可能是 **Base64 编码**。因为 29 字节的数据经过 Base64 编码后，长度正好是 `ceil(29/3)*4 = 40`。

跟进 `sub_401550`，反编译如下：

```
unsigned __int64 __fastcall sub_401550(__int64 a1, __int64 a2, unsigned __int64 a3)
{
  unsigned __int64 result; // rax
  unsigned __int64 i; // [rsp+8h] [rbp-8h]

  for ( i = 0; ; ++i )
  {
    result = i;
    if ( i >= a3 )
      break;
    *(_BYTE *)(a2 + i) = aVivo50[i % 6] ^ *(_BYTE *)(a1 + i);
  }
  return result;
}
```

这段代码就是**循环异或**：

- `a1` 是输入字符串，`a2` 是输出缓冲区，`a3` 是长度（29）。

- 循环中，`aVivo50[i % 6]` 表示密钥 `aVivo50` 循环使用，索引为 `i % 6`。

- 在 IDA 中，`aVivo50` 是字符串 `"vivo50"` 的自动命名（因为该字符串在数据段中）。密钥长度为 6。

- 每个字节：`输出[i] = 输入[i] ^ 密钥[i % 6]`。

因此，整个加密流程为：

text

```
输入 flag (29字节)
  -> 循环异或密钥 "vivo50"
  -> Base64 编码
  -> 得到密文 "RhExDlhVDSdGGEJHKRBGGmpbGFkBMGBgLkhXTkg="
```

## **六、逆向解密获取 flag**

既然已知加密流程，解密就是逆过程：

- 对密文进行 **Base64 解码**。

- 对解码后的字节进行 **循环异或**，密钥为 `"vivo50"`。

Python 脚本如下：

python

```
import base64

cipher_b64 = "RhExDlhVDSdGGEJHKRBGGmpbGFkBMGBgLkhXTkg="
key = b"vivo50"

# 1. Base64 解码
cipher = base64.b64decode(cipher_b64)

# 2. 循环异或解密
flag = bytes(c ^ key[i % len(key)] for i, c in enumerate(cipher))

print(flag.decode())
```

运行脚本，得到：

text

```
0xGame{N0www_y0u_kn0w_UPX!!!}
```

## **七、总结**

本题是一道典型的 **UPX 压缩壳 + 简单加密** 逆向题。
解题步骤：

- 使用 DIE 识别 UPX 壳，用 `upx -d` 一键脱壳。

- IDA 静态分析，定位 `main` -> `sub_40184A`。

- 分析出加密逻辑：`循环异或 "vivo50"` + `Base64 编码`。

- 逆向操作：`Base64 解码` + `循环异或 "vivo50"`，得到 flag。

最终 flag：

text

```
0xGame{N0www_y0u_kn0w_UPX!!!}
```
