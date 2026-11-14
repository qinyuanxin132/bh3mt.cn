---
title: "ELF Patch实战 #1"
slug: "ELF-Patch-shi-zhan-1"
date: 2026-11-13
updated: 2026-11-13
published: true
categories: ["ELF 文件结构"]
tags: ["ELF", "Linux", "逆向工程"]
---

# ELF Patch实战 #1

> 发布于：2026-11-13 17:30:00

# 一、初次尝试：

## 0 创建实战文件

```c
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char **argv)
{
    if (argc != 2) {
        puts("Usage: ./check <number>");
        return 1;
    }

    int key = atoi(argv[1]);

    if (key == 2026) {
        puts("ACCESS GRANTED");
    } else {
        puts("ACCESS DENIED");
    }

    return 0;
}
```

编译
`gcc -O0 -g -fno-pie -no-pie -fno-stack-protector check.c -o check`

确认程序正常：

```
./check 1111
./check 2026
```

```
ACCESS DENIED
ACCESS GRANTED
```

## 1

直接看main函数的反汇编

`objdump -d -M intel check | sed -n '/<main>:/,/^$/p'`

```c
0000000000401146 <main>:
  401146:	55                   	push   rbp
  401147:	48 89 e5             	mov    rbp,rsp
  40114a:	48 83 ec 20          	sub    rsp,0x20
  40114e:	89 7d ec             	mov    DWORD PTR [rbp-0x14],edi
  401151:	48 89 75 e0          	mov    QWORD PTR [rbp-0x20],rsi
  401155:	83 7d ec 02          	cmp    DWORD PTR [rbp-0x14],0x2
  401159:	74 11                	je     40116c <main+0x26>
  40115b:	bf 04 20 40 00       	mov    edi,0x402004
  401160:	e8 cb fe ff ff       	call   401030 <puts@plt>
  401165:	b8 01 00 00 00       	mov    eax,0x1
  40116a:	eb 3a                	jmp    4011a6 <main+0x60>
  40116c:	48 8b 45 e0          	mov    rax,QWORD PTR [rbp-0x20]
  401170:	48 83 c0 08          	add    rax,0x8
  401174:	48 8b 00             	mov    rax,QWORD PTR [rax]
  401177:	48 89 c7             	mov    rdi,rax
  40117a:	e8 c1 fe ff ff       	call   401040 <atoi@plt>
  40117f:	89 45 fc             	mov    DWORD PTR [rbp-0x4],eax
  401182:	81 7d fc ea 07 00 00 	cmp    DWORD PTR [rbp-0x4],0x7ea
  401189:	75 0c                	jne    401197 <main+0x51>
  40118b:	bf 1c 20 40 00       	mov    edi,0x40201c
  401190:	e8 9b fe ff ff       	call   401030 <puts@plt>
  401195:	eb 0a                	jmp    4011a1 <main+0x5b>
  401197:	bf 2b 20 40 00       	mov    edi,0x40202b
  40119c:	e8 8f fe ff ff       	call   401030 <puts@plt>
  4011a1:	b8 00 00 00 00       	mov    eax,0x0
  4011a6:	c9                   	leave
  4011a7:	c3                   	ret
```

