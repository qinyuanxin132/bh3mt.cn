---
title: "PE结构学习 #1"
slug: "PE-jie-gou-1"
date: 2026-10-09
updated: 2026-10-09
published: true
categories: ["PE结构学习"]
tags: ["PE结构学习"]
---
> 发布于 2026-10-24 11:09:25
> 
# PE结构学习 #1 windows向

PE文件主要结构包括
- DOS部分，包含DOS头和  DOS存根（保持向后兼容）
- PE文件头,包含PE标示，文件头，可选头
- 节表,描述文件中的所有节，操作系统根据这些信息将文件的不同部分映射到进程的地址空间中，并根据定义的属性对他们进行访问控制
- 节数据 

## PE的基本概念

### 基地址

基地址是模块被加载到内存中的初始虚拟地址，提供了文件内所有相对地址计算的基准点

可执行文件内部的代码和数据在引用自身的其他部分时，都是基于这个地址进行偏移的

### 虚拟地址

虚拟地址空间是操作系统提供给应用程序的一种抽象，使用虚拟地址的每个进程看似拥有连续的内存，实际上这些内存在物理上可能是分散的

### 相对虚拟地址（RVA）

RAV描述了一个从PE文件的基地址开始的偏移量，用于定位文件内部的数据，函数，资源等

虚拟地址 = 基地址 + 相对虚拟地址

### 文件偏移地址

用于直接定位存储在磁盘上的PE文件内的任意结构的精确位置
在使十六进制编辑器打开PE文件时，显示的地址通常就是文件偏移地址

## DOS部分

### DOS MZ 头
是一个结构体，有很多字段

最重要的两个字段：  

WORD e_magic;  可执行文件的标识
WORD e_lfanew;  存PE头的偏移

e_magic字段是一个16位的无符号整数，用于表示DOS MZ头的签名通常是一个固定的值``5A4D `` （字符MZ的ASCII码）注意小端模式：

```
字节: 4D 5A
WORD: 0x5A4D
```

e_lfanew 字段是一个32位的长整型，表示PE文件头的偏移量，它指示了PE文件头相对于文件开头以字节为单位的位置

### DOS存根

位于DOS MZ头与PE头之间
DOS存根实际上是一个有效的DOS可执行程序，在不支持PE文件结构的操作系统中会显示一个错误提示

## PE 文件头

紧跟在DOS存根后面

### Signature字段

Signature 字段是一个32位的固定值`0x00004550`  （PE\0\0）
用来标示这是个PE文件

### IMAGE_FILE_HEADER 结构

映像文件头（IMAGE_FILE_HEADER）结构定义了PE文件的基本特征:`文件类型`,`平台类型`,`节数量`等

```
typedef struct _IMAGE_FILE_HEADER {
    WORD  Machine;              // 平台类型
    WORD  NumberOfSections;     // 文件的节数量
    DWORD TimeDateStamp;        // 文件创建的时间戳
    DWORD PointerToSymbolTable; // 指向符号表（符号表的文件偏移）
    DWORD NumberOfSymbols;      // 符号表中的符号数量
    WORD  SizeOfOptionalHeader; // PE扩展头结构大小（可选头的大小）
    WORD  Characteristics;      // 文件属性，exe、dll等（文件的特征标志）
} IMAGE_FILE_HEADER, *PIMAGE_FILE_HEADER;
```
#### Machine
表示可执行文件目标平台的类型

| 标志 | 运行平台 |
| ---  | ---      |
|0x014C|Inter 386 及其兼容处理器|
|0x0162|MIPS R3000|
|0x0166|MIPS R4000|
|0x01A2|Alpha AXP|
|0x01C0|ARM|
|0x01F0|Power PC|
|0x0200|Inter IA-64(itanium)|
|0x8664|x86-64(AMD64)|

#### NumberOfSections
PE文件中节的数量

#### TimeDataStamp

表示创建PE文件的时间戳

#### PointerToSymbolTable

如果存在符号表，该字段表示符号表的偏移量
如果不存在，为零

符号表通常包含文件中定义的各种符号，如函数名，变量名等

#### NumberOfSymbols

如果存在符号表，改字段表示符号表中的符号数量
不存在为0

#### SizeOfOptionalHeader

表示可选头即`IMAGE_OptionalH_eader`的大小

#### Characteristics

表示文件的特征标志

表9-2 常见的文件特征标志（IMAGE_FILE_HEADER.Characteristics）

| 值 | 标志 | 含义 |
|---|---|---|
| `0x0001` | `IMAGE_FILE_RELOCS_STRIPPED` | 无重定位信息，必须加载到首选基址 |
| `0x0002` | `IMAGE_FILE_EXECUTABLE_IMAGE` | 文件可执行 |
| `0x0004` | `IMAGE_FILE_LINE_NUMS_STRIPPED` | COFF 行号已被移除 |
| `0x0008` | `IMAGE_FILE_LOCAL_SYMS_STRIPPED` | COFF 符号表条目已被移除 |
| `0x0010` | `IMAGE_FILE_AGGRESSIVE_WS_TRIM` | 内存使用策略为最小化内存使用（已过时） |
| `0x0020` | `IMAGE_FILE_LARGE_ADDRESS_AWARE` | 可处理大于 2GB 的地址 |
| `0x0080` | `IMAGE_FILE_BYTES_REVERSED_LO` | 低位字节反转（已过时） |
| `0x0100` | `IMAGE_FILE_32BIT_MACHINE` | 机器支持 32 位字 |
| `0x0200` | `IMAGE_FILE_DEBUG_STRIPPED` | 调试信息已被移除 |
| `0x0400` | `IMAGE_FILE_REMOVABLE_RUN_FROM_SWAP` | 可移动介质上运行时复制到交换文件 |
| `0x0800` | `IMAGE_FILE_NET_RUN_FROM_SWAP` | 网络驱动器上运行时复制到交换文件 |
| `0x1000` | `IMAGE_FILE_SYSTEM` | 文件是系统文件 |
| `0x2000` | `IMAGE_FILE_DLL` | 文件是 DLL |
| `0x4000` | `IMAGE_FILE_UP_SYSTEM_ONLY` | 只能在单处理器计算机上运行 |
| `0x8000` | `IMAGE_FILE_BYTES_REVERSED_HI` | 高位字节反转（已过时） |

## IMAGE_OPTIONAL_HEADER 结构

可选头(Optional Header)包含了PE文件许多关键属性
如程序入口点地址，文件对齐方式，图像基址，数据目录等

在32位的PE文件中，可选头被定义为IMAGE_OPTIONAL_HEADER32
64位则IMAGE_OPTIONAL_HEADER64

