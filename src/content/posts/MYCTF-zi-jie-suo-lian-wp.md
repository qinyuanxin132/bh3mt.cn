---
title: "myctf 字节锁链 wp"
slug: "MYCTF-zi-jie-suo-lian-wp"
date: 2026-11-24
updated: 2026-11-24
published: true
categories: ["CTF Writeup"]
tags: ["MYCTF", "Reverse", "汇编"]
---

## myctf 字节锁链 wp

> 发布于 2026-11-24 16:22:58

题目加初步分析：

```asm
0000000140001000 <check>:
  140001000:push rbp
  140001001:mov rbp,rsp
  140001004:push rbx
  140001005:push r12
  140001007:push r13
  140001009:push r14
  14000100b:push r15
  14000100d:sub rsp,0x8
  140001011:mov r12,rcx            ;r12 = rcx
  140001014:xor eax,eax            ;eax = 0

  140001016:cmp BYTE PTR [rax+r12*1],0x0 ; if r12[rax] == 0
  14000101b:je 14000102b <check+0x2b>    ; r12[rax] == 0 时执行 14000102b
  14000101d:inc rax                      ; rax++
  140001020:cmp rax,0x1b                 ; if rax < 27
  140001024:jb 140001016 <check+0x16>    ; 跳转到 140001016

  140001026:jmp 140001090 <check+0x90>   ; return 1;
  14000102b:cmp rax,0x1a                 ;检查rax和26 当rax==26时
  14000102f:jne 140001090 <check+0x90>   ;不满足跳到140001090
  140001035:lea r15,[rip+0xfc4]          ;r15[26] = {0x1f,0x26,0x2d,0x34,0x3b,0x42,0x49,0x50,0x57,0x5e,0x65,0x6c,0x73,0x7a,0x81,0x88,0x8f,0x96,0x9d,0xa4,0xab,0xb2,0xb9,0xc0,0xc7,0xce}
  14000103c:lea r14,[rip+0xfdd]          ;r14[26] = {0x91,0xc2,0xa6,0x3b,0x3d,0x20,0xf7,0x07,0x4f,0xcb,0x71,0xd5,0x21,0x7e,0xc3,0x0e,0xe1,0xe9,0xb6,0x2f,0x94,0x7f,0xfd,0x51,0x64,0xd2}
  140001043:mov r13d,0x5a                ;r13d = 90
  140001049:xor ebx,ebx                  ;ebx = 0

  14000104b:movzx eax,BYTE PTR [rbx+r12*1] ;eax = r12[rbx]
  140001050:movzx ecx,BYTE PTR [rbx+r15*1] ;ecx = r15[rbx]
  140001055:xor eax,ecx                    ;eax = eax ^ ecx
  140001057:mov edx,eax                    ;edx = eax
  140001059:shl edx,0x3                    ;edx = edx * 8
  14000105c:mov esi,eax                    ;esi = eax
  14000105e:shr esi,0x5                    ;esi = esi / 32
  140001061:or edx,esi                     ;edx = edx | esi
  140001063:movzx eax,dl                   ;eax = dl(edx低8位)
  140001065:lea eax,[rax+rbx*1]            ;eax = rax + rbx
  140001068:and eax,0xff                   ;eax = eax & 0xff
  14000106d:xor eax,r13d                   ;eax = eax ^ r13d
  140001070:movzx ecx,BYTE PTR [rbx+r14*1] ;ecx = r14[rbx]
  140001075:cmp eax,ecx                    ;if eax != ecx
  140001077:jne 140001090 <check+0x90>     ;   return 1
                                               ;else:
  14000107d:mov r13d,eax                   ;r13d = eax
  140001080:inc rbx                        ;rbx++
  140001083:cmp rbx,0x1a                   ;if rbx = 26
  140001087:jne 14000104b <check+0x4b>     ;     break;

  140001089:xor eax,eax
  14000108b:jmp 140001095 <check+0x95>
  140001090:mov eax,0x1
  140001095:add rsp,0x8
  140001099:pop r15
  14000109b:pop r14
  14000109d:pop r13
  14000109f:pop r12
  1400010a1:pop rbx
  1400010a2:pop rbp
  1400010a3:ret
```

初步整理成伪c

```c
#include <stdio.h>

int main()
{
int rbx;
int r13;
int rax;
int rcx;

rax = 0;
unsigned char input[27];
unsigned char *r12 = input;
for(;;rax++)
{
    if (rax >= 27)
        return 1;
    if (r12[rax] == 0)
        break;
}

if(rax!=26)
    return 1;

unsigned char r15[27] = {0x1f,0x26,0x2d,0x34,0x3b,0x42,0x49,0x50,0x57,0x5e,0x65,0x6c,0x73,0x7a,0x81,0x88,0x8f,0x96,0x9d,0xa4,0xab,0xb2,0xb9,0xc0,0xc7,0xce,'\0'};
unsigned char r14[27] = {0x91,0xc2,0xa6,0x3b,0x3d,0x20,0xf7,0x07,0x4f,0xcb,0x71,0xd5,0x21,0x7e,0xc3,0x0e,0xe1,0xe9,0xb6,0x2f,0x94,0x7f,0xfd,0x51,0x64,0xd2,'\0'};

int r13d = 90;
rbx = 0;

for(;rbx != 26;rbx++)
{
    rax = r12[rbx];
    rcx = r15[rbx];
    rax = ((rax&0xffffffff) ^ (rcx&0xffffffff))&0xffffffff;
    int edx = rax;
    edx = (edx * 8)&0xffffffff;
    int esi = rax;
    esi = esi / 32;
    edx = edx | esi;
    rax = edx & 0xff;
    rax = (rax + rbx)&0xffffffff;
    rax = rax & 0xff;
    rax = rax ^ r13d;
    rcx = r14[rbx];
    if (rax != rcx)
        return 1;
    r13d = rax;
}
return 0; 
}

```

把那一大堆一大串合并

```c
rax = (((((r12[rbx] ^ r15[rbx]) * 8) | ((r12[rbx] ^ r15[rbx]) / 32)) & 0xff) + rbx) & 0xff
rax = rax ^ r13d
```

python写解密脚本

```python
r15 = [0x1f,0x26,0x2d,0x34,0x3b,0x42,0x49,0x50,0x57,0x5e,0x65,0x6c,0x73,0x7a,0x81,0x88,0x8f,0x96,0x9d,0xa4,0xab,0xb2,0xb9,0xc0,0xc7,0xce,'\0']
r14 = [0x91,0xc2,0xa6,0x3b,0x3d,0x20,0xf7,0x07,0x4f,0xcb,0x71,0xd5,0x21,0x7e,0xc3,0x0e,0xe1,0xe9,0xb6,0x2f,0x94,0x7f,0xfd,0x51,0x64,0xd2,'\0']
r11 = [90,0x91,0xc2,0xa6,0x3b,0x3d,0x20,0xf7,0x07,0x4f,0xcb,0x71,0xd5,0x21,0x7e,0xc3,0x0e,0xe1,0xe9,0xb6,0x2f,0x94,0x7f,0xfd,0x51,0x64,'\0']
r12 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
for rbx in range(25,-1,-1):
    #要想效验成功，rax = rcx 
    #r13d = rax
    #所以r13d就是r14
    r13d = r11[rbx]
    #我们的目标是求r12
    rax = r14[rbx] ^ r13d
    r12[rbx] = ((((((rax - rbx)&0xff) * 32)) | (((rax - rbx)&0xff) // 8)) &0xff)^ r15[rbx]
print(bytes(r12[:26]).decode())
```
