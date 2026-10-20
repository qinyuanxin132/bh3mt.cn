---
title: "CTF² 新年快乐 wp"
slug: "ctf2-xin-nian-kuai-le-wp"
date: 2026-10-13
updated: 2026-10-13
published: true
categories: ["ctf2"]
tags: ["ctf2"]
---

# CTF² 新年快乐 wp

> 发布于 2026-10-13 01:01:00

```
打包工具: UPX(3.91)[NRV,best]
```

那我们尝试解包

```
upx -d 新年快乐.exe -o 新年快乐a.exe
```

解包成功

```
                       Ultimate Packer for eXecutables
                          Copyright (C) 1996 - 2026
UPX 5.2.1       Markus Oberhumer, Laszlo Molnar & John Reiser   Aug 27th 2026

        File size         Ratio      Format      Name
   --------------------   ------   -----------   -----------
     27807 <-     21151   76.06%    win32/pe     新年快乐a.exe

Unpacked 1 file.
```

拖入IDA

```
int __cdecl main(int argc, const char **argv, const char **envp)
{
  char Str2[14]; // [esp+12h] [ebp-3Ah] BYREF
  char Str1[44]; // [esp+20h] [ebp-2Ch] BYREF

  __main();
  strcpy(Str2, "HappyNewYear!");
  memset(Str1, 0, 32);
  printf("please input the true flag:");
  scanf("%s", Str1);
  if ( !strncmp(Str1, Str2, strlen(Str2)) )
    return puts("this is true flag!");
  else
    return puts("wrong!");
}
```

直接解出来了
