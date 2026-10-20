---
title: "CTF² XOR wp"
slug: "ctf2-xor-wp"
date: 2026-10-13
updated: 2026-10-13
published: true
categories: ["ctf2"]
tags: ["ctf2"]
---

# CTF² XOR wp

> 发布于 2026-10-13 02:53:00

IDA

```
int __fastcall main(int argc, const char **argv, const char **envp)
{
  int i; // [rsp+2Ch] [rbp-124h]
  char __b[264]; // [rsp+40h] [rbp-110h] BYREF

  memset(__b, 0, 0x100u);
  printf("Input your flag:\n");
  get_line(__b, 256);
  if ( strlen(__b) != 33 )
    goto LABEL_7;
  for ( i = 1; i < 33; ++i )
    __b[i] ^= __b[i - 1];
  if ( !strncmp(__b, global, 0x21u) )
    printf("Success");
  else
LABEL_7:
    printf("Failed");
  return 0;
}
```

_b应该是个字符串数组

```
  for ( i = 1; i < 33; ++i )
    __b[i] ^= __b[i - 1];
```

这是典型的 流式异或加密（CBC 模式的变种），也叫链式异或

因为 b[i] 异或了 b[i-1]，而 __b[i-1] 在还原之前还是“加密后”的状态，所以必须从后往前还原。

查看b_的值

```
__data:0000000100001050 _global         dq offset aFKWOXZUPFVMDGH
```

```
__cstring:0000000100000F6E aFKWOXZUPFVMDGH db 'f',0Ah              ; DATA XREF: __data:_global↓o
__cstring:0000000100000F70                 db 'k',0Ch,'w&O.@',11h,'x',0Dh,'Z;U',11h,'p',19h,'F',1Fh,'v"M#D',0Eh,'g'
__cstring:0000000100000F89                 db 6,'h',0Fh,'G2O',0
```

它是一个字节数组，不是给人看的字符串

```
b = [ord('f'), 0x0A, ord('k'), 0x0C, ord('w'), ord('&'), ord('O'), ord('.'), ord('@'), 0x11, ord('x'), 0x0D, ord('Z'), ord(';'), ord('U'), 0x11, ord('p'), 0x19, ord('F'), 0x1F, ord('v'), ord('"'), ord('M'), ord('#'), ord('D'), 0x0E, ord('g'), 6, ord('h'), 0x0F, ord('G'), ord('2'), ord('O'), 0]
for i in range(len(b) - 1, 0, -1):
    b[i] ^= b[i - 1]
print(bytes(b))
```

得出

flag{QianQiuWanDai_YiTongJiangHu}O

多出来的O很奇怪，但flag对了

flag{QianQiuWanDai_YiTongJiangHu}
