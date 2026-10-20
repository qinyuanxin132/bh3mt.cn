---
title: "西电CTF 2026  bbxor"
slug: "xi-dian-ctf-2026-bbxor"
date: 2026-10-17
updated: 2026-10-17
published: true
categories: ["西电CTF_2026"]
tags: ["西电CTF_2026"]
---

# 西电CTF 2026  bbxor

> 发布于 2026-10-17 09:35:15

```
int __fastcall main(int argc, const char **argv, const char **envp)
{
  _DWORD v4[38]; // [rsp+0h] [rbp-A0h]
  int j; // [rsp+98h] [rbp-8h]
  int i; // [rsp+9Ch] [rbp-4h]

  printf("Input: ");
  for ( i = 0; i <= 35; ++i )
    __isoc99_scanf("%d");
  for ( j = 0; j <= 35; ++j )
  {
    if ( (v4[j] ^ 0x66) != cipher[j] )
    {
      printf("no");
      return 0;
    }
  }
  printf("yes");
  return 0;
}
```

非常简单的逻辑

v4[j] ^ 0x66) != cipher[j]

v4跟 0x66异或然后跟cipher比较

^在C语言中是异或的意思

```
.data:0000000000404040 cipher          dd 0Bh, 9, 3, 5, 12h, 0, 1Dh, 24h, 52h, 15h, 0Fh, 5, 39h
.data:0000000000404040                                         ; DATA XREF: main+88↑o
.data:0000000000404074                 dd 1Eh, 56h, 14h, 39h, 5, 0Eh, 7, 57h, 0Ah, 3, 8, 1, 3
.data:00000000004040A8                 dd 39h, 15h, 9, 0Ah, 10h, 3, 2, 2 dup(47h), 1Bh
```

```
[0x0B,0x09,0x03,0x05,0x12,0x00,0x1D,0x24,0x52,0x15,0x0F,0x05,0x39,
0x1E,0x56,0x14,0x39,0x05,0x0E,0x07,0x57,0x0A,0x03,0x08,0x01,0x03,
0x39,0x15,0x09,0x0A,0x10,0x03,0x02,0x47,0x47,0x1B]
```

异或过去我们再异或一遍0x66

```
#include <stdio.h>
main()
{
    int a[] = {0x0B,0x09,0x03,0x05,0x12,0x00,0x1D,0x24,0x52,0x15,0x0F,0x05,0x39,
           0x1E,0x56,0x14,0x39,0x05,0x0E,0x07,0x57,0x0A,0x03,0x08,0x01,0x03,
           0x39,0x15,0x09,0x0A,0x10,0x03,0x02,0x47,0x47,0x1B};
    int b[36];
    for (int i = 0; i <= 35; ++i)
    {
        b[i] = a[i] ^ 0x66;
        printf("%c",b[i]);
    }
}
```

moectf{B4sic_x0r_cha1lenge_solved!!}
