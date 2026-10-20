---
title: "C语言学习笔记 #4 循环 数组 函数递推"
slug: "cyu-yan-xue-xi-bi-ji-4-xun-huan"
date: 2026-09-28
updated: 2026-09-28
published: true
categories: ["C语言学习笔记"]
tags: ["C语言学习笔记"]
---

# C语言学习笔记 #4 循环 数组 函数递推

> 发布于 2026-09-28 10:15:36

```
//循环流程

//高斯求和
/*
while (循环条件)
    循环行为
*/
//循环多条语句使用{}
#include <stdio.h>
int main()
{
    int i = 1,sum = 0;
    while(i<=100)
    {
        sum = i + sum;
        i++;
    }
    printf("%d %d\n",i,sum);

//在C语言中，非零即为真，也就是说，while (2)也是死循环

//for循环
/*

for(计数器设置初始值;循环条件;计数器更新)  //设置初始值仅仅在循环开始时执行一次
    循环行为
循环多条语句使用{}
*/
i = 1,sum =0;
for(i=1;i <= 100;i++)
{
    sum = i + sum;
}
printf("%d %d\n",i,sum);

//如果在for循环内部声明i 例如 for(int i=1;i <= 100;i++) 那么i仅仅在循环体内有效，结束循环后i将失效

    return 0;
}
```

```
#include <stdio.h>
int main()
{
//for循环
/*

for(计数器设置初始值;循环条件;计数器更新)  //设置初始值仅仅在循环开始时执行一次
    循环行为
循环多条语句使用{}
*/
    int sum =0;
    for(int i=1;i <= 100;i++)
    {
        sum = i + sum;
    }
        printf("%d\n",sum);

    //如果在for循环内部声明i 例如 for(int i=1;i <= 100;i++) 那么i仅仅在循环体内有效，结束循环后i将失效
//注意：
//不要在while或for循环后加分号

        return 0;
}
```

```
//do while
/*
do
    循环行为
while(循环条件);
注意，while末尾有个分号
如果执行多个语句，do和while中间用{}
*/
#include <stdio.h>
int main()
{
    int x;
    do
    {
          scanf("%d",&x);  
    } while (x<0);
}
```

### break和continue

```
//break和continue
#include <stdio.h>
int main()
{
    int i = 0;
    while(1)
    {
        if (i == 10)
        {
            break; //打破循环
        }
        printf("%d\n",i);
        i++;

    }
return 0;
}
```

```
// continue 跳过本次循环，直接开始下一轮循环
#include <stdio.h>

int main()
{
    for (int i = 0; i <= 20; i++)
    {
        if (i == 6)
        {
            continue;
        }
        printf("%d ", i);
    }

    return 0;
}

//for中使用continue将立即更新计数器，再进入新循环
//for使用break，将直接跳出循环，不会再更新计数器
//break和continue将作用于自己直属上级
```

```
//switsh
/*
switch(整型表达式)
{
    case 整型变量1:
        语句
    case 整型变量2:
        语句
    case 整型变量3:
        语句
    case 整型变量4:
        语句
    default 整型变量5s:
        语句
}
*/
//注意事项
//switch后面的括号只能填一个整型表达式
//case后的常量不能有重复的
//可以没有default
//遇到break才会跳出整个switch
```

## 数组：

```
/*
声明数组
元素类型 数组名[元素数量];
例如
char c[5];
int n[10];
long l[3];
数组初始化
元素类型 数组名[元素数量] = {逗号分隔元素内容}
例如
int arr[10] = {1,2,3,4,5,6,7,8,9,0};
[]也可以什么都不填，让初始化列表决定长度
int arr[] = {454,4896,46854,8964,8945,46}
访问数组内元素
数组名[下标]
下标从0开始数
赋值
数组名[下标] = 123;

memcpy(arr1,arr2,sizeof(arr1));
arr1 目标数组 arr2 原始数组 sizeof(arr1)需要复制多少数据

//要使用memory需要包含<memory.h>这个头文件
*/
#include <stdio.h>
int main()
{
//多维数组声明
int B[5][10] = {
    {0,1,2,3,4,5,6,7,8,9},
    {10,11,12,13,14,15,16,17,18,19},
    {20,21,22,23,24,25,26,27,28,29},
    {30,31,32,33,34,35,36,37,38,39},
    {40,41,42,43,44,45,46,47,48,49}
};
for(int i = 0;i < 5 ;i++)
{
    for(int j = 0 ; j < 10; j++)
    {
        printf("%d,",B[i][j]);
    }
    printf("\n");
}

return 0;
}
```

### 字符串数组

```
#include <stdio.h>
#include <string.h>

int main()
{
    char str[] = {'H','e','l','l','o','w','o','r','l','d','\n','\0'};
    printf(str);
    char str1[] = {"helloworld\n"};
    printf(str1);

    //可以用strlen函数来计算字符串长度
    /*
    1.strlen可以接受一个字符串作为参数
    2.strlen返回值为这个字符串长度
    3.使用strlen需包含头文件string.h
    */
    //strlen(str)测量从第一个元素直到\0的字符串长度
    //suzeif(str)测量数组本身占用空间大小

    //小写转大写
    char str2[] = "helloworld";
    for (int i = 0;i < strlen(str2);i++)
    {
        str2[i] = str2[i] - 32;
    }
    printf("%s\n",str2);

    //输入字符串
    char str3[20];
    scanf("%s",str3);//会自动在末尾加上\0
    //putchar可以输出单个字符
    //getchar可以输入单个字符

    return 0;
}
```

### getchar和putchar

```
#include <stdio.h>
int main()
{
    char c1,c2;
    c1 = getchar();
    putchar(c1);
    getchar();  //用来吸收输入c1时的\n
    putchar('\n');
    c2 = getchar();
    putchar(c2);
    return 0;
}
```

```
//不带缓存的输入函数
//1.getch函数(不会自动打印)  //注意需要引用<conio.h>
#include <stdio.h>
#include <conio.h>
int main()
{   
    char c;
    c = getch();
    putchar(c);
    putchar('\n');
//2.getche函数(会自动打印)   //同样需要<conio.h>
    char a = getche();
    return 0;
}
```

### 函数递推

```
#include <stdio.h>
void func(int n)
{
    if (n == 5) //写递推结束条件
    {
        return;  //递推结束
    }
    printf("%d\n",n);//递推
    func(n + 1);
    printf("%d\n",n); //回归
}
int main()
{
    func(0);
    return 0;
}
```

#### 递推应用

```
//尝试使用函数递推写一个计算阶乘
//f(x) = n * f(n - 1)
#include <stdio.h>
int f(int n)
{
    if (n == 0 || n == 1)
    {
        return 1;
    }
    return n * f(n-1);
}

int main()
{
    int c = f(4);
    printf("%d\n",c);
    return 0;
}
```
