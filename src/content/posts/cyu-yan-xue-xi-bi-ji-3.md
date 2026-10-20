---
title: "C语言学习笔记 #3"
slug: "cyu-yan-xue-xi-bi-ji-3"
date: 2026-09-24
updated: 2026-09-24
published: true
categories: ["C语言学习笔记"]
tags: ["C语言学习笔记"]
---

# C语言学习笔记 #3

> 发布于 2026-09-24 23:33:00

# 分支流程

```
#include <stdio.h>

int main()
{
    // if (测试条件)
    //     条件为真的流程
    //else
    //      条件为假所执行的流程
    if (2>1)
        printf("成功\n");
    printf("1:");
    int x;
    scanf("%d",&x);
    if (2<=x && x <= 10)
        printf("yes\n");
    else
        printf("no\n");
```

注意，if和else只对后面一条语句有效果

如果想有多条语句，请用花括号做成复合语句

```
    if (测试条件)
    {
        条件为真的流程1
        条件为真的流程2
        条件为真的流程3
    }
    else
    {
        条件为假的流程1
        条件为假的流程2
        条件为假的流程3
    }
```

if和else后面不能加;否则程序会认为已经执行完成从而报错

```
//嵌套if
printf("2:");
int a;
scanf("%d",&a);
if (a<2)
{
    printf("left\n");
}
else
{
    if (2<=a && a<=10)
    {
        printf("in\n");
    }
    else
    {
        printf("right\n");
    }
}
```

```
//省略花括号
    if (a<2)
    {
        printf("left\n");
    }
    else if (2<=a && a<=10)
    {
            printf("in\n");
    }
    else
    {
            printf("right\n");
    }
```

```
//实践
    int b;
    printf("输入成绩:");
    scanf("%d",&b);
    if (b>=0 && b<60)
    {
        printf("不及格\n");
    }
    else if (b>=60 && b<70)
    {
        printf("及格\n");
    }
    else if (b>=70 && b<80)
    {
        printf("一般\n");
    }
    else if (b>=80 && b<90)
    {
        printf("良好\n");
    }
    else if (b>=90 && b<=100)
    {
        printf("优秀\n");
    }
    else
    {
        printf("输入不正确\n");
    }
```

```
    //条件运算符
/*
测试条件?表达式1:表达式2;
如果测试条件为真，进入表达式1
如果输出条件为假，进入表达式2
*/
```

```
    int c;
    char d;
    scanf("%d",&c);
    d = c>= 10 ? 'Y' :'N';
    printf("%c",d);
```
