---
title: "汇编语言学习 #4 手记"
slug: "hui-bian-yu-yan-xue-xi-4"
date: 2026-11-10
updated: 2026-11-10
published: true
categories: ["汇编语言学习"]
tags: ["汇编语言学习", "CTF", "Reverse", "x86-64", "GDB", "pwndbg"]
---

Reverse Stage 02 · 未知 ELF 逆向

`main:`
```c
__int64 __fastcall main(int a1, char **a2, char **a3)
{
  if ( a1 == 2 )
  {
    if ( (unsigned int)sub_401200(a2[1]) )
    {
      puts("Access granted.");
      return 0;
    }
    else
    {
      puts("Access denied.");
      return 1;
    }
  }
  else
  {
    fwrite("Usage: ./challenge '<candidate>'\n", 1u, 0x21u, stderr);
    return 2;
  }
}
```

`sub_401200:`

```c
__int64 __fastcall sub_401200(const char *a1)
{
  size_t v2; // rdx
  __int64 result; // rax
  int v4; // r8d
  char v5; // di
  __int64 v6; // rdx
  int v7; // esi
  int v8; // eax

  v2 = strlen(a1);
  result = 0;
  if ( v2 == 16 )
  {
    v4 = 0;
    v5 = 3;
    v6 = 0;
    v7 = 109;
    while ( 1 )
    {
      v8 = (unsigned __int8)(a1[v6] ^ b1[v5 & 0xF]) + v7 + v4 + 11;
      LOBYTE(v8) = __ROL1__((a1[v6] ^ b1[v5 & 0xF]) + v7 + v4 + 11, (v6 & 3) + 1);
      if ( b2[v6] != (_BYTE)v8 )
        break;
      ++v6;
      v5 += 5;
      v4 += 7;
      v7 = (v8 ^ v7) + 41;
      if ( v6 == 16 )
        return 1;
    }
    return 0;
  }
  return result;
}
```

`数组`
```c
.rodata:0000000000402060 byte_402060     db 2Dh                  ; DATA XREF: sub_401200+45↑r
.rodata:0000000000402061                 db  73h ; s
.rodata:0000000000402062                 db  90h
.rodata:0000000000402063                 db  14h
.rodata:0000000000402064                 db 0BEh
.rodata:0000000000402065                 db  68h ; h
.rodata:0000000000402066                 db 0C1h
.rodata:0000000000402067                 db  3Ah ; :
.rodata:0000000000402068                 db  57h ; W
.rodata:0000000000402069                 db 0E4h
.rodata:000000000040206A                 db  0Bh
.rodata:000000000040206B                 db  85h
.rodata:000000000040206C                 db 0F2h
.rodata:000000000040206D                 db  49h ; I
.rodata:000000000040206E                 db 0ADh
.rodata:000000000040206F                 db  16h

.rodata:0000000000402050 byte_402050     db 0BDh                 ; DATA XREF: sub_401200+60↑r
.rodata:0000000000402051                 db 0BDh
.rodata:0000000000402052                 db  2Eh ; .
.rodata:0000000000402053                 db 0B5h
.rodata:0000000000402054                 db  0Fh
.rodata:0000000000402055                 db 0BFh
.rodata:0000000000402056                 db  20h
.rodata:0000000000402057                 db  79h ; y
.rodata:0000000000402058                 db  2Ch ; ,
.rodata:0000000000402059                 db 0F9h
.rodata:000000000040205A                 db  74h ; t
.rodata:000000000040205B                 db 0B1h
.rodata:000000000040205C                 db  15h
.rodata:000000000040205D                 db 0BCh
.rodata:000000000040205E                 db  9Fh
.rodata:000000000040205F                 db  76h ; v
```
尝试先正向写出python脚本

```python
b1 = [0x2D,0x73,0x90,0x14,0xBE,0x68,0xC1,0x3A,0x57,0xE4,0x0B,0x85,0xF2,0x49,0xAD,0x16]
b2 = [0xBD,0xBD,0x2E,0xB5,0x0F,0xBF,0x20,0x79,0x2C,0xF9,0x74,0xB1,0x15,0xBC,0x9F,0x76]
inpu = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
v2 = 16
v4 = 0
v5 = 3
i = 0
v7 = 109
while i < 16:
    v8 = ((inpu[i] ^ b1[v5 & 0xf]) + v7 +v4 +11)&0xff
    d =(i & 3) + 1
    v8_l = ((v8 << d) & 0xff) | ((v8 >> (8 - d)) & 0xff)
    v8 = (v8 & ~0xFF) | (v8_l & 0xFF)
    此时 b2[i] = v8
    v5 += 5
    v4 += 7
    v7 = (b2[i] ^ v7) + 41
    i += 1
```

尝试写逆向脚本

```python
b1 = [0x2D,0x73,0x90,0x14,0xBE,0x68,0xC1,0x3A,0x57,0xE4,0x0B,0x85,0xF2,0x49,0xAD,0x16]
b2 = [0xBD,0xBD,0x2E,0xB5,0x0F,0xBF,0x20,0x79,0x2C,0xF9,0x74,0xB1,0x15,0xBC,0x9F,0x76]
inpu = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
#经历16轮，v4 = 112,v5 = 83,i = 16
v4 = 112
v5 = 83
i = 16
#算v7
v7 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
n = 0
while n < 16:
  if n == 0:
      v7[0] = 109
  else:
      v7[n] = (b2[n-1] ^ v7[n-1]) + 41
  n += 1
#经运算得到
#v7 = [109, 249, 109, 108, 258, 310, 434, 443, 491, 496, 306, 367, 519, 571, 688, 600]

while i > 0 :
    i -= 1
    v7_ = v7[i]
    v4 -= 7
    v5 -= 5
    v8 = b2[i]
    d = (i & 3) + 1
    v8_l = v8 & 0xff
    v8_l = ((v8 >> d) & 0xff) | ((v8 << (8 - d)) & 0xff)
    v8 = (v8 & ~0xFF) | (v8_l & 0xFF)
    inpu[i] = ((v8 - 11 - v7_ - v4) & 0xff) ^ b1[v5 & 0xf]
print(inpu)
```

得到
[114, 51, 118, 95, 100, 121, 110, 97, 109, 105, 99, 95, 50, 48, 50, 54]
正确
