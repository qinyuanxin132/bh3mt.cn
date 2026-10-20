---
title: "CTF² reverse2 wp"
slug: "ctf2"
date: 2026-10-13
updated: 2026-10-13
published: true
categories: ["ctf2"]
tags: ["ctf2"]
---

# CTF² reverse2 wp

> 发布于 2026-10-13 00:38:00

```
int __fastcall main(int argc, const char **argv, const char **envp)
{
  int stat_loc; // [rsp+4h] [rbp-3Ch] BYREF
  int i; // [rsp+8h] [rbp-38h]
  __pid_t pid; // [rsp+Ch] [rbp-34h]
  char s2[24]; // [rsp+10h] [rbp-30h] BYREF
  unsigned __int64 v8; // [rsp+28h] [rbp-18h]

  v8 = __readfsqword(0x28u);
  pid = fork();
  if ( pid )
  {
    waitpid(pid, &stat_loc, 0);
  }
  else
  {
    for ( i = 0; i <= strlen(flag); ++i )
    {
      if ( flag[i] == 105 || flag[i] == 114 )
        flag[i] = 49;
    }
  }
  printf("input the flag:");
  __isoc99_scanf("%20s", s2);
  if ( !strcmp(flag, s2) )
    return puts("this is the right flag!");
  else
    return puts("wrong flag!");
}
```

直接看

```
  if ( !strcmp(flag, s2) )
    return puts("this is the right flag!");
```

strcmp是比较俩参数，相等返回0，加个非，相等就是真

所以让s2和flag相等就行

但是flag字符串是加密过的

```
    for ( i = 0; i <= strlen(flag); ++i )
    {
      if ( flag[i] == 105 || flag[i] == 114 )
        flag[i] = 49;
    }
  }
```

把flag带进去{hacking_for_fun}

得到结果

{hack1ng_fo1_fun}
