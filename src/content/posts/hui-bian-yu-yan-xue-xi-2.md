---
title: "汇编语言学习 #2"
slug: "hui-bian-yu-yan-xue-xi-2"
date: 2026-11-05
updated: 2026-11-06
published: true
categories: ["汇编语言学习"]
tags: ["汇编语言学习", "CTF", "Reverse", "x86-64", "GDB", "pwndbg"]
---

# 汇编语言学习 2

> 发布于 2026-11-05 19:11:10  
> 学习内容：Day 05 函数调用与返回、Day 06 比较指令与条件跳转  
> 实验环境：Arch Linux、GCC、GDB + pwndbg、x86-64

# Day 05：CALL、RET 与动态调试

## 一、实验程序

编写 `call.c`：

```c
#include <stdio.h>

__attribute__((noinline))
int add(int a, int b)
{
    return a + b;
}

int main(void)
{
    int result = add(10, 20);
    printf("%d\n", result);
    return 0;
}
```

这段程序主要涉及三个步骤：

1. `main` 将参数 10 和 20 传给 `add`。
2. CPU 跳转到 `add` 函数，执行加法。
3. `add` 返回结果，CPU 回到 `main` 继续运行。

编译程序：

```bash
cd ~/reverse-study/day05

gcc -g -O0 -fno-omit-frame-pointer -fno-pie -no-pie \
    call.c -o call

gdb ./call
```

进入 `pwndbg>` 后设置 Intel 汇编格式：

```gdb
set disassembly-flavor intel
disassemble main
```

## 二、CALL 指令

CALL 用于调用函数。

在 Linux x86-64 System V ABI 下，前两个整型参数通常通过 `EDI`、`ESI` 传递。

实验中对应的汇编为：

```asm
0x401152: mov esi, 0x14
0x401157: mov edi, 0xa
0x40115c: call 0x401136 <add>
0x401161: mov DWORD PTR [rbp-0x4], eax
```

其中：

- `0x14` = 十进制 20。
- `0xa` = 十进制 10。
- `call 0x401136`：调用 `add` 函数。
- `mov [rbp-0x4],eax`：返回后将结果保存到 `main` 的局部变量中。

### 1. 在 CALL 前设置断点

```gdb
break *0x40115c
run
```

断点地址前面的 `*` 表示使用具体机器指令地址，而不是源代码行号或函数名。

### 2. CALL 执行之前

```text
pwndbg> info registers rsp rip
rsp  0x7fffffffe370
rip  0x40115c <main+18>

pwndbg> x/gx $rsp
0x7fffffffe370: 0x0000000000000000
```

当前状态：

- `RSP` 指向栈顶。
- `RIP` 指向即将执行的 CALL。
- `x/gx $rsp` 读取栈顶的 8 字节数据，以十六进制显示。

### 3. 单步执行 CALL

```gdb
si
```

执行之后：

```text
pwndbg> info registers rsp rip
rsp  0x7fffffffe368
rip  0x401136 <add>

pwndbg> x/gx $rsp
0x7fffffffe368: 0x0000000000401161
```

观察到：

**RSP 从 `0x7fffffffe370` 变为 `0x7fffffffe368`。**

因此：

```text
RSP = RSP - 8
```

同时栈顶出现：

```text
[RSP] = 0x401161
```

而 RIP 变成：

```text
RIP = 0x401136
```

这说明 CALL 执行了两个重要操作：

1. 将返回地址压入栈。
2. 跳转到被调用的函数。

可以简化理解为：

```text
RSP = RSP - 8
[RSP] = 返回地址
RIP = add 函数入口地址
```

这里讨论的是普通 x86-64 近调用。

### 4. 返回地址为什么是 0x401161？

CALL 指令位于：

```asm
0x40115c: call 0x401136
```

下一条指令位于：

```asm
0x401161: mov DWORD PTR [rbp-0x4], eax
```

因此：

```text
返回地址 = 0x40115c + 5
         = 0x401161
```

**CALL 保存的是下一条指令的地址，而不是 CALL 指令自身的地址。**

注意：x86-64 指令是变长指令，一条指令的长度可以是 1～15 字节。

本次 CALL 长度为 5 字节，但不能认为所有指令都是 5 字节。

另外，还要区分：

| 概念 | 本次大小 | 原因 |
|---|---|---|
| CALL 指令长度 | 5 字节 | 这条机器指令的编码长度 |
| 返回地址大小 | 8 字节 | 64 位模式下的近返回地址 |

CALL 压入栈时，`RSP` 减少 8，并不是因为 CALL 指令占 8 字节。

### 5. CALL 小测

假设有：

```asm
0x401200: call 0x402000
0x401205: mov eax, 10
```

执行前：

```text
RSP = 0x7000
```

那么执行 CALL 后：

```text
RSP   = 0x6FF8
RIP   = 0x402000
[RSP] = 0x401205
```

解释：

- RSP 减少 8 字节。
- RIP 跳转到函数入口 `0x402000`。
- 栈顶保存 CALL 后面下一条指令的地址 `0x401205`。

## 三、RET 指令

RET 是 Return 的缩写，用于从函数返回。

普通 x86-64 近返回可以简化理解为：

```text
RIP = [RSP]
RSP = RSP + 8
```

也就是从栈顶读取返回地址，将其作为新的 RIP，并将栈顶指针上移 8 字节。

**RET 不负责计算函数返回值。**

对于普通整数返回值，函数通常提前把结果放进 EAX/RAX 中。

### 1. RET 执行之前

实验中停在 `add` 函数的 RET 指令前：

```text
pwndbg> info registers rsp rip
rsp  0x7fffffffe368
rip  0x401149 <add+19>

pwndbg> x/gx $rsp
0x7fffffffe368: 0x0000000000401161
```

此时：

```text
RSP   = 0x7fffffffe368
[RSP] = 0x401161
```

返回地址仍然保存在栈顶。

### 2. 执行 RET

```gdb
si
```

观察结果：

```text
pwndbg> info registers rsp rip
rsp  0x7fffffffe370
rip  0x401161 <main+23>

pwndbg> x/gx $rsp
0x7fffffffe370: 0x0000000000000000
```

可以发现：

```text
RSP: 0x...e368 → 0x...e370
RIP: 0x401149  → 0x401161
```

说明 RET 已经完成返回，CPU 重新执行 `main` 中 CALL 后面的指令。

### 3. RET 会清空栈中的数据吗？

不会。

RET 后执行：

```gdb
x/gx $rsp
```

看到的是新 RSP 指向的位置。

由于 RSP 已经发生变化，这次查看的地址与 RET 前不同。

RET 前：

```text
地址 0x...e368 → 返回地址 0x401161
```

RET 后：

```text
地址 0x...e370 → 0x0
```

**不能据此认为 RET 把原来的返回地址清零了。**

RET 通常只是读取返回地址并移动 RSP，不主动清除原有栈内存。

可以用下面的命令重新查看原地址：

```gdb
x/gx 0x7fffffffe368
```

### 4. POP RBP 与 RET 的区别

常见的函数结尾：

```asm
pop rbp
ret
```

二者作用不同：

- `pop rbp`：恢复先前保存的 RBP。
- `ret`：从栈中取出返回地址并跳转。

函数返回前，需要将栈恢复到适合执行 RET 的状态，即正常情况下让 RSP 指向返回地址。

## 四、RET 小测

已知：

```text
RSP   = 0x7000
RIP   = 0x402050
[RSP] = 0x401300
RAX   = 0x2A
```

当前指令：

```asm
ret
```

执行之后：

| 寄存器 | 结果 |
|---|---|
| RSP | `0x7008` |
| RIP | `0x401300` |
| RAX | `0x2A` |

原因：

- RET 弹出 8 字节的返回地址。
- RIP 被设置为 `0x401300`。
- RET 本身不会修改 RAX。
- 原来的栈内存不会自动清零。

其中 `0x2A` 是十六进制，对应十进制 42。

### Day 05 总结

CALL 和 RET 是一对常见的控制流操作：

```text
CALL：
    压入返回地址
    RSP -= 8
    跳转到被调用函数

函数：
    执行计算
    将整数返回值放入 EAX/RAX
    恢复栈帧

RET：
    读取栈顶返回地址
    RSP += 8
    跳回调用者
```

本节已经通过 GDB 实际观察了 CALL 和 RET 对 RSP、RIP 以及栈内存的影响。

---

# Day 06：CMP、TEST 与条件跳转

## 一、CMP 比较指令

CMP（Compare）用于比较两个操作数。

例如：

```asm
cmp eax, ebx
```

它在内部进行类似下面的减法：

```text
EAX - EBX
```

**CMP 不会把减法结果写回 EAX 或 EBX，而是更新 RFLAGS 中的相关标志位。**

目前重点学习 ZF。

### 1. ZF 零标志位

ZF = Zero Flag。

对于 CMP：

| 情况 | ZF |
|---|---|
| 两个数相等 | 1 |
| 两个数不相等 | 0 |

例如：

```asm
mov eax, 10
mov ebx, 10
cmp eax, ebx
```

内部比较：

```text
10 - 10 = 0
```

因此：

```text
ZF = 1
```

如果：

```asm
mov eax, 20
mov ebx, 15
cmp eax, ebx
```

则：

```text
20 - 15 = 5
ZF = 0
```

这里的 ZF 表示运算结果是否为零，并不是专门存储“两个数是否相等”的寄存器。CMP 通过减法使它能够用于判断相等。

## 二、JE 与 JNE

JE 和 JNE 根据标志位决定是否跳转。

| 指令 | 英文含义 | 跳转条件 |
|---|---|---|
| JE | Jump if Equal | ZF = 1 |
| JNE | Jump if Not Equal | ZF = 0 |
| JMP | Jump | 无条件跳转 |

例如：

```asm
cmp edi, 1234
jne wrong

mov eax, 1
ret

wrong:
mov eax, 0
ret
```

如果 EDI = 1234：

```text
CMP → ZF = 1
JNE → 不跳转
返回 1
```

如果 EDI = 1111：

```text
CMP → ZF = 0
JNE → 跳转
返回 0
```

## 三、GDB 动态观察 CMP 和 JNE

### 1. 实验程序

编写 `check.c`：

```c
#include <stdio.h>
#include <stdlib.h>

__attribute__((noinline))
int check(int password)
{
    if (password == 1234)
        return 1;

    return 0;
}

int main(int argc, char **argv)
{
    if (argc != 2)
        return 1;

    int password = atoi(argv[1]);
    int result = check(password);

    printf("result = %d\n", result);
    return 0;
}
```

编译：

```bash
cd ~/reverse-study/day06
gcc -g -O0 -fno-pie -no-pie check.c -o check
gdb ./check
```

### 2. 查看汇编

```gdb
set disassembly-flavor intel
disassemble check
```

实际得到：

```asm
0x401146: push rbp
0x401147: mov rbp, rsp
0x40114a: mov DWORD PTR [rbp-0x4], edi
0x40114d: cmp DWORD PTR [rbp-0x4], 0x4d2
0x401154: jne 0x40115d
0x401156: mov eax, 0x1
0x40115b: jmp 0x401162
0x40115d: mov eax, 0x0
0x401162: pop rbp
0x401163: ret
```

这里：

```text
0x4d2 = 1234
```

`EDI` 中的参数先保存到 `[rbp-0x4]`，随后 CMP 读取该内存位置中的密码进行比较。

### 3. 输入正确密码 1234

在 CMP 处设置断点：

```gdb
break *0x40114d
run 1234
```

执行 CMP：

```gdb
si
info registers rip eflags
```

实验结果：

```text
rip     0x401154 <check+14>
eflags  0x246 [ PF ZF IF ]
```

重点观察：

```text
ZF = 1
```

说明：

```text
1234 - 1234 = 0
```

下一条指令：

```asm
0x401154: jne 0x40115d
```

因为 ZF = 1，JNE 不满足跳转条件。

继续单步：

```gdb
si
```

RIP 会到达：

```text
0x401156
```

随后执行：

```asm
mov eax, 1
```

实验中进一步观察到：

```text
RIP = 0x40115b
EAX = 0x1
```

说明程序选择了返回 1 的分支。

### 4. 输入错误密码 1111

重新运行：

```gdb
run 1111
```

在 CMP 处暂停后：

```gdb
si
info registers rip eflags
```

实际结果：

```text
rip     0x401154 <check+14>
eflags  0x283 [ CF SF IF ]
```

这里没有显示 ZF：

```text
ZF = 0
```

因为：

```text
1111 - 1234 = -123
```

结果不是 0。

因此下一条 JNE 会跳转。

继续：

```gdb
si
info registers rip eflags
```

实际得到：

```text
rip     0x40115d <check+23>
eflags  0x283 [ CF SF IF ]
```

对应：

```asm
0x40115d: mov eax, 0
```

说明程序进入失败分支。

注意：停在 `mov eax,0` 时，这条指令还没有执行；需要继续单步，才能确认 EAX 已经被设置为 0。

### 5. CMP + JNE 实验总结

| 项目 | 输入 1234 | 输入 1111 |
|---|---|---|
| 比较运算 | 1234 - 1234 | 1111 - 1234 |
| 结果 | 0 | -123 |
| ZF | 1 | 0 |
| JNE | 不跳转 | 跳转 |
| 分支入口 | `0x401156` | `0x40115d` |
| 返回值 | 1 | 0 |

这次实验说明：

**逆向时可以通过 CMP 的操作数、标志位以及后续条件跳转，分析程序的判断逻辑。**

---

## 四、TEST 指令

TEST 与 AND 一样，执行按位与运算，但不保存运算结果，只更新标志位。

例如：

```asm
test eax, eax
```

相当于计算：

```text
EAX & EAX
```

如果结果为 0：

```text
ZF = 1
```

否则：

```text
ZF = 0
```

### 1. 判断奇偶数

```asm
test eax, 1
```

检查 EAX 的最低位是否为 1。

例如数字 6：

```text
  0110
& 0001
------
  0000
```

得到 0，所以 ZF = 1。

数字 7：

```text
  0111
& 0001
------
  0001
```

结果不为零，所以 ZF = 0。

因此可以通过最低位判断一个整数是奇数还是偶数。

### 2. AND 与 TEST 的区别

| 指令 | 运算 | 是否保存结果 | 是否更新标志位 |
|---|---|---|---|
| `and eax,1` | EAX & 1 | 是，写回 EAX | 是 |
| `test eax,1` | EAX & 1 | 否 | 是 |
| `test eax,eax` | EAX & EAX | 否 | 是 |

这是一个很容易混淆的地方。

**AND 会改变目标操作数，而 TEST 不会。**

## 五、GDB 动态观察 TEST 与 JE

### 1. 实验程序

编写 `test.c`：

```c
#include <stdio.h>
#include <stdlib.h>

__attribute__((noinline))
int check(int x)
{
    if (x & 1)
        return 1;

    return 0;
}

int main(int argc, char **argv)
{
    if (argc != 2)
        return 1;

    printf("result = %d\n", check(atoi(argv[1])));
    return 0;
}
```

编译：

```bash
gcc -g -O0 -fno-pie -no-pie test.c -o test
gdb ./test
```

### 2. 查看汇编

```gdb
set disassembly-flavor intel
disassemble check
```

得到：

```asm
0x401146: push rbp
0x401147: mov rbp, rsp
0x40114a: mov DWORD PTR [rbp-0x4], edi
0x40114d: mov eax, DWORD PTR [rbp-0x4]
0x401150: and eax, 0x1
0x401153: test eax, eax
0x401155: je 0x40115e
0x401157: mov eax, 0x1
0x40115c: jmp 0x401163
0x40115e: mov eax, 0x0
0x401163: pop rbp
0x401164: ret
```

核心逻辑：

```asm
and eax, 1
test eax, eax
je 0x40115e
```

即先取出整数最低位，再检查结果是否为零。

### 3. 输入 6：偶数分支

设置断点：

```gdb
break *0x401153
run 6
```

TEST 执行前：

```text
EAX    = 0x0
RIP    = 0x401153
EFLAGS = 0x246 [ PF ZF IF ]
```

此时 `and eax,1` 已经执行：

```text
6 & 1 = 0
```

所以 EAX = 0。

执行：

```gdb
si
info registers eax rip eflags
```

TEST 执行后：

```text
EAX    = 0x0
RIP    = 0x401155
EFLAGS = 0x246 [ PF ZF IF ]
```

可以发现：

- EAX 没有改变。
- ZF = 1。
- RIP 已经移动到 JE。

由于 `AND` 本身也会更新标志位，因此 TEST 前 ZF 就已经等于 1。

继续执行 JE：

```gdb
si
info registers rip
```

得到：

```text
RIP = 0x40115e <check+24>
```

说明 JE 成功跳转到返回 0 的分支。

### 4. 输入 7：奇数分支

重新运行：

```gdb
run 7
```

TEST 前：

```text
EAX    = 0x1
RIP    = 0x401153
EFLAGS = 0x202 [ IF ]
```

因为：

```text
7 & 1 = 1
```

TEST 后：

```text
EAX    = 0x1
RIP    = 0x401155
EFLAGS = 0x202 [ IF ]
```

此时：

```text
ZF = 0
```

因此：

```asm
je 0x40115e
```

不会跳转，而是继续执行：

```asm
0x401157: mov eax, 1
```

执行这条 MOV 后，实验记录为：

```text
EAX = 0x1
RIP = 0x40115c <check+22>
```

即程序走到了返回 1 的分支。

注意：从 `0x401155` 到 `0x40115c` 经过了 JE 和 MOV 两条指令，而不是一次 `si` 就直接执行完这两条。

### 5. TEST 实验总结

| 项目 | 输入 6 | 输入 7 |
|---|---|---|
| `x & 1` | 0 | 1 |
| EAX | 0 | 1 |
| TEST 后 ZF | 1 | 0 |
| JE | 跳转 | 不跳转 |
| 返回值 | 0 | 1 |

通过这个实验，我理解了：

- AND 能将运算结果写回寄存器。
- TEST 只更新标志位。
- JE 根据 ZF 判断是否跳转。
- 使用 `& 1` 能判断整数的奇偶性。

## 六、TEST 与 CMP 的联系

下面两条指令都能检查 EAX 是否为零：

```asm
test eax, eax
```

```asm
cmp eax, 0
```

对于判断是否为零：

```text
EAX = 0  → ZF = 1
EAX ≠ 0  → ZF = 0
```

但它们内部执行的运算不同：

- TEST：按位与。
- CMP：减法比较。

两者对其他标志位的影响也不完全相同，不能在所有场景下随意互换。

在逆向中常见：

```asm
test eax, eax
je somewhere
```

可以理解为：

```c
if (eax == 0)
```

而：

```asm
test eax, eax
jne somewhere
```

通常可以理解为：

```c
if (eax != 0)
```

这里的 C 代码表示判断条件，不一定完整对应整个程序分支。

---

## 七、Day 06 当前知识总结

| 指令 | 主要作用 |
|---|---|
| CMP | 做减法比较，只更新标志位 |
| TEST | 做按位与，只更新标志位 |
| AND | 做按位与，保存结果并更新标志位 |
| JE | ZF = 1 时跳转 |
| JNE | ZF = 0 时跳转 |
| JMP | 无条件跳转 |

### 做逆向时的分析方法

遇到条件跳转，不要只看 JE 或 JNE。

应该从前面的指令开始分析：

1. 谁设置了标志位？
2. 比较或按位运算的两个操作数是什么？
3. ZF 是 1 还是 0？
4. 条件跳转是否成立？
5. 跳转后执行哪个分支？
6. 最终返回值是什么？

### 常用 pwndbg 命令

```gdb
disassemble check
break *0x401153
run 6

info registers rip eax eflags
si
x/gx $rsp
```

其中：

- `disassemble`：查看函数汇编。
- `break *地址`：设置机器指令断点。
- `run 参数`：启动程序并传参。
- `info registers`：查看寄存器。
- `si`：执行一条机器指令。
- `x/gx`：查看内存中的 8 字节数据。

注意：本文实验中的 `0x401...` 地址来自特定编译结果。如果修改源代码、编译参数或工具链版本，实际指令地址可能发生变化，应该以当前 GDB 的反汇编输出为准。

## 八、下一节学习内容

Day 06 还需要继续学习有符号数和无符号数的大小比较：

- `JG`：有符号大于。
- `JL`：有符号小于。
- `JA`：无符号大于。
- `JB`：无符号小于。
- `SF`、`OF`、`CF`：与大小比较有关的标志位。

目前这部分尚未完成实战，不计入已掌握内容。

---

## 学习记录

**Day 05：** 已完成 CALL、RET 的理论与 pwndbg 动态调试，能够解释 RSP、RIP 和返回地址的变化。

**Day 06：** 已完成 CMP、TEST、AND、JE、JNE、JMP 的基础学习，并实际验证了密码校验和奇偶数判断的两种执行分支。

后续目标：逐步从有源代码的实验过渡到没有源代码的二进制程序分析，训练独立理解校验逻辑的能力。