---
title: "CTF² 不一样的flag wp"
slug: "ctf2-bu-yi-yang-de-flag-wp"
date: 2026-10-13
updated: 2026-10-13
published: true
categories: ["ctf2"]
tags: ["ctf2"]
---

# CTF² 不一样的flag wp

> 发布于 2026-10-13 00:27:47

DIE发现每套壳

直接IDA

```
int __cdecl __noreturn main(int argc, const char **argv, const char **envp)
{
  char v3[29]; // [esp+17h] [ebp-35h] BYREF
  int v4; // [esp+34h] [ebp-18h]
  int v5; // [esp+38h] [ebp-14h] BYREF
  int i; // [esp+3Ch] [ebp-10h]
  _BYTE v7[12]; // [esp+40h] [ebp-Ch] BYREF

  __main();
  v3[26] = 0;
  *(_WORD *)&v3[27] = 0;
  v4 = 0;
  strcpy(v3, "*11110100001010000101111#");
  while ( 1 )
  {
    puts("you can choose one action to execute");
    puts("1 up");
    puts("2 down");
    puts("3 left");
    printf("4 right\n:");
    scanf("%d", &v5);
    if ( v5 == 2 )
    {
      ++*(_DWORD *)&v3[25];
    }
    else if ( v5 > 2 )
    {
      if ( v5 == 3 )
      {
        --v4;
      }
      else
      {
        if ( v5 != 4 )
LABEL_13:
          exit(1);
        ++v4;
      }
    }
    else
    {
      if ( v5 != 1 )
        goto LABEL_13;
      --*(_DWORD *)&v3[25];
    }
    for ( i = 0; i <= 1; ++i )
    {
      if ( *(_DWORD *)&v3[4 * i + 25] > 4u )
        exit(1);
    }
    if ( v7[5 * *(_DWORD *)&v3[25] - 41 + v4] == 49 )
      exit(1);
    if ( v7[5 * *(_DWORD *)&v3[25] - 41 + v4] == 35 )
    {
      puts("\nok, the order you enter is the flag!");
      exit(0);
    }
  }
}
```

strcpy ：把第二个参数复制给第一个参数

v3 = *11110100001010000101111#

猜测是个迷宫

v7[5 * 行坐标 - 41 + 列坐标]

踩到1就会退出      exit(1);

踩到#就会成功

根据乘五

我们猜测是5*5的迷宫

```
*1111
01000
01010
00010
1111#
```

```
you can choose one action to execute
1 up
2 down
3 left
4 right
:
```

222441144222
