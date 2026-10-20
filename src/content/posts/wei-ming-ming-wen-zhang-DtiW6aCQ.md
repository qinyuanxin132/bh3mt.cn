---
title: "Ultra Potato Xplosion"
slug: "wei-ming-ming-wen-zhang-DtiW6aCQ"
date: 2026-10-18
updated: 2026-10-18
published: true
categories: ["西电CTF_2026"]
tags: ["西电CTF_2026"]
---

# Ultra Potato Xplosion

> 发布于 2026-10-18 09:26:00

先脱壳

```
 upx -d /home/qinyuanxin132/Downloads/chall8 -o /home/qinyuanxin132/Downloads/chall8a
                       Ultimate Packer for eXecutables
                          Copyright (C) 1996 - 2026
UPX 5.2.0       Markus Oberhumer, Laszlo Molnar & John Reiser    Jun 8th 2026

        File size         Ratio      Format      Name
   --------------------   ------   -----------   -----------
     14544 <-      6940   47.72%   linux/amd64   chall8a

Unpacked 1 file.
```

然后寻找主函数

```
__int64 __fastcall main(int a1, char **a2, char **a3)
{
  size_t v4; // rax
  char v5[40]; // [rsp+0h] [rbp-130h] BYREF
  size_t n; // [rsp+28h] [rbp-108h] BYREF
  char s2[128]; // [rsp+30h] [rbp-100h] BYREF
  char s[128]; // [rsp+B0h] [rbp-80h] BYREF

  n = 0;
  strcpy(v5, "Fnrr68qUFDSTA5tupNAp8pgrFPJNesF3R6KNk");
  printf("Input flag: ");
  if ( fgets(s, 128, stdin) )
  {
    s[strcspn(s, "\n")] = 0;
    if ( (unsigned int)sub_401216(v5, s2, 128, &n) )
    {
      puts("Internal error!");
      return 0;
    }
    else
    {
      v4 = strlen(s);
      if ( v4 == n && !memcmp(s, s2, n) )
        puts("Correct!");
      else
        puts("Wrong!");
      return 0;
    }
  }
  else
  {
    puts("Wrong!");
    return 0;
  }
}
```

v5    可能是要加密的密文

我们直接看

sub_401216

把v5传给了a1

s2给了a2

```
__int64 __fastcall sub_401216(const char *a1, __int64 a2, unsigned __int64 a3, unsigned __int64 *a4)
{
  __int64 v5; // rax
  __int64 v6; // rax
  _BYTE s[140]; // [rsp+20h] [rbp-E0h] BYREF
  int v10; // [rsp+ACh] [rbp-54h]
  char *v11; // [rsp+B0h] [rbp-50h]
  unsigned __int64 v12; // [rsp+B8h] [rbp-48h]
  size_t v13; // [rsp+C0h] [rbp-40h]
  unsigned __int64 ii; // [rsp+C8h] [rbp-38h]
  unsigned __int64 n; // [rsp+D0h] [rbp-30h]
  __int64 v16; // [rsp+D8h] [rbp-28h]
  unsigned __int64 m; // [rsp+E0h] [rbp-20h]
  int k; // [rsp+E8h] [rbp-18h]
  int v19; // [rsp+ECh] [rbp-14h]
  size_t j; // [rsp+F0h] [rbp-10h]
  unsigned __int64 i; // [rsp+F8h] [rbp-8h]

  memset(s, 0, 0x80u);
  v13 = strlen(a1);
  for ( i = 0; a1[i] == 49; ++i )
    ;
  for ( j = 0; j < v13; ++j )
  {
    v11 = strchr("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", a1[j]);
    if ( !v11 )
      return 0xFFFFFFFFLL;
    v19 = v11 - "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    for ( k = 127; k >= 0; --k )
    {
      v10 = 58 * (unsigned __int8)s[k] + v19;
      s[k] = v10;
      v19 = v10 >> 8;
    }
    if ( v19 )
      return 0xFFFFFFFFLL;
  }
  for ( m = 0; m <= 0x7F && !s[m]; ++m )
    ;
  v12 = i - m + 128;
  if ( a3 < v12 )
    return 0xFFFFFFFFLL;
  v16 = 0;
  for ( n = 0; n < i; ++n )
  {
    v5 = v16++;
    *(_BYTE *)(a2 + v5) = 0;
  }
  for ( ii = m; ii <= 0x7F; ++ii )
  {
    v6 = v16++;
    *(_BYTE *)(v6 + a2) = s[ii];
  }
  *a4 = v12;
  return 0;
}
```

看着像base58

尝试解码

Fnrr68qUFDSTA5tupNAp8pgrFPJNesF3R6KNk

moectf{EaSy_UPX_anD_Base58}
