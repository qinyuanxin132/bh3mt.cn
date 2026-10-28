---
title: "PE结构学习 #1"
slug: "PE-jie-gou-1"
date: 2026-10-24
updated: 2026-10-28
published: true
categories: ["PE结构学习"]
tags: ["PE结构学习"]
---
> 发布于 2026-10-24 11:09:25
> 最后更新时间 2026-10-28 16:09:25
# PE结构学习 #1 windows向

## 总览

```
PE 文件
├─ IMAGE_DOS_HEADER                      文件偏移 0，64 字节，DOS 兼容头
│  ├─ e_magic    WORD   = 0x5A4D ('MZ')   DOS 签名，判断是否为 MZ 可执行文件
│  └─ e_lfanew   DWORD  → PE 头偏移        从文件开头算起的 PE 头偏移（FOA）
├─ DOS 存根                                位于 DOS 头与 PE 头之间，有效 DOS 程序
│                                          在不支持 PE 的系统上会打印 "This program cannot be run in DOS mode"
└─ IMAGE_NT_HEADERS                      @ e_lfanew，PE 头总入口
   ├─ Signature   DWORD = 0x00004550 ('PE\0\0')    PE 文件标识
   ├─ IMAGE_FILE_HEADER                  20 字节，文件基本特征
   │  ├─ Machine                WORD     目标平台（0x014C=x86，0x8664=x64，0x01C0=ARM）
   │  ├─ NumberOfSections       WORD     → 节表项数，决定后面 IMAGE_SECTION_HEADER 数组长度
   │  ├─ TimeDateStamp          DWORD    文件创建时间戳（Unix 时间）
   │  ├─ PointerToSymbolTable   DWORD    符号表 FOA；无符号表时为 0
   │  ├─ NumberOfSymbols        DWORD    符号表条目数；无符号表时为 0
   │  ├─ SizeOfOptionalHeader   WORD     (224 / 240) 可选头大小，PE32=224，PE32+=240
   │  └─ Characteristics        WORD     文件属性：0x0002=可执行，0x2000=DLL，0x0100=32位
   ├─ IMAGE_OPTIONAL_HEADER32/64         可选头 224 / 240 字节，关键运行属性
   │  ├─ Magic                  WORD     0x10B=PE32，0x20B=PE32+，决定后续字段布局
   │  ├─ AddressOfEntryPoint    DWORD    入口点 RVA；DLL 可为 0（由 DllMain 决定）
   │  ├─ ImageBase              DWORD    首选加载基址；EXE 默认 0x400000，DLL 默认 0x10000000
   │  ├─ SectionAlignment       DWORD    内存对齐，通常 0x1000（一个内存页）
   │  ├─ FileAlignment          DWORD    文件对齐，通常 0x200（一个磁盘扇区）
   │  ├─ SizeOfImage            DWORD    加载到内存后的总大小，按 SectionAlignment 对齐
   │  ├─ SizeOfHeaders          DWORD    所有头部（DOS+NT+节表）总大小，按 FileAlignment 对齐
   │  ├─ Subsystem              WORD     子系统：2=GUI，3=Console
   │  ├─ DllCharacteristics     WORD     ASLR/DEP/CFG 等安全特性
   │  ├─ NumberOfRvaAndSizes    DWORD    = 0x10，数据目录有效项数
   │  └─ DataDirectory[16]      IMAGE_DATA_DIRECTORY[16]，16×8=128 字节
   │     ├─ [0] 导出表     { RVA, Size } → .edata      DLL 对外提供的函数
   │     ├─ [1] 导入表     { RVA, Size } → .idata（展开见下）  依赖的外部函数
   │     ├─ [5] 重定位表   { RVA, Size } → .reloc      基址被改时修正绝对地址
   │     ├─ [2] 资源表     { RVA, Size } → .rsrc
   │     ├─ [3] 异常表     { RVA, Size } → .pdata      仅 x64
   │     ├─ [4] 安全目录   { RVA, Size } → 证书
   │     ├─ [6] 调试目录   { RVA, Size } → .debug
   │     ├─ [9] TLS 表     { RVA, Size } → .tls
   │     └─ ...
   └─ IMAGE_SECTION_HEADER[]             紧跟可选头，每项 40 字节，共 NumberOfSections 项
      ├─ [0] .text                        代码节
      │  ├─ Name[8]              BYTE[8]  节名，只是标签，不可信（可被改）
      │  ├─ VirtualSize          DWORD (Misc)  节在内存中的实际大小（未对齐）
      │  ├─ VirtualAddress       DWORD  RVA      节在内存中的起始 RVA
      │  ├─ SizeOfRawData        DWORD            节在文件中对齐后的大小
      │  ├─ PointerToRawData     DWORD  FOA      节在文件中的起始偏移
      │  └─ Characteristics      DWORD            属性：0x20000000=可执行，0x40000000=可读，0x80000000=可写
      ├─ [1] .data                        已初始化可读写数据
      ├─ [2] .rdata / .idata / .edata / .reloc / .rsrc ...   只读数据/导入/导出/重定位/资源
      └─ ...

节数据区
├─ .text / .data / .rdata / .idata / .edata / .reloc / .rsrc
└─ ...                                    按节表 PointerToRawData 定位，按 VirtualAddress 映射

────────────────────────────────────────────────────────────
DataDirectory[1] 展开：导入表
────────────────────────────────────────────────────────────

DataDirectory[1].VirtualAddress           导入表 RVA；只认这个值，不认节名
└─ IID 数组   IMAGE_IMPORT_DESCRIPTOR[]   每项 20 字节，每个 IID 描述一个 DLL
   ├─ IID[0]   Name → "KERNEL32.dll"      该 IID 对应依赖的 DLL
   │  ├─ +0x00  OriginalFirstThunk   RVA → INT     指向导入名称表；为 0 时用 FirstThunk 当 INT
   │  ├─ +0x04  TimeDateStamp        DWORD         0=未绑定；0xFFFFFFFF=已绑定
   │  ├─ +0x08  ForwarderChain       DWORD         转发链索引；通常 -1/0，解析可忽略
   │  ├─ +0x0C  Name                 DWORD → DLL 名字符串   以 '\0' 结尾
   │  └─ +0x10  FirstThunk           RVA → IAT     指向导入地址表；加载后被填真实地址
   ├─ IID[1]   Name → "USER32.dll" ...
   └─ IID[k]   全零 → 数组结束                    5 个 DWORD 全 0；常用 Name==0 判断

INT   IMAGE_THUNK_DATA[]   每项 4/8 字节，导入名称表（文件态线索）
├─ ITD[0]   最高位=0  RVA → IIBN                  按名字导入，RVA 指向函数名结构
├─ ITD[1]   最高位=0  RVA → IIBN("ReadFile")      同上
├─ ITD[2]   最高位=1  低31位=序号（按序号导入）    按序号导入，低位直接是导出序号
└─ ITD[n]   = 0 → 数组结束                        每个 DLL 的 INT 以 0 结尾

IIBN   IMAGE_IMPORT_BY_NAME   可变长，函数名片
├─ Hint     WORD   导出表建议序号                  只是优化提示，查不到再按 Name 查
└─ Name[]   "CreateFileA"，以 '\0' 结尾            函数名字符串

IAT   IMAGE_THUNK_DATA[]   每项 4/8 字节，导入地址表（结果表）
├─ ITD[0]   文件态：镜像 INT / 加载后：真实函数 VA  程序运行时通过它间接调用
├─ ITD[1]                                          加载器把查到的真实地址写进对应槽位
└─ ITD[n]   = 0 → 数组结束
```


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
|0x014C|Intel 386 及其兼容处理器|
|0x0162|MIPS R3000|
|0x0166|MIPS R4000|
|0x01A2|Alpha AXP|
|0x01C0|ARM|
|0x01F0|Power PC|
|0x0200|Inter IA-64(itanium)|
|0x8664|x86-64(AMD64)|

#### NumberOfSections
PE文件中节的数量

#### TimeDateStamp

表示创建PE文件的时间戳

#### PointerToSymbolTable

如果存在符号表，该字段表示符号表的偏移量
如果不存在，为零

符号表通常包含文件中定义的各种符号，如函数名，变量名等

#### NumberOfSymbols

如果存在符号表，该字段表示符号表中的符号数量
不存在为0

#### SizeOfOptionalHeader

表示可选头即`IMAGE_OPTIONAL_HEADER`的大小

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

### 节的对齐值

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

导入地址表(Import Address Table IAT)用于记录程序中所有导入函数的地址

在程序加载中，操作系统会根据导入表加载DLL文件并解析函数地址，将这些地址填充到IAT中（它预先填好了函数名或序号信息，等程序加载时由系统用真实函数地址覆盖掉）

###  IMAGE_IMPORT_DESCRIPTOR 结构

在PE可选头中，目录结构的第一个成员指向导出表，第二个成员指向导入表


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

导入表是由一个IMAGE_IMPORT_DESCRIPTOR (IID)数组开始的，IID数组通常以NULL单元结尾，用来确定读到IID数组尾部

```
typedef struct _IMAGE_IMPORT_DESCRIPTOR {
    union {
        DWORD   Characteristics;        // 为 0 时表示这是导入表的最后一个元素（终止符）
        DWORD   OriginalFirstThunk;     // 包含导入名称表INT的RVA，指向 INT (导入名称表)
    } DUMMYUNIONNAME;
    DWORD       TimeDateStamp;          // 时间戳 （表示DLL创建时间）（与绑定导入相关，未绑定时为 0）
    DWORD       ForwarderChain;         // 转发链索引；通常为 -1（0xFFFFFFFF）表示无转发；0 也常被部分资料视为“无转发/未启用”，实际解析通常可忽略
    DWORD       Name;                   // RVA，指向 DLL 名称字符串（以 '\0' 结尾）
    DWORD       FirstThunk;             // RVA，指向 IAT (导入地址表)
} IMAGE_IMPORT_DESCRIPTOR, *PIMAGE_IMPORT_DESCRIPTOR;
```

INT 和 IAT 都是“ITD 数组”；每个 ITD 就是一个双字，文件状态下它要么指向函数名结构、要么直接是序号；加载后 IAT 里的 ITD 被换成真实函数地址。INT 是“查询线索表”，IAT 是“结果地址表”，两者元素类型相同、数组都以 0 结尾。

IMAGE_THUNK_DATA:

```
typedef struct _IMAGE_THUNK_DATA32 {
    union {
        DWORD ForwarderString;  // 转发字符串 RVA
        DWORD Function;         // 加载/绑定后的真实函数地址（VA）
        DWORD Ordinal;          // 按序号导入时的函数序号
        DWORD AddressOfData;    // 指向 IMAGE_IMPORT_BY_NAME 的 RVA（按名字导入）
    } u1;
} IMAGE_THUNK_DATA32;
```

数据目录[1] → IID 数组
                │
                ├─ IID[0] ── Name ─────────→ "KERNEL32.dll"
                │    ├─ OriginalFirstThunk → INT ── ITD[0] → IIBN("CreateFileA")
                │    │                              ITD[1] → IIBN("ReadFile")
                │    │                              ITD[n] = 0
                │    └─ FirstThunk ────────→ IAT ── ITD[0]（文件里镜像 INT；加载后=真实地址）
                │                                  ITD[1]
                │                                  ITD[n] = 0
                ├─ IID[1] ── Name ─────────→ "USER32.dll"
                │    ├─ OriginalFirstThunk → INT ...
                │    └─ FirstThunk ────────→ IAT ...
                └─ IID[k] = 全零（数组结束）

typedef struct _IMAGE_IMPORT_BY_NAME {
    WORD Hint;       // 序号提示，导出表中的建议序号
    BYTE Name[1];    // 函数名字符串，以 '\0' 结尾，长度可变
} IMAGE_IMPORT_BY_NAME, *PIMAGE_IMPORT_BY_NAME;

### PE装载器

INT和IAT两个并行的指针数组都指向IMAGE_IMPORT_BY_NAME结构，其中INT不可改写，IAT是PE装载器重写的（文件里(PE装载器重写前)的IAT通常和INT一模一样，装的是名字线索）

装载器拿 INT 里的名字去搜索，然后在目标 DLL 的导出表里找到该函数的真实地址，再把它写进 IAT 对应的槽位

## 导出表

导出表(Export Table)用于记录PE文件所导出的函数和数据,使得其他DLL文件或可执行文件能够访问和调用这些导出的函数和数据

在程序运行时，操作系统会将程序和DLL文件加载到内存中，PE装载器会根据DLL文件的导出表填充IAT，来建立和DLL之间的连接关系

### IMAGE_EXPORT_DESCRIPTOR

typedef struct _IMAGE_EXPORT_DIRECTORY {
    DWORD   Characteristics;       // 特征标志
    DWORD   TimeDateStamp;         // 时间戳
    WORD    MajorVersion;          // 主版本号
    WORD    MinorVersion;          // 次版本号
    DWORD   Name;                  // RVA，指向 DLL 名字符串（以 '\0' 结尾）
    DWORD   Base;                  // 导出函数序号的基准值
    DWORD   NumberOfFunctions;     // AddressOfFunctions 数组的元素个数
    DWORD   NumberOfNames;         // AddressOfNames / AddressOfNameOrdinals 的元素个数
    DWORD   AddressOfFunctions;    // RVA，指向函数地址数组（DWORD[]）
    DWORD   AddressOfNames;        // RVA，指向函数名 RVA 数组（DWORD[]）
    DWORD   AddressOfNameOrdinals;// RVA，指向名字对应的序号数组（WORD[]）
} IMAGE_EXPORT_DIRECTORY, *PIMAGE_EXPORT_DIRECTORY;

## 加载顺序

```
用户双击 exe
  │
  ├─ 1. CreateProcess
  ├─ 2. 内核创建进程，映射 ntdll
  ├─ 3. ntdll!LdrInitializeThunk → LdrpInitializeProcess
  │     ├─ 3.1 解析 DOS/NT 头，检查合法性
  │     ├─ 3.2 保留地址空间，映射头部和节
  │     ├─ 3.3 重定位（ActualBase != ImageBase 时）
  │     ├─ 3.4 解析导入表，递归加载依赖 DLL，填 IAT
  │     ├─ 3.5 处理 TLS 回调（DLL 的）
  │     ├─ 3.6 调用各 DLL 的 DllMain(DLL_PROCESS_ATTACH)
  │     └─ 3.7 跳到主模块 AddressOfEntryPoint
  ├─ 4. CRT 启动代码（mainCRTStartup / WinMainCRTStartup）
  └─ 5. 你的 main / WinMain
```

### CRT 启动代码
AddressOfEntryPoint 指向的不是你的 main，而是 CRT 的启动函数：

控制台程序：mainCRTStartup

GUI 程序：WinMainCRTStartup

CRT 启动代码做这些事：

初始化全局变量、堆、I/O；

调用 C++ 全局对象的构造函数；

准备 argc/argv；

最后调用你的 main / WinMain。