---
title: "西电CTF 2026 Assembly"
slug: "xi-dian-ctf-2026-assembly"
date: 2026-09-23
updated: 2026-09-23
published: true
categories: []
tags: []
---

# 西电CTF 2026 Assembly

> 发布于 2026-09-23 07:29:47

1.学习汇编语言（到能看懂教程AI写的）

### **1.1 通用寄存器（64位 / 32位对应关系）**

- `rax` / `eax`：**累加器，最重要的寄存器**。函数执行完，**返回值**放在这里；算术运算结果也常放这里。

- `rbx` / `ebx`：基址寄存器，偶尔用来存局部变量，但不多见。

- `rcx` / `ecx`：**计数器**。循环时经常用来倒数，或者记录循环次数。

- `rdx` / `edx`：数据寄存器。乘除法时会用到，或者作第三个参数。

- `rdi` / `edi`：**Destination Index**，目的索引。在函数传参时通常是**第一个参数**。

- `rsi / esi`：**Source Index**，源索引。在函数传参时通常是**第二个参数**。

- `rbp` / `ebp`：**栈底指针**。用来标记当前函数的“地基”，局部变量都靠它定位。

- `rsp` / `esp`：**栈顶指针**。始终指向栈的最顶端。

- `r8` ~ `r15`：第5个到第9个参数，或者随便用来存数据。

### **1.2 函数调用与参数传递（Linux x64）**

- 参数1：`rdi`

- 参数2：`rsi`

- 参数3：`rdx`

- 参数4：`rcx`

- 参数5：`r8`

- 参数6：`r9`

- 返回值：`rax`
*(Windows x64 则是 *`rcx, rdx, r8, r9`

## **第二章：寻址与数据搬运（怎么找东西）**

### **2.1 核心符号 **`[]`

汇编里，`[]` 就是**“去这个地址里拿东西”**的意思。

- `mov rax, rbx`：把 `rbx` 的值**复制**给 `rax`。（不带括号，是传值）

- `mov rax, [rbx]`：以 `rbx` 的值作为**地址**，去那个地址里把数据**取出来**给 `rax`。（带括号，是去地址拿）

- `mov [rbx], rax`：把 `rax` 的值**写入**以 `rbx` 为地址的内存里。

### **2.2 数据宽度限定符**

内存不会自动告诉你它有多大，所以你经常看到：

- `byte ptr [rsi]`：只处理 1 个字节（8位，常用于处理 char 字符串）。

- `word ptr [rsi]`：处理 2 个字节（16位）。

- `dword ptr [rsi]`：处理 4 个字节（32位，常用于 int）。

- `qword ptr [rsi]`：处理 8 个字节（64位，常用于指针）。

### **2.3 高频搬运指令**

- `mov dest, src`：赋值。

- `lea dest, [addr]`：**Load Effective Address，极其重要！** 它虽然带着 `[]`，但**不取数据**，而是直接把 `addr` 这个地址（或者算式的结果）赋给 `dest`。例如 `lea rdi, [buf]` 就是把 `buf` 的地址给 `rdi`。

- `push src` / `pop dest`：把数据压入栈顶 / 从栈顶弹出数据（栈是向下生长的，`rsp` 会随之减小/增大）。

- `movzx dest, src` / `movsx dest, src`：零扩展/符号扩展搬运（比如从 1 个字节扩展到 4 个字节，常常用于从字符串取字符并转成 int）。

---

## **第三章：算术与逻辑运算（怎么算）**

- `add dest, src`：`dest = dest + src`

- `sub dest, src`：`dest = dest - src`

- `inc dest` / `dec dest`：`dest++` / `dest--`

- `xor dest, src`：异或。**逆向高频考点**，常用于简单加密/解密（`A ^ B = C`，则 `C ^ B = A`）。

- `and dest, src` / `or dest, src`：按位与/或。

- `shl dest, n` / `shr dest, n`：左移/右移 n 位。左移相当于乘 `2^n`，右移相当于除以 `2^n`。

- `imul` / `idiv`：有符号乘除法。（除法结果中，`rax` 存商，`rdx` 存余数）。

- **特殊技巧**：`xor eax, eax` 等价于 `eax = 0`。编译器觉得这样生成代码更短，所以经常这么写。

---

## **第四章：控制流（怎么拐弯）**

汇编的执行默认从上到下，如果遇到跳转指令，就会改变流程。

### **4.1 比较与测试**

- `cmp a, b`：比较 a 和 b。底层做 `a - b`，但不保存结果，**只影响标志位**（比如 Zero Flag 等）。

- `test a, b`：逻辑与。底层做 `a & b`，不保存结果，**只影响标志位**。`test eax, eax` 常用于判断 `eax` 是否为 0（如果为 0，Zero Flag 会被置位）。

### **4.2 跳转指令（翻译成 C 语言）**

- `jmp label`：无条件跳转，等于 C 语言的 `goto label;`。

- `je label` (Jump if Equal) / `jz label` (Jump if Zero)：相等（或结果为0）就跳。通常跟在 `cmp` 或 `test` 后。*翻译：* `if (a == b) goto label;`

- `jne label` (Jump if Not Equal) / `jnz label`：不相等就跳。*翻译：* `if (a != b) goto label;`

- `jg label` (Jump if Greater) / `jge`：有符号比较，大于/大于等于就跳。*翻译：* `if (a > b) goto label;`

- `jl label` (Jump if Less) / `jle`：有符号比较，小于/小于等于就跳。

- `ja label` (Jump if Above) / `jb`：无符号比较。

- `jae` / `jbe`：无符号大于等于/小于等于。

### **4.3 循环结构的识别**

汇编里没有直接的 `for`，通常是以下面这种形式出现：

asm

```
    mov ecx, 5      ; 初始化计数器
loop_start:
    ; ... 循环体内容 ...
    dec ecx         ; 计数器减 1
    cmp ecx, 0      ; 比较是否为 0
    jne loop_start  ; 不等于 0 就跳回去继续循环
```

这就是一个简单的 `for (int i = 5; i != 0; i--)` 结构。
如果往回跳（比如跳转地址小于当前地址），基本就是循环。

---

## **第五章：函数、栈帧与调用（模块化阅读）**

看懂函数，是阅读汇编的关键一步。每个函数都有它的“规矩”。

### **5.1 函数的标准开头（序言）**

asm

```
push rbp        ; 保存上一个函数的栈底
mov rbp, rsp    ; 建立当前函数的栈底
sub rsp, 0x20   ; 开辟 0x20 字节的栈空间，给局部变量用
```

- 此时，局部变量通常是 `[rbp-4]`、`[rbp-8]`、`[rbp-0x10]`。

- 传入的参数（如果是通过栈传的）通常是 `[rbp+8]`、`[rbp+0x10]`。

### **5.2 函数的标准结尾（尾声）**

asm

```
leave           ; 等价于 mov rsp, rbp; pop rbp; 恢复之前的栈
ret             ; 弹出返回地址，跳回调用处
```

### **5.3 函数调用**

- `call func`：调用函数。相当于 `push 返回地址; jmp func`。

- 如果遇到 `call printf`、`call strcmp`、`call scanf`，直接去查这些 C 标准库函数的作用，就能猜出代码在干嘛。

---

## **第六章：逆向实战中的“汇编翻译套路”**

拿到汇编不要从头读到尾，找**模式**：

- **字符串遍历模式**：
看到 `movzx eax, byte ptr [rsi]`（取一个字符） -> 后面跟着 `add` / `xor` / `sub` 等运算 -> 再 `mov [rdi], al`（写回）。这就是一个遍历字符串进行运算的循环。

- **判断正确/错误模式**：
看到连续的 `cmp` 后跟 `jne 失败分支`，大概率是逐字节比对 Flag。

- **数学运算跳转模式**：
像你上一题一样，先算几道题，如果算对了就去解密输出真 Flag，算错了就去输出假 Flag（防爆破/防静态分析）。

- **取地址与赋值模式**：
`lea rdi, [buf]`（把 buf 地址给 rdi） -> `call` 某个函数。大概率是把 buf 作为输出缓冲区传给函数。
