---
title: "花指令学习0-->0.1"
slug: "hua-zhi-ling-0-0-1"
date: 2026-11-23
updated: 2026-11-23
published: true
categories: ["逆向工程"]
tags: ["GDB", "pwndbg"]
---

## leave 1

打开ida

```c++
__int64 __fastcall main(int a1, char **a2, char **a3)
{
  size_t v3; // rax
  char *v4; // rax
  unsigned int v5; // ebx
  char v8[128]; // [rsp+2h] [rbp-88h] BYREF
  char v9; // [rsp+82h] [rbp-8h] BYREF

  puts(s: "=== Junk Code Lab - Level 1 ===");
  printf(format: "Input flag: ");
  fflush(stream: stdout);
  if ( fgets(s: v8, n: 128, stream: stdin) != nullptr )
  {
    v3 = strlen(s: v8);
    if ( v3 != 0 )
    {
      v4 = &v8[v3 - 1];
      do
      {
        if ( *v4 != 10 && *v4 != 13 )
          break;
        *v4-- = 0;
      }
      while ( &v4[129LL - (_QWORD)&v9] != nullptr );
    }
    v5 = ((__int64 (__fastcall *)(char *))loc_401180)(a1: v8);
    if ( v5 != 0 )
    {
      puts(s: "[+] Correct! Level 1 cleared!");
      return 0;
    }
    else
    {
      puts(s: "[-] Wrong flag.");
    }
  }
  else
  {
    return 1;
  }
  return v5;
}
```

