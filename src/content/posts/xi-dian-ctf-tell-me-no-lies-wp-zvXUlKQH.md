---
title: "西电 CTF  Tell Me No Lies wp"
slug: "xi-dian-ctf-tell-me-no-lies-wp-zvXUlKQH"
date: 2026-10-19
updated: 2026-10-19
published: true
categories: []
tags: []
---

# 西电 CTF  Tell Me No Lies wp

> 发布于 2026-10-19 05:00:58

**IDA 打开**

```
int __fastcall main(int argc, const char **argv, const char **envp)
{
  char v4[32]; // [rsp+0h] [rbp-50h] BYREF
  _BYTE s[32]; // [rsp+20h] [rbp-30h] BYREF
  unsigned int v6; // [rsp+40h] [rbp-10h]
  unsigned int v7; // [rsp+44h] [rbp-Ch]
  __int64 v8; // [rsp+48h] [rbp-8h]

  memset(s, 0, 0x15u);
  memset(v4, 0, sizeof(v4));
  puts("=== MOE Restricted Recovery Console ===");
  puts("[*] Checking debugger state...");
  v7 = IsDebuggerPresent();
  if ( v7 )
  {
    puts("[!] Debugger detected.");
    puts("[-] Recovery console terminated.");
    return 1;
  }
  else
  {
    puts("[*] Verifying operator token...");
    build_required_token(s);
    v8 = acquire_operator_token();
    v6 = compare_operator_token(v8, s);
    if ( v6 )
    {
      puts("[!] Operator token mismatch.");
      puts("[-] Recovery console terminated.");
      return 1;
    }
    else
    {
      puts("[*] Authorization accepted.");
      puts("[*] Starting multilayer recovery engine...");
      if ( (unsigned int)self_driven_decrypt(v7, v6, v4) )
      {
        puts("[+] Recovery complete.");
        printf("[+] %s\n", v4);
        memset(v4, 0, sizeof(v4));
        return 0;
      }
      else
      {
        puts("[!] Recovery state corrupted.");
        puts("[-] No valid record recovered.");
        return 1;
      }
    }
  }
}
```

附件没有去掉函数名，IDA 里能看到诸如：

- `IsDebuggerPresent`：检查调试器

- `build_required_token`：生成要求的口令

- `acquire_operator_token`：取得实际口令

- `compare_operator_token`：比较口令

- `self_driven_decrypt`：后续解密

### **先运行原版，确认卡在哪里**

```
chmod +x chall10
./chall10
```

```
=== MOE Restricted Recovery Console ===
[*] Checking debugger state...
[*] Verifying operator token...
[!] Operator token mismatch.
[-] Recovery console terminated.
```

发现问题出现在这一段

```
  {
    puts("[*] Verifying operator token...");
    build_required_token(s);
    v8 = acquire_operator_token();
    v6 = compare_operator_token(v8, s);
    if ( v6 )
    {
      puts("[!] Operator token mismatch.");
      puts("[-] Recovery console terminated.");
      return 1;
    }
```

那我们打开build_required_token看看

```
__int64 __fastcall build_required_token(__int64 a1)
{
  unsigned __int64 i; // [rsp+10h] [rbp-8h]

  for ( i = 0; i <= 0x13; ++i )
    *(_BYTE *)(a1 + i) = *(_BYTE *)(i + 4203008) ^ 0x5A;
  *(_BYTE *)(a1 + 20) = 0;
  return a1 + 20;
}
```

这是将数据对0x5A进行异或

地址在4203008

一共20位[0,19]

```
.rodata:0000000000402200 encoded_0       db  17h
.rodata:0000000000402201                 db  15h
.rodata:0000000000402202                 db  1Fh
.rodata:0000000000402203                 db  77h ; w
.rodata:0000000000402204                 db  16h
.rodata:0000000000402205                 db  1Fh
.rodata:0000000000402206                 db  0Ch
.rodata:0000000000402207                 db  1Fh
.rodata:0000000000402208                 db  16h
.rodata:0000000000402209                 db  77h ; w
.rodata:000000000040220A                 db  6Dh ; m
.rodata:000000000040220B                 db  77h ; w
.rodata:000000000040220C                 db  15h
.rodata:000000000040220D                 db  0Ah
.rodata:000000000040220E                 db  1Fh
.rodata:000000000040220F                 db    8
.rodata:0000000000402210                 db  1Bh
.rodata:0000000000402211                 db  0Eh
.rodata:0000000000402212                 db  15h
.rodata:0000000000402213                 db    8
```

使用python

```
python3 -c "print(bytes(b^0x5a for b in bytes.fromhex('17151f77161f0c1f16776d77150a1f081b0e1508')).decode())"
```

得到

MOE-LEVEL-7-OPERATOR

### **接着看实际口令**

打开acquire_operator_token

```
const char *acquire_operator_token()
{
  if ( (getpid() & 1) != 0 )
    return "MOE-LEVEL-1-GUEST";
  else
    return "MOE-LEVEL-3-TECH";
}
```

两个都不等于 MOE-LEVEL-7-OPERATOR

所以注定要失败的，我们需要改程序

打开compare_operator_token

我们发现其实就是strcmp(a1, a2)

我们要让这个函数返回0来进入else

找到比较那个函数

```
; Attributes: bp-based frame

; int __fastcall compare_operator_token(const char *, const char *)
compare_operator_token proc near

s2= qword ptr -10h
s1= qword ptr -8

; __unwind {
endbr64
push    rbp
mov     rbp, rsp
sub     rsp, 10h
mov     [rbp+s1], rdi
mov     [rbp+s2], rsi
mov     rdx, [rbp+s2]
mov     rax, [rbp+s1]
mov     rsi, rdx        ; s2
mov     rdi, rax        ; s1
call    _strcmp
leave
retn
; } // starts at 4014D6
compare_operator_token endp
```

改成

```
; __unwind {
endbr64
xor     eax, eax
retn
```

保存，然后运行

```
 cd /home/qinyuanxin132/Downloads/work
  chmod +x chall10_work
  ./chall10_work
=== MOE Restricted Recovery Console ===
[*] Checking debugger state...
[*] Verifying operator token...
[*] Authorization accepted.
[*] Starting multilayer recovery engine...
[+] Recovery complete.
[+] moectf{Wow~h0w_do_Y0u_f1nd_IT?}
```
