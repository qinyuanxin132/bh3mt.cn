---
title: "CTF² reverse1 wp"
slug: "ctf2-reverse1-wp"
date: 2026-10-13
updated: 2026-10-13
published: true
categories: ["ctf2"]
tags: ["ctf2"]
---

# CTF² reverse1 wp

> 发布于 2026-10-13 00:58:53

分析

```
int __fastcall main_0(int argc, const char **argv, const char **envp)
{
  char *v3; // rdi
  __int64 i; // rcx
  size_t v5; // rax
  char v7; // [rsp+0h] [rbp-20h] BYREF
  int j; // [rsp+24h] [rbp+4h]
  char Str1[224]; // [rsp+48h] [rbp+28h] BYREF
  __int64 v10; // [rsp+128h] [rbp+108h]

  v3 = &v7;
  for ( i = 82; i; --i )
  {
    *(_DWORD *)v3 = -858993460;
    v3 += 4;
  }
  for ( j = 0; ; ++j )
  {
    v10 = j;
    if ( j > j_strlen(Str2) )
      break;
    if ( Str2[j] == 111 )
      Str2[j] = 48;
  }
  sub_1400111D1("input the flag:");
  sub_14001128F("%20s", Str1);
  v5 = j_strlen(Str2);
  if ( !strncmp(Str1, Str2, v5) )
    sub_1400111D1("this is the right flag!\n");
  else
    sub_1400111D1("wrong flag\n");
  return 0;
}
```

```
int strncmp(const char *s1, const char *s2, size_t n);
```

作用是比较两个字符串的前 n 个字符

### **🎯 返回值规则**

- **返回 0**：两个字符串的前 `n` 个字符完全相等。

- **返回正数**：`s1` 的前 `n` 个字符大于 `s2`。

- **返回负数**：`s1` 的前 `n` 个字符小于 `s2`。

在if语句里面，只有0才是假，加个非后

就是让strncmp(Str1, Str2, v5)返回0

Str2的初始值为{hello_world}

```
  for ( j = 0; ; ++j )
  {
    v10 = j;
    if ( j > j_strlen(Str2) )
      break;
    if ( Str2[j] == 111 )
      Str2[j] = 48;
  }
```

我们看这个

第一个if是判断长度超过了字符串退出循环

第二个if是把o替换成0

那么最后结果就是

{hell0_w0rld}
