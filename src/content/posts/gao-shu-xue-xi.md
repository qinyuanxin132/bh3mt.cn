---
title: "高数笔记"
slug: "gao-shu-bi-ji"
date: 2026-10-27
updated: 2026-10-27
published: false
categories: [高数笔记]
tags: [高数笔记]
---

# 高数笔记

> 发布于 2026-10-27 19:28:57

关于：笔者对数学公式掌握不牢，特此归档辅助记忆

## 无穷
### 一、等价无穷小代换公式（八个）

当 \(x \to 0\) 时，以下各对无穷小等价（\(\sim\) 表示等价）：

1. \(\sin x \sim x\)
2. \(\tan x \sim x\)
3. \(\arcsin x \sim x\)
4. \(\arctan x \sim x\)
5. \(1 - \cos x \sim \dfrac{1}{2}x^2\)
6. \(e^x - 1 \sim x\)
7. \(\ln(1+x) \sim x\)
8. \((1+x)^a - 1 \sim ax\)（\(a \neq 0\)）

> 特例：\(\sqrt{1+x} - 1 \sim \dfrac{1}{2}x\)

**注意**：等价无穷小代换一般只建议在**乘除法**中使用，加减法中直接替换容易出错。

---

### 二、关于 \(e\) 的公式（第二个重要极限）

标准形式：

\[
\lim_{x \to \infty} \left(1 + \frac{1}{x}\right)^x = e
\]

等价变形（更常用）：

\[
\lim_{x \to 0} (1 + x)^{\frac{1}{x}} = e
\]

**简单记法**：\(1^\infty\) 型极限，若底数趋近于 1，指数趋近于无穷大，通常可往这个公式上凑。