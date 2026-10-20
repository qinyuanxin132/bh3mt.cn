---
title: "0xGame 2026 Re z3_solver wp"
slug: "z3_solver"
date: 2026-10-08
updated: 2026-10-08
published: true
categories: ["0xGame"]
tags: ["0xGame"]
---

# 0xGame 2026 Re z3_solver wp

> 发布于 2026-10-08 12:33:42

安装z3_solver

```
pip install z3-solver
```

z3_soler的作用是将C语言写成python后不用手算复杂的式子

```
__int64 __fastcall sub_401550(__int64 a1)
{
  int i; // [rsp+Ch] [rbp-4h]

  for ( i = 0; i <= 22; ++i )
  {
    if ( *(_BYTE *)(a1 + i) <= 0x1Fu || *(_BYTE *)(a1 + i) > 0x7Eu )
      return 0;
    if ( 5 * *(unsigned __int8 *)(a1 + (i + 1) % 23)
       + 3 * *(unsigned __int8 *)(a1 + i)
       + 11 * *(unsigned __int8 *)(a1 + (i + 7) % 23)
       + 7 * *(unsigned __int8 *)(a1 + (i + 4) % 23) != word_404000[i] )
      return 0;
  }
  return 1;
}
```

查看word_404000

```
0xB21, 0x7BF, 0xA2C, 0xA2B, 0x8FC, 0x860, 0xAC7, 0xA21,
0x7EE, 0xA0E, 0xB55, 0xA05, 0xABB, 0x902, 0xBC8, 0xBCB,
0x6FF, 0xC4E, 0xA48, 0x7E3, 0xAEF, 0xA27, 0xA57
```

```
    # 严格按照伪代码的数学公式翻译
    expr = (5 * flag[(i + 1) % 23] + 
            3 * flag[i] + 
            11 * flag[(i + 7) % 23] + 
            7 * flag[(i + 4) % 23])
```

```
from z3 import *

# 1. 实例化求解器
s = Solver()

# 2. 创建 23 个整型变量（代表输入的 23 个字符）
# 用 Int 方便进行加减乘运算，不用处理位宽溢出
flag = [Int(f'c{i}') for i in range(23)]
word_404000 = [
    0xB21, 0x7BF, 0xA2C, 0xA2B, 0x8FC, 0x860, 0xAC7, 0xA21,
    0x7EE, 0xA0E, 0xB55, 0xA05, 0xABB, 0x902, 0xBC8, 0xBCB,
    0x6FF, 0xC4E, 0xA48, 0x7E3, 0xAEF, 0xA27, 0xA57
    # 一共 23 个
]

#添加核心线性方程组约束
for i in range(23):
    # 严格按照伪代码的数学公式翻译
    expr = (5 * flag[(i + 1) % 23] + 
            3 * flag[i] + 
            11 * flag[(i + 7) % 23] + 
            7 * flag[(i + 4) % 23])
    s.add(expr == word_404000[i])

# 7. 求解并打印
if s.check() == sat:
    m = s.model()
    result = ''.join([chr(m[flag[i]].as_long()) for i in range(23)])
    print("Flag 是:", result)
else:
    print("无解！请检查 word_404000 数据是否复制正确，或者检查格式假设是否正确。")
```
