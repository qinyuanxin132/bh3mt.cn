---
title: "逆向学习手记 #2 IDA工具使用"
slug: "ni-xiang-xue-xi-shou-ji-2-idagong-ju-shi-yong"
date: 2026-10-09
updated: 2026-10-09
published: true
categories: ["逆向入门"]
tags: ["逆向入门"]
---

# 逆向学习手记 #2 IDA工具使用

> 发布于 2026-10-09 11:25:00

参考链接[【逆向】IDA Pro - 知乎](https://zhuanlan.zhihu.com/p/474207234)

# AI快捷键总结

### **🛠️ IDA Pro 逆向实战快捷键速查表**

#### **1. 窗口与导航（查看代码必备）**

- **空格键**：在**图形视图**（流程图）和**文本视图**之间切换。

- `Ctrl + 鼠标滚轮`：在图形视图中缩小/放大。

- `G`：跳转到地址（Jump to address），输入十六进制地址直达。

- `Esc`：返回上一个操作位置（相当于浏览器的后退）。

- `Ctrl + Enter`：前进到下一个操作位置。

- `Alt + M`：标记当前位置（Mark position）。

- `Ctrl + M`：跳转到标记位置。

- `Shift + F4`：打开十六进制视图（Hex View），搜二进制字节必备。

- `Shift + F12`：打开字符串窗口（Strings Window），比点菜单快得多。

- `Ctrl + S`：打开段列表（Segments），查看代码段、数据段地址。

#### **2. 反编译与代码分析（F5永远的神）**

- `F5`：生成伪代码（Hex-Rays Decompiler），逆向的核心动作。

- `X`：查看交叉引用（Cross References），找谁调用了这个函数，极其重要。

- `P`：在当前位置创建函数（Create Function）。处理花指令或IDAL没有识别出函数时用。

- `C`：将数据转换为代码（Code）。

- `U`：取消定义（Undefine），把代码或数据恢复成原始字节，处理花指令第一步。

- `D`：转换数据类型（db, dw, dd），处理数据段时用。

- `A`：将数据转换为 ASCII 字符串。

- `N`：重命名（Rename）。把 `sub_401000` 改成 `check_flag`，极大增加可读性。

- `:`：输入注释（仅当前行）。

- `;`：输入可重复注释（所有引用该处的地方都会显示）。

#### **3. 搜索与查找（快速定位关键逻辑）**

- `Alt + B`：二进制搜索（搜索字节序列，注意需在代码段内且未被解析为指令）。

- `Alt + T`：文本搜索（搜字符串、指令）。

- `Ctrl + F`：在反汇编窗口或伪代码窗口内搜索。

- `Alt + F`：搜索下一个。

#### **4. 调试相关（IDAPython/Debugger）**

- `F2`：下断点（在汇编窗口内）。

- `F7`：单步步入（Step Into，遇到函数会跟进去）。

- `F8`：单步步过（Step Over，不跟入函数）。

- `F9`：运行程序。

- `Shift + F2`：打开脚本命令行（IDAPython），比赛写脚本脱花指令的利器。

---

### **💡 赛前实战避坑小贴士**

- **关于 **`P`** 键和 **`C`** 键**：你上次做花指令题，搜到 `11 22 33` 后，就是按 `U` 取消定义，再按 `C` 转成代码，最后在函数开头按 `P` 重建函数。

- **关于交叉引用 **`X`：比赛中，如果你搜到了 `flag` 或 `Input flag:` 字符串，双击进去，**一定要按 **`X`，看哪里引用了这个字符串，这是定位核心逻辑的黄金法则。

- **关于 **`F5`：如果按 `F5` 报错（比如 `positive sp value` 警告），说明栈不平衡（通常是因为花指令或编译器优化）。别死磕，切到汇编视图，按 `空格键` 看流程图，一样能分析。

### **0x01简介**

IDA是按区块装载PE文件的，例如

- .text（代码块）

- .data（数rc

- .idata（输入表）

- .edata（输出表）

“[Kernel](https://zhida.zhihu.com/search?content_id=193510549&content_type=Article&match_order=1&q=Kernel&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3OTE3MTU0NjQsInEiOiJLZXJuZWwiLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoxOTM1MTA1NDksImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.g5AXlMDfrnIqTsuoKrxNkEkbz8X6rWhKCQ1muyKIk6M&zhida_source=entity) optionl” “Kernel option2”“Proce

![](../attachments/upload/v2-a1b1de33ddad3bea06d169a01075c903_1440w.jpg)

- 问题的代码，将“Kernel option2”中的“Make final analysis pass”选项关闭是一个很好的办法。

- 在某些情况下，一些代码会因不在预计的位置而不被确认，这时选中“Ke

![](../attachments/upload/v2-8ce810e2a003f0ba82d7952ac51d31f7_1440w.jpg)

![](../attachments/upload/v2-f6907e7a264ed16c04bbea699d0761ff_1440w-yGOg.png)

![](../attachments/upload/v2-f713efe2a073bb366d18896440f34932_1440w.png)

在图形视图中，IDA以流程图的形式显示代码，将函数分解成许多基本快，从而生动显示函数由一块到另一块的控制流程。用户可以使用 ”Ctrl+鼠标滚轮“ 调剂图形大小，使用***空格键***在图形视图和文本视图之间切换，或者选择右键快捷键菜单中的”Text view“选项切换到文本模式。

### **2、导航栏**

选择“ View”->“Open subviews" ->"Disassembly" 选项，打开反汇编子窗口，就可以用多个反汇编[窗口分析](https://zhida.zhihu.com/search?content_id=193510549&content_type=Article&match_order=1&q=%E7%AA%97%E5%8F%A3%E5%88%86%E6%9E%90&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3OTE3MTU0NjQsInEiOiLnqpflj6PliIbmnpAiLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoxOTM1MTA1NDksImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.DFj8xJ-tGUzQ89aIun9oZd-dZZ9PetXPRWayS1W16EM&zhida_source=entity)同一个程序了。
其他常用窗口，例如：“Functions”和“Proximity browser”，也可以使用这个菜单打开。

- Library function：[库函数](https://zhida.zhihu.com/search?content_id=193510549&content_type=Article&match_order=1&q=%E5%BA%93%E5%87%BD%E6%95%B0&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3OTE3MTU0NjQsInEiOiLlupPlh73mlbAiLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoxOTM1MTA1NDksImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.AfDmcreULnXkC7N0_ayF_aLp5Yi8dKHEfMX-NwmNnkw&zhida_source=entity)

- Data：数据

- Regular function：[规则函数](https://zhida.zhihu.com/search?content_id=193510549&content_type=Article&match_order=1&q=%E8%A7%84%E5%88%99%E5%87%BD%E6%95%B0&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3OTE3MTU0NjQsInEiOiLop4TliJnlh73mlbAiLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoxOTM1MTA1NDksImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.fpmrRbS1sYpxFBwdgG3HophAsdywMdOsFYtbEWimwkU&zhida_source=entity)

- Unexplored：未查到的函数

- Instruction：指令

- External symbol：外部符号

### **3、注释**

使用IDA可以方便地在代码后输入注释，在窗口右边空白处单击右键，将显示输入注释的快捷菜单项，

- “Enter comment” （快捷键 ：）输入的注释只会在该处出现

- “Enter repeatable comment” （快捷键 ；）输入的注释在所有交叉参考处都会出现

如果一个地址处有两种注释，将只会显示非重复注释。

### **4、提示窗口**

IDA界面下方的提示窗口是IDA的输出控制台，主要用于反馈各种信息，例如文件分析进度、状态信息、错误消息及IDA脚本或插件信息等。

### **5、字符串窗口**

快捷键 shift + F12

可以通过单击“View”->"Open Subviews”->“Strings”选项打开该字符串窗口（Strings Window）

### **6、输入窗口**

输入窗口（Imports）中列出了可执行文件调用的所有函数。

输入窗口中的每个条目都列出了一个函数名称，以及包括该函数的库的名称，每个条目列出的地址为相关函数的[虚拟地址](https://zhida.zhihu.com/search?content_id=193510549&content_type=Article&match_order=1&q=%E8%99%9A%E6%8B%9F%E5%9C%B0%E5%9D%80&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3OTE3MTU0NjQsInEiOiLomZrmi5_lnLDlnYAiLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoxOTM1MTA1NDksImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.Z0_efpFCuvXyLTQFjeoAK0IFsS3K-rB4rIrzSw7O0XY&zhida_source=entity)，双击函数，IDA将跳转至反汇编窗口的函数地址处。

### **7、跳转到地址窗口**

在不知道地址的情况下，是在反汇编窗口上下滚动查看各个地址的反汇编代码，那么知道地址的情况下呢：

可以用IDA提供的快捷键“G”打开“Jump to address”（跳转到地址）窗口。

![](../attachments/upload/image-CFNB.png)

输入一个地址（[十六进制值](https://zhida.zhihu.com/search?content_id=193510549&content_type=Article&match_order=1&q=%E5%8D%81%E5%85%AD%E8%BF%9B%E5%88%B6%E5%80%BC&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3OTE3MTU0NjQsInEiOiLljYHlha3ov5vliLblgLwiLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoxOTM1MTA1NDksImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.tiwT2iZz9y2vuuzPERq1VhHFItpVnUHagI0I1q6ckJM&zhida_source=entity)），IDA会立即跳转该地址显示相应代码

执行跳转功能后，当需要返回上一页面（步骤）时，单击导航栏中的 “ <-”这个箭头 即可返回，或者使用“Esc”进行返回。

当返回只是想扫一眼，又想恢复之前的页面，可以点击导航栏中的“->"这个箭头即可实现恢复下一个页面，或者使用“Ctrl+Enter”快捷键。

### **0x04交叉参考**

![](../attachments/upload/v2-ae1cbdd948cc82f720d47544e8968bea_1440w.png)

在反汇编代码中看到的如上图所示的一些列的 “ CODE XREF：sub_401090+1A1↑p ” 表示该调用地址是401090h

- j ：表示跳转（jump）

- o ：表示偏移量（offset）

- p ：表示子程序（procedure）

双击此处或按“Enter”键可以跳转到调用处的地方。

![](../attachments/upload/v2-0c3efc4fdf8e4573cc388ecdd9701110_1440w.png)

在“ dest_misaligned ” 字符上按“ X ” 键，即可打开交叉参考窗口

### **0x05参考重命名**

参考重命名（Renaming of reference） 是IDA的一个很好的功能，它可以将反汇编窗口中IDA识别并自动赋予函数的名称更改为有意义的名称，增加了代码的可读性。要修改一个名称，只需单击想要修改的名称（使其高亮），并使用快捷键“N”更改名称。或者在高亮处右键选择弹出菜单栏中的“Rename”（重命名）选项。

![](../attachments/upload/v2-b122019c0747d097d9bd0a2ed40b2bf5_1440w.png)

- Local name ：局部符号名的作用域仅限于当前函数

- Include in names list ：勾选这个选项，将有一个名称被添加到名称窗口中。

- Public name ：由二进制文件（如DLL）输出的名称。

- Autogenerated name ：自动创建符号名

- Weak name ： 弱符号，是公共符号的一种特殊形式。

### **0x06标签的用法**

单击菜单栏中“Jump”->“Mark position”，打开“标记当前位置”功能。或者按快捷键“ALT+M”。

![](https://pic2.zhimg.com/v2-b10a644eee2537769252b9e07be602e9_1440w.jpg)

![](https://pic2.zhimg.com/v2-250d5fb35b80feb6859ef4fa1291004b_1440w.jpg)

为当前高亮区域加上标签，“Dome”标签就是需要返回的位置。当离开这个表情需要返回时，单击菜单栏中“Jump”->“Jump to marked position”，或者按快捷键“Ctrl+M”。执行“跳转到标记位置”。

![](https://picx.zhimg.com/v2-b674ca754097a11ed7e57be2176ff1a3_1440w.jpg)

### **0x07格式化指令操作数**

IDA可以格式化指令使用的常量，因此应尽可能使用符号名称而非数字，从而使[反汇编代码](https://zhida.zhihu.com/search?content_id=193510549&content_type=Article&match_order=4&q=%E5%8F%8D%E6%B1%87%E7%BC%96%E4%BB%A3%E7%A0%81&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3OTE3MTU0NjQsInEiOiLlj43msYfnvJbku6PnoIEiLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoxOTM1MTA1NDksImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6NCwiemRfdG9rZW4iOm51bGx9.WgPl6yDdFgvIWe8npsvqrWAdTtyqhO-Eo2KVZMJx4qQ&zhida_source=entity)更具可读性。IDA根据被反汇编指令的上下文、所使用的数据做出格式化决定。对其他情况，IDA一般会将相关常量格式化成一个十六进制常量。

IDA可以提供多种进制显示。将光标移到需要转换进制的常量上，单击右键，会弹出

![](https://pic3.zhimg.com/v2-f4094b7a21646f9b56ab79e8ae898ea0_1440w.jpg)

如图所示的菜单项，该菜单提供的选项可以将常量格式化成十六进制、[八进制](https://zhida.zhihu.com/search?content_id=193510549&content_type=Article&match_order=1&q=%E5%85%AB%E8%BF%9B%E5%88%B6&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3OTE3MTU0NjQsInEiOiLlhavov5vliLYiLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoxOTM1MTA1NDksImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.tQbLorne-YrslP8dlwjbVQFmNrG7NMjTNQrj_b7erSU&zhida_source=entity)或者二进制的值

在大部分情况下，源代码中使用的是已命名的常量，例如#define语句，IDA维护着大量的常见库（例如C标准库、Win32API），用户可以通过右键快捷菜单中的“Use standard symblic constant”（使用标准[符号常量](https://zhida.zhihu.com/search?content_id=193510549&content_type=Article&match_order=1&q=%E7%AC%A6%E5%8F%B7%E5%B8%B8%E9%87%8F&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3OTE3MTU0NjQsInEiOiLnrKblj7fluLjph48iLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoxOTM1MTA1NDksImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.bHD3OpJhpdoxU7i4C9OoE-ewiIdU7qI2CVudK-Ry0q8&zhida_source=entity)）选项来设置常量

![](https://pica.zhimg.com/v2-a737a2a7751e8005c2a45dc7276871e4_1440w.jpg)

![](https://pic4.zhimg.com/v2-8ce810e2a003f0ba82d7952ac51d31f7_1440w.jpg)

### **0x08函数的操作**

IDA允许手动干预创建、编辑、删除函数。新函数由不属于某个函数的现有指令创建，或者由未被IDA以任何方式定义的原始数据创建。

将光标移动到要创建函数的第1个字节上，选择“Edit”->“Functions”->“Create Function”选项，创建一个函数（快捷键是“P”）。

![](https://picx.zhimg.com/v2-a1b1de33ddad3bea06d169a01075c903_1440w.jpg)

必要时，IDA会将数据转换成代码，以便分析函数的结构。如果能找到函数结束部分，IDA会生成一个新的函数名，以函数的形式重组代码，以便分析函数的结构。如果无法确定函数的结束部分或者发现非法指令 ，这个操作将会终止。删除函数是，可以使用“Edit”->“Functions”->“Delete Function"命令。

### **0x09代码和数据转换**

很多工具在进行反汇编的时候可能无法正确区分数据和代码，IDA也不例外，数据字节可能会被错误地识别为代码字节。

有些程序就是利用这一点来对抗静态反汇编的。IDA的交互性使用户可以将某段十六进制数据指定为代码或数据，即利用人脑来区分数据和代码。

如果确信某段十六进制数据是一段指令，只要将光标移到其第1字节的偏移位置，执行菜单命令“Edit”->“Code”或按“C”键即可。

![](../attachments/upload/v2-4609cc661178545737387d8a28babc61_1440w.png)

按“P”键可以将某段代码定义为子程序，并列出参数调用。若要取消定义，可以执行菜单命“Edit”->“Undefine”或按“U” 键。

数据将重新以十六进制形式显示，这种[交互分析](https://zhida.zhihu.com/search?content_id=193510549&content_type=Article&match_order=1&q=%E4%BA%A4%E4%BA%92%E5%88%86%E6%9E%90&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3OTE3MTU0NjQsInEiOiLkuqTkupLliIbmnpAiLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoxOTM1MTA1NDksImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.Zjep5z3BCUvYwIkyJmzG5pFsbgSD0rutvjvjYCdhSG8&zhida_source=entity)功能的介入，使IDA打到了非交互式软件无法达到的效果。

#
