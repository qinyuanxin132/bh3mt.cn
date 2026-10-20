---
title: "ctfshow re2 wp"
slug: "ctfshow-re2-wp"
date: 2026-10-10
updated: 2026-10-10
published: true
categories: ["ctfshow wp"]
tags: ["ctfshow wp"]
---

# ctfshow re2 wp

> 发布于 2026-10-10 05:12:47

```
int __cdecl main_0(int argc, const char **argv, const char **envp)
{
  char v4; // [esp+0h] [ebp-44Ch]
  char v5; // [esp+0h] [ebp-44Ch]
  char v6; // [esp+0h] [ebp-44Ch]
  char v7; // [esp+0h] [ebp-44Ch]
  char v8; // [esp+0h] [ebp-44Ch]
  char v9; // [esp+0h] [ebp-44Ch]
  char v10[4]; // [esp+194h] [ebp-2B8h] BYREF
  int pan_duan; // [esp+1A0h] [ebp-2ACh]
  FILE *v_put; // [esp+1ACh] [ebp-2A0h]
  FILE *v_in; // [esp+1B8h] [ebp-294h]
  _BYTE v14[264]; // [esp+1C4h] [ebp-288h] BYREF
  _BYTE v15[264]; // [esp+2CCh] [ebp-180h] BYREF
  char Str1[60]; // [esp+3D4h] [ebp-78h] BYREF
  char Str[56]; // [esp+410h] [ebp-3Ch] BYREF

  __CheckForDebuggerJustMyCode(&unk_40B027);
  memset(Str, 0, 50);
  memset(Str1, 0, 50);
  memset(v15, 0, 0x100u);
  memset(v14, 0, 0x100u);
  pan_duan = 1;
  do
  {
    mayprintf(asc_406BA0, v4);
    mayprintf((char *)&byte_406BFC, v5);
    mayprintf(asc_406C48, v6);
    mayprintf((char *)&byte_406CA8, v7);
    mayprintf((char *)&byte_406D0C, v8);
    mayprintf(a1, v9);
    sub_401073("%d", (char)v10);
    if ( *(_DWORD *)v10 == 1 )
    {
      v_in = fopen("flag.txt", "r");
      if ( !v_in )
      {
        mayprintf((char *)&byte_406D48, v4);
        getchar();
        exit(0);
      }
      v_put = fopen("enflag.txt", "w");
      if ( !v_put )
      {
        mayprintf((char *)&byte_406D70, v4);
        getchar();
        exit(0);
      }
      mayprintf(asc_406D84, v4);
      sub_401073("%s", (char)Str);
      sub_401069(Str, Str1);
      sub_401028(Str, v15, v14, v_in, v_put);
    }
    else if ( *(_DWORD *)v10 == 2 )
    {
      pan_duan = 0;
    }
    else
    {
      mayprintf(asc_406D98, v4);
    }
  }
  while ( pan_duan );
  return 0;
}
```

这串代码大概是有一个flag.txt（没给），读取

然后要了enflag.txt的写入
enflag.txt给了，加密的

所以我们判断这个程序是对flag.txt进行加密然后给enflag

接着我们要找加密算法

对于函数sub_401028

我们发现它同时有用v_in和v_put，猜测它是加密算法

```
// attributes: thunk
int __cdecl sub_401028(int a1, int a2, int a3, int a4, int a5)
{
  return sub_4014E0(a1, a2, a3, a4, a5);
}
```

定义了a1,a2,a3,a4,a5后发送给了sub_4014E0函数

对应上，a4是输入，a5是输出

打开4014E0

```
int __cdecl sub_4014E0(char *Str, int a2, int a3, FILE *Stream, FILE *a5)
{
  char v6; // [esp+0h] [ebp-D8h]
  size_t v7; // [esp+D0h] [ebp-8h]

  __CheckForDebuggerJustMyCode(&unk_40B027);
  v7 = strlen(Str);
  sub_4010F0(a2, Str, v7);
  sub_4010C8(a3);
  sub_40116D(a3, a2);
  sub_4010EB(a3, Stream, a5);
  fclose(Stream);
  fclose(a5);
  return mayprintf(asc_406B34, v6);
}
```

对应上输入：FILE *Stream 输出：FILE *a5
