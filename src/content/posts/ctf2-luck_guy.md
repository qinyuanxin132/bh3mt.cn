---
title: "CTF² luck_guy wp"
slug: "ctf2-luck_guy"
date: 2026-10-14
updated: 2026-10-14
published: true
categories: ["ctf2"]
tags: ["ctf2"]
---

# CTF² luck_guy wp

> 发布于 2026-10-14 12:46:00

```
int __fastcall main(int argc, const char **argv, const char **envp)
{
  unsigned int v4; // [rsp+14h] [rbp-Ch] BYREF
  unsigned __int64 v5; // [rsp+18h] [rbp-8h]

  v5 = __readfsqword(0x28u);
  welcome(argc, argv, envp);
  puts("_________________");
  puts("try to patch me and find flag");
  v4 = 0;
  puts("please input a lucky number");
  __isoc99_scanf("%d", &v4);
  patch_me(v4);
  puts("OK,see you again");
  return 0;
}
```

puts 是 C 语言标准库函数，全称 Put String，作用是把一个字符串输出到标准输出（通常是屏幕），并在末尾自动追加一个换行符。

前面都没啥用，直接进入patch_me

```
int __fastcall patch_me(int a1)
{
  if ( a1 % 2 == 1 )         //这是让a1是偶数走else
    return puts("just finished");
  else
    return get_flag();
}
```

进入get_flag()

```
unsigned __int64 get_flag()
{
  unsigned int v0; // eax
  int i; // [rsp+4h] [rbp-3Ch]
  int j; // [rsp+8h] [rbp-38h]
  __int64 s; // [rsp+10h] [rbp-30h] BYREF
  char v5; // [rsp+18h] [rbp-28h]
  unsigned __int64 v6; // [rsp+38h] [rbp-8h]

  v6 = __readfsqword(0x28u);
  v0 = time(0);
  srand(v0);
  for ( i = 0; i <= 4; ++i )
  {
    switch ( rand() % 200 )
    {
      case 1:
        puts("OK, it's flag:");
        memset(&s, 0, 0x28u);
        strcat((char *)&s, f1);
        strcat((char *)&s, &f2);
        printf("%s", (const char *)&s);
        break;
      case 2:
        printf("Solar not like you");
        break;
      case 3:
        printf("Solar want a girlfriend");
        break;
      case 4:
        s = 0x7F666F6067756369LL;
        v5 = 0;
        strcat(&f2, (const char *)&s);
        break;
      case 5:
        for ( j = 0; j <= 7; ++j )
        {
          if ( j % 2 == 1 )
            *(&f2 + j) -= 2;
          else
            --*(&f2 + j);
        }
        break;
      default:
        puts("emmm,you can't find flag 23333");
        break;
    }
  }
  return __readfsqword(0x28u) ^ v6;
}
```

`rand` 是 C 标准库函数，用来生成**伪随机数**。

`time(0)` 返回从 **1970年1月1日 00:00:00 UTC** 到现在的**秒数**

它几乎总是和 `srand` 一起出现：

```
srand(time(0));   // 用当前时间当种子
int r = rand();   // 生成随机数
```

`strcat` 是 C 标准库函数，全称 **String Concatenate**，作用是**把一个字符串拼接到另一个字符串的末尾**

```
char a[20] = "hello";
strcat(a, "world");
// 现在 a 的内容是 "helloworld\0"
```

那我们直接看

```
        puts("OK, it's flag:");
        memset(&s, 0, 0x28u);
        strcat((char *)&s, f1);
        strcat((char *)&s, &f2);
        printf("%s", (const char *)&s);
```

f1是

.data:0000000000601078 f1              db 'GXY{do_not_',0      ; DATA XREF: get_flag+9E↑o

GXY{do_not_

f2是写在.bss里的，看来是动态生成的

我们观察到4

```
        s = 0x7F666F6067756369LL;
        v5 = 0;
        strcat(&f2, (const char *)&s);
        break;
```

text

```
69 63 75 67 60 6F 66 7F
  i  c  u  g  `  o  f  DEL
```

这**不是可读的 ASCII 字符串**

**我们发现5**

```
        for ( j = 0; j <= 7; ++j )
        {
          if ( j % 2 == 1 )
            *(&f2 + j) -= 2;
          else
            --*(&f2 + j);
        }
```

尝试运行一次

```
# 模拟 case 4 和 case 5 对 f2 的变换
f2 = bytearray.fromhex("69 63 75 67 60 6F 66 7F")

for j in range(8):
    if j % 2 == 1:
        f2[j] = (f2[j] - 2) & 0xFF
    else:
        f2[j] = (f2[j] - 1) & 0xFF

print(f2.decode('latin-1'))  # 输出 hate_me}
```

拼到一起

GXY{do_not_hate_me}
