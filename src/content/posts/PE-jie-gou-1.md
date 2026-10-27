---
title: "PE结构学习 #1"
slug: "PE-jie-gou-1"
date: 2026-10-24
updated: 2026-10-26
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

```
文件                          内存
┌──────────────┐            ┌──────────────┐ ← ImageBase
│ DOS头/NT头   │            │ 头部         │
│ 节表         │            │              │
├──────────────┤            ├──────────────┤ ← ImageBase + 节.VirtualAddress
│ .text        │            │ .text        │
│  PointerToRawData         │  (RVA起点)   │
│  ↑文件偏移   │  ──映射──▶ │              │
│              │            │              │
├──────────────┤            ├──────────────┤
│ .idata       │            │ .idata       │
└──────────────┘            └──────────────┘
   FOA：从文件0算           VA：ImageBase + RVA
```

这几个地址都是相对于内存说的

而对于磁盘层面：
文件偏移（FOA / File Offset）
基准：文件第 0 字节。

十六进制编辑器里跳转用的就是它。

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

```c
typedef struct _IMAGE_OPTIONAL_HEADER {
    //
    // Standard fields.
    //
    WORD    Magic;                       // 表示PE文件的标志字：0x10B = PE32, 0x20B = PE32+
    BYTE    MajorLinkerVersion;          // 链接器主版本号
    BYTE    MinorLinkerVersion;          // 链接器次版本号
    DWORD   SizeOfCode;                  // 代码节的总大小
    DWORD   SizeOfInitializedData;       // 已初始化数据节的总大小
    DWORD   SizeOfUninitializedData;     // 未初始化数据节的总大小（未初始化的数据通常在.bss中）
    DWORD   AddressOfEntryPoint;         // ★ 程序入口点的相对虚拟地址（RVA）
    DWORD   BaseOfCode;                  // 代码节起始 RVA
    DWORD   BaseOfData;                  // 数据节起始 RVA（PE32+ 无此字段）
    //
    // NT additional fields.
    //
    DWORD   ImageBase;                   // ★ 首选加载基址
    DWORD   SectionAlignment;            // ★ 节在内存中的对齐粒度（每个节被载入的地址必定为本字段指定数值的整数倍，默认的对其值为目标CPU的页尺寸，页尺寸=操作系统内存管理的最小分配单位，即一个“页（Page）”的大小。 内存不是按字节分配给进程的，而是按页为单位映射的。）
    DWORD   FileAlignment;               // ★ 节在文件中的对齐粒度
    WORD    MajorOperatingSystemVersion; // 所需操作系统主版本
    WORD    MinorOperatingSystemVersion; // 所需操作系统次版本
    WORD    MajorImageVersion;           // 映像主版本
    WORD    MinorImageVersion;           // 映像次版本
    WORD    MajorSubsystemVersion;       // 子系统主版本
    WORD    MinorSubsystemVersion;       // 子系统次版本
    DWORD   Win32VersionValue;           // 保留，必须为0
    DWORD   SizeOfImage;                 // ★ 映像在内存中的总大小
    DWORD   SizeOfHeaders;               // ★ 所有头部的总大小（含节表）
    DWORD   CheckSum;                    // 校验和
    WORD    Subsystem;                   // 子系统类型（GUI/Console等）
    WORD    DllCharacteristics;          // DLL 特性标志（ASLR/DEP等）
    DWORD   SizeOfStackReserve;          // 初始线程栈保留大小
    DWORD   SizeOfStackCommit;           // 初始线程栈提交大小
    DWORD   SizeOfHeapReserve;           // 进程堆保留大小
    DWORD   SizeOfHeapCommit;            // 进程堆提交大小
    DWORD   LoaderFlags;                 // 加载器标志（已过时）
    DWORD   NumberOfRvaAndSizes;         // 数据目录的有效条目数，自Windows NT发布以来一直都是0x10
    IMAGE_DATA_DIRECTORY DataDirectory[IMAGE_NUMBEROF_DIRECTORY_ENTRIES]; // ★ 数据目录数组（16项）
} IMAGE_OPTIONAL_HEADER32, *PIMAGE_OPTIONAL_HEADER32;
```

### 目录

数据目录位于可选头结构的末尾,包含一个或多个数据目录项（IMAGE_DATA_DIRECTORY）

每个数据目录项对应着一个特定类型的数据块

包含两个字段：VirtualAddress（表示该数据在内存中的相对虚拟地址）和Size (表示该数据块的大小)

标准定义：

```
typedef struct _IMAGE_DATA_DIRECTORY {
    DWORD   VirtualAddress;   // 数据目录项的 RVA
    DWORD   Size;             // 数据目录项的大小
} IMAGE_DATA_DIRECTORY, *PIMAGE_DATA_DIRECTORY;
```

```
IMAGE_NT_HEADERS
 ├─ Signature
 ├─ IMAGE_FILE_HEADER
 └─ IMAGE_OPTIONAL_HEADER
      ├─ Magic / AddressOfEntryPoint / ImageBase / SectionAlignment ...
      ├─ NumberOfRvaAndSizes
      └─ DataDirectory[16]        ← 数据目录在这里
           ├─ [0] 导出表  → RVA 指向 .edata 节
           ├─ [1] 导入表  → RVA 指向 .idata 节
           ├─ [5] 重定位表 → RVA 指向 .reloc 节
           └─ ...
```

## 节

节是一种组织文件内容的逻辑单元，节由处于pe文件头与数据块中间的节表 来 描述

IMAGE_NT_HEADERS
 ├─ Signature                    ("PE\0\0")
 ├─ IMAGE_FILE_HEADER            (20 字节，含 NumberOfSections)
 └─ IMAGE_OPTIONAL_HEADER        (PE32: 224 / PE32+: 240 字节)
      ├─ Magic / AddressOfEntryPoint / ImageBase / SectionAlignment ...
      ├─ NumberOfRvaAndSizes
      └─ DataDirectory[16]       ← 数据目录在这里
           ├─ [0] 导出表  → RVA 指向 .edata 节
           ├─ [1] 导入表  → RVA 指向 .idata 节
           ├─ [5] 重定位表 → RVA 指向 .reloc 节
           └─ ...

IMAGE_SECTION_HEADER[]           ← 节表紧跟可选头之后
 ├─ [0] .text    (Name / VirtualAddress / PointerToRawData / Characteristics ...)
 ├─ [1] .data
 ├─ [2] .rsrc
 └─ ...                          (项数 = NumberOfSections，每项 40 字节)

节数据区
 ├─ .text / .data / .rdata / .idata / .edata / .reloc / .rsrc ...


 ### 节表

 用于描述文件中各个节的信息，由多个节表项(IMAGE_SECTION_HEADER)数组构成

1 个节表（Section Table，整体）
  └─ 由 N 个节表项（IMAGE_SECTION_HEADER）组成的数组
       ├─ 节表项[0] → 对应节 .text
       ├─ 节表项[1] → 对应节 .data
       ├─ 节表项[2] → 对应节 .rsrc
       └─ ...


 每个节表项对应一个节，包含节的基本信息

```
typedef struct _IMAGE_SECTION_HEADER {
    BYTE    Name[IMAGE_SIZEOF_SHORT_NAME];  // 8字节节名，如".text"，不足8字节补0
    union {
        DWORD   PhysicalAddress;            // 文件偏移（用于目标文件）
        DWORD   VirtualSize;                // ★ 节在内存中的实际大小（未对齐）
    } Misc;
    DWORD   VirtualAddress;                 // ★ 节在内存中的起始 RVA
    DWORD   SizeOfRawData;                  // ★ 节在文件中对齐后的大小
    DWORD   PointerToRawData;               // ★ 节在文件中的起始偏移（FOA）
    DWORD   PointerToRelocations;           // 重定位信息偏移（可执行文件为0）
    DWORD   PointerToLinenumbers;           // 行号信息偏移（可执行文件为0）
    WORD    NumberOfRelocations;            // 重定位项数量
    WORD    NumberOfLinenumbers;            // 行号项数量
    DWORD   Characteristics;                // ★ 节属性标志（可读/写/执行等）
} IMAGE_SECTION_HEADER, *PIMAGE_SECTION_HEADER;
```

**`Name 只是标签，不可信`**

#### characteristics

节的特性

常见字段及其说明：
| 值 | 标志 | 含义 |
|---|---|---|
| `0x00000020` | `IMAGE_SCN_CNT_CODE` | 节中含**可执行代码** |
| `0x00000040` | `IMAGE_SCN_CNT_INITIALIZED_DATA` | 节中含**已初始化数据** |
| `0x00000080` | `IMAGE_SCN_CNT_UNINITIALIZED_DATA` | 节中含**未初始化数据**（如 `.bss`） |
| `0x40000000` | `IMAGE_SCN_MEM_READ` | 节在内存中**可读** |
| `0x80000000` | `IMAGE_SCN_MEM_WRITE` | 节在内存中**可写** |
| `0x20000000` | `IMAGE_SCN_MEM_EXECUTE` | 节在内存中**可执行** |
| `0x10000000` | `IMAGE_SCN_MEM_SHARED` | 节在内存中**可被共享** |
| `0x02000000` | `IMAGE_SCN_MEM_DISCARDABLE` | 节**可被丢弃**（加载后不再需要） |
| `0x00000200` | `IMAGE_SCN_LNK_INFO` | 节含**链接器信息**（目标文件用，EXE 少见） |
| `0x00000800` | `IMAGE_SCN_LNK_REMOVE` | 节在生成映像时被**移除**（目标文件用，EXE 少见） |

### 常见的节

**学 PE 时按“节”理解，不要把汇编的四段硬套进来。**

常见的节

| 节名 | 内容 | 典型属性 |
|---|---|---|
| `.text` | 可执行代码（程序指令） | 可读、可执行，含代码 |
| `.data` | 已初始化的可读写全局/静态变量 | 可读、可写，含已初始化数据 |
| `.rdata` | 只读数据（常量、字符串、导入表相关数据） | 可读，含已初始化数据 |
| `.bss` | 未初始化的全局/静态变量（文件中不占实际空间） | 可读、可写，含未初始化数据 |
| `.idata` | 导入表（Import Table），记录依赖的 DLL 和函数 | 可读，含已初始化数据 |
| `.edata` | 导出表（Export Table），DLL 对外提供的函数 | 可读，含已初始化数据 |
| `.reloc` | 基址重定位表（Base Relocation），修正绝对地址 | 可读，可丢弃 |
| `.rsrc` | 资源（图标、菜单、对话框、版本信息等） | 可读，含已初始化数据 |

### 节的对其值

PE文件节的大小需要对

### 文件偏移与虚拟内存地址转换

一些PE文件为了减小体积，将节的文件对齐值设置为0x200，而非一个内存页的大小0x1000

由于对其值不同，所以它在磁盘映像和内存映像是不同的

PE文件被映射到内存后，DOS头部，PE文件头和节表的偏移位置和大小都没有发生变化

但各个节被映射到内存后，他们的偏移位置就发生了变化

比如，.text节初始位置与文件头的偏移量为add1，映射到内存后，.text节起始位置与文件头（基地址）的偏移量为add2

这是因为映射到内存后，.text节与节表之间形成了一大段用0填充的空隙

add1就是文件偏移地址

## 导入表

导入表用来存储程序运行时所需的外部函数或变量的引用信息

### 导入函数的调用

导入函数是在编写程序时引用其他模块中的函数

需要在代码中声明名称和参数

编译器生成的是对函数地址的引用，程序运行时，操作系统负责将程序中对导入函数的引用解析为实际的函数地址，这个过程被称之为动态链接

