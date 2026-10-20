---
title: "C语言学习笔记 #2"
slug: "cyu-yan-xue-xi-bi-ji-1"
date: 2026-09-24
updated: 2026-09-28
published: true
categories: ["C语言学习笔记"]
tags: ["C语言学习笔记"]
---

# C语言学习笔记 #2

> 发布于 2026-09-24 14:44:50

```
#include <stdio.h>
int add(int a, int b) {
    return a + b;
}

int main() {
    int result = add(2,3);   //声明整形变量result并调用add函数计算2+3的结果   变量必须先声明才能再使用
    printf("%d",result);
    return 0;
}
```

### 标识符：

add a b result都是标识符（必须进行声明或定义，才能被编译器识别）

标识符可以用小写字母大写字母数字和下划线命名   标识符的第一i个字符必须是字母或是下划线，不能是数字 标识符是区分大小写的

关键词不能作为标识符使用

### 常量：

不需要被声明,例如“hello world”

printf 是系统自带函数   print 和 format 组成，译为格式化打印

%d是个整形占位符

使用printf打印一个整形: printf("%d",整型int);

使用printf打印两个整型: printf("%d %d",整型int1,整形int2)

### printf公式

printf("占位1 占位2 占位3",替换1,替换2,替换3);

例如 printf("A=%d B=%d",123,123);  //输出结果为A=123 B=123

#include <stdio.h>  //stdio.h文件声明了printf函数

### 类型：

```
#include <stdio.h>
int main() {
//整数类型
//char: 通常占用1个字节，范围是-128到127
//int: 通常占用4个字节，范围是-2,147,483,648到2,147,483,647
//short: 通常占用2个字节，范围是-32,768到32,767
//long: 通常占用4个字节，范围是-2,147,483,648到2,147,483,647
//long long: 通常占用8个字节，范围是-9,223,372,036,854,775,808到9,223,372,036,854,775,807
//sizeof运算符: 测量实体占用字节大小
printf("char类型占用字节大小:%d\n",sizeof(char));
printf("int类型占用字节大小:%d\n",sizeof(int));
printf("short类型占用字节大小:%d\n",sizeof(short));
printf("long类型占用字节大小:%d\n",sizeof(long));
printf("long long类型占用字节大小:%d\n",sizeof(long long));

//upsigned修饰符: 用于声明无符号类型,即不带符号的整数类型,范围是0到最大值
printf("unsigned char类型占用字节大小:%d\n",sizeof(unsigned char));
return 0;
}
```

```
#include <stdio.h>
int main() {
    float a = 1.234567;
    float b = 1.234456;
    double c = 1.234456;
    printf("%f\n", a);
    printf("%f\n", b);
    printf("%f\n", c);//float和double都可以使用%f作为占位符
    printf("sizeof(float): %lu bytes\n", sizeof(float));
    printf("sizeof(double): %lu bytes\n", sizeof(double));
    return 0;
    //float至少能装六位数字，比float精度更高的，double
}
```

```
//标识符  由自己命名 表示变量函数或其他实体的名称 必须声明或者定义
//关键词  C语言标准的规定词汇，有特殊意义和用途。可以在程序中直接使用
//声明变量公式
//数据类型 变量名 分号
#include <stdio.h>
int main() {
    int a;  //声明整形变量a
    a = 10; //给变量a赋值为10
    printf("%d",a);

//标识符只能由英文字母数字下划线
//标识符不能数字开头
//标识符不能是已有的关键词

//将变量a装入特定的值两种实现方式
//1.变量声明后立即初始化
int b = 10; //声明并初始化整形变量b为10

int c;  //声明整形变量c
c = 20; //给变量c赋值为20
printf("%d",c);
//变量可以多次赋值，但不能多次初始化
a = 30; //给变量a重新赋值为30
a = 40; //给变量a重新赋值为40

//常量
//字面常量：123 3.14  'a'  "hello world"
//根据整数数字的大小，程序会自动选择类型int    unsigned int     long      unsigned long      long long     unsigned long long
//浮点常量默认是 double

//符号常量
//    #define 符号常量名 值
#define PRICE 100  //通常建议写在函数外或头文件中,此处用来演示（全局的，只要声明过后面的都可以调用）

    return 0;
}
```

```
#include <stdio.h>

int main()
{
    printf("Hello, world!\n");
    //字符常量是由单引号包括的单个字符，例如'a'、'1'、'%'等
    //字符串常量是由双引号包括的字符序列，例如"Hello,
    //printf的第一个参数是格式字符串
    //占位符:整数类型 %d 浮点类型 %f 字符类型 %c 字符串类型 %s
    printf("%c%c%c%c%c%c%c%c%c%c%c\n", 'H', 'e', 'l', 'l', 'o', ',', 'w', 'o', 'r', 'l', 'd');
    //字符类型占用空间
    printf("sizeof a= %d\n", sizeof('a'));
    printf("sizeof b= %d\n", sizeof('b'));
    printf("sizeof c= %d\n", sizeof('c'));
    printf("sizeof d= %d\n", sizeof('d'));
    printf("sizeof e= %d\n", sizeof('e'));
//C++编译器字符类型占用空间是1个字节，C编译器将字符常量看作int类型，占用4个字节

//字符变量占用空间
    char f = 'f';
    char g = 'g';
    printf("sizeof f= %d\n", sizeof(f));
    printf("sizeof g= %d\n", sizeof(g));
//字符变量占用空间是1个字节
    printf("%d %d %d %d %d\n", 'a', 'b', 'c', 'd', 'e');
    //输出结果为97 98 99 100 101
//字符常量在计算机中是以ASCII码的形式存储的，'a'对应的ASCII码是97，'b'对应的ASCII码是98，依次类推
//字符和数值存在一一对应的关系，字符常量在计算机中是以ASCII码的形式存储的，字符变量在计算机中也是以ASCII码的形式存储的
//ASCII码设计的时候，仅仅考虑了一个拉丁字符，0-127的范围内，包含了英文字母、数字、标点符号和一些控制字符，一个字节够用
//ASCII码表使用方法，OEC十进制OCT八进制HEX十六进制CHAR字符

char c1 = 'A';
char c2 = '\n';  // 换行符,算一个字符
char c3 = '1';
printf("%c%c%c", c1, c2, c3);
//char本质还是整数类型，可以加减乘除运算
    char letter = 'A';
    letter = letter + 32; // 将字符'A'的ASCII码加32，
    printf("\n%c\n", letter); // 输出字符'a'
//字符串占用字节空间
printf("%d\n", sizeof("Helloworld")); // 输出字符串常量占用的字节数,发现比字符多一字节
//字符串常量在计算机中是以字符数组的形式存储的，字符串常量的最后一个字符是'\0'，表示字符串的结束，所以字符串常量占用的字节数比字符多一字节
//转义字符
printf("Hello\0World"); //只输出Hello,因为\0表示字符串的结束，后面的World不会被输出
//  \数值(八进制) :转义字符,虽然写法上有d
printf("Hello\12World"); //\12和\n是等价的，都是换行符，所以输出结果为Hello换行World
//记数值比较麻烦，为了方便使用常用数值，用字母代替
//例如 \a表示报警 \b表示退格 \f表示换页 \n表示换行 \r表示回车 \t表示水平制表符 \v表示垂直制表符   （是无法直接在键盘上输入的，被称为不可见字符）
//在ASCII码表中，十进制0-31是不可见字符，十进制32-127是可见字符

    return 0;
}
```

```
//printf用法
//printf使用公式
//printf("占位符1 占位符2 占位符3",替换1,替换2,替换3);
//printf是一个变参函数(参数个数和参数类型是不确定的)
//printf的第一个参数是格式字符串，后面的参数是要替换的值
//printf的第一个参数是需要输出的内容
//占位符:整数类型 %d 浮点类型 %f 字符类型 %c 字符串类型 %s
//printf的第二及后续参数将依次替换占位符
//占位符的类型和数量需要与后续参数一一对应
#include <stdio.h>
int main()
{
    int a = 10;
    float b = 3.14;
    char c = 'A';
    printf("整型a为%d,浮点型b为%f,字符型c为%c\n", a, b, c);
//类型提升：print是一个可变参数函数，编译器在编译时会将float类型提升为double类型，将char类型提升为int类型
//所以short int 类型可以使用%d占位符，float类型可以使用%f占位符
//long %ld
//long long %lld
//无符号整形，将d换为u表示最后一位不看为符号位
//unsigned int %u
//unsigned long %lu
//unsigned long long %llu
//转换规范：  % -+0# 12 .4 l d
//转换规范:  百分号开始 零个或多个标志字符( -+0# )  可选的最小字段宽度(12)  可选的精度(.4)  可选的长度修饰符(h/hh/l/ll/z)  转换说明符(d)

    return 0;
}
```

```
//表达式
//100
//100 + 1
//每个表达式都有一个结果
//表达式的结果可以赋值给变量
//表达式的结果可以作为函数的参数传递给函数
//表达式语句：   5 + 10;
//c语言中，表达式不能单独存在，必须作为语句的一部分存在，表达式语句以分号结尾
// +100 的结果是 100
// -100 的结果是 -100
#include <stdio.h>
int main()
{
    int a = 200;
    int b = 100;
    int c = a + b;
    printf("c = %d\n", c);

    a = 5;
    b = 2;
    float d = (float)a/b;  //整形与整形相除，结果为整形，强制类型转换为浮点型
    int e = a%b;  //取余运算符，求a除以b的余数,经常用在判断奇偶数，奇数%2=1，偶数%2=0
    printf("d = %f\n", d);
    printf("e = %d\n", e);
    //赋值表达式 结果：等号右边对象的值，额外作用，右边的值传到左边
    int f = 10;
    f = f + 5;  //f的值为15
    printf("f = %d\n", f);
    //自增++  自减-- 运算符
    //前缀模式：
    int g = 10;
    int h = 10;
    printf("%d %d\n", ++g, --h);  //++g先自增再使用，--h先自减再使用(++a a的值加1，--a a的值减1,对运算本身产生操作)
    printf("%d %d\n", g, h);  //g=11,h=9
    //后缀模式：
    g = 10;
    h = 10;
    printf("%d %d\n", g++, h--);  //g++先使用再自增，h--先使用再自减
    printf("%d %d\n", g, h);  //g=11,h=9
    //额外作用(不同的编译器对何时产生额外作用的理解不同)   vs累积到所有子表达式求值后再产生额外作用   gcc每完成一个子表达式就会立即产生额外作用
    a = 1;
    b = a++ + a++ + a++;
    printf("%d\n",a);
    printf("%d\n",b);
    //为了避免出现不同的结果，请不要在一个表达式中重复对一个变量进行自增或者自减
    
    //运算符优先级：
    //四则运算同数学
    //后缀自增自减 前缀自增自减 正号负号 乘除取余 加减 赋值
    
    return 0;
}
```

### 自动转换类型：

高级别类型数据范围大于或等于低级别数据类型

char<short<int<long

有符号整形运算，小于int转换为int，比int高级保持不变

无符号同样，小于int转换为int，比int高级保持不变

浮点取最高

浮点级别比整形级别高

强制类型转换(不会改变原变量类型，只会改变)

或 ||

与 &&

(x <= 2) || (x >= 10)

非  !

!((x <= 2) || (x >= 10))

```
#include <stdio.h>
int main()
{
    int x;
    scanf("%d",&x);  //如果scanf将转换后的二进制存储到基本变量当中，请在变量名前加&   如果scanf将字符串存储到字符数组中，字符数组名不用加&
    //%hhd 代表char %hd代表short %d代表int %ld代表long %f代表float %lf代表double
    return(0);
}
```

```
#include <stdio.h>
int add(int a, int b) {
    return a + b;
}

int main() {
    int result = add(2,3);   //声明整形变量result并调用add函数计算2+3的结果   变量必须先声明才能再使用
    printf("%d",result);
    return 0;
}
```

### 标识符：

add a b result都是标识符（必须进行声明或定义，才能被编译器识别）

标识符可以用小写字母大写字母数字和下划线命名   标识符的第一i个字符必须是字母或是下划线，不能是数字 标识符是区分大小写的

关键词不能作为标识符使用

### 常量：

不需要被声明,例如“hello world”

printf 是系统自带函数   print 和 format 组成，译为格式化打印

%d是个整形占位符

使用printf打印一个整形: printf("%d",整型int);

使用printf打印两个整型: printf("%d %d",整型int1,整形int2)

### printf公式

printf("占位1 占位2 占位3",替换1,替换2,替换3);

例如 printf("A=%d B=%d",123,123);  //输出结果为A=123 B=123

#include <stdio.h>  //stdio.h文件声明了printf函数

### 类型：

```
#include <stdio.h>
int main() {
//整数类型
//char: 通常占用1个字节，范围是-128到127
//int: 通常占用4个字节，范围是-2,147,483,648到2,147,483,647
//short: 通常占用2个字节，范围是-32,768到32,767
//long: 通常占用4个字节，范围是-2,147,483,648到2,147,483,647
//long long: 通常占用8个字节，范围是-9,223,372,036,854,775,808到9,223,372,036,854,775,807
//sizeof运算符: 测量实体占用字节大小
printf("char类型占用字节大小:%d\n",sizeof(char));
printf("int类型占用字节大小:%d\n",sizeof(int));
printf("short类型占用字节大小:%d\n",sizeof(short));
printf("long类型占用字节大小:%d\n",sizeof(long));
printf("long long类型占用字节大小:%d\n",sizeof(long long));

//upsigned修饰符: 用于声明无符号类型,即不带符号的整数类型,范围是0到最大值
printf("unsigned char类型占用字节大小:%d\n",sizeof(unsigned char));
return 0;
}
```

```
#include <stdio.h>
int main() {
    float a = 1.234567;
    float b = 1.234456;
    double c = 1.234456;
    printf("%f\n", a);
    printf("%f\n", b);
    printf("%f\n", c);//float和double都可以使用%f作为占位符
    printf("sizeof(float): %lu bytes\n", sizeof(float));
    printf("sizeof(double): %lu bytes\n", sizeof(double));
    return 0;
    //float至少能装六位数字，比float精度更高的，double
}
```

```
//标识符  由自己命名 表示变量函数或其他实体的名称 必须声明或者定义
//关键词  C语言标准的规定词汇，有特殊意义和用途。可以在程序中直接使用
//声明变量公式
//数据类型 变量名 分号
#include <stdio.h>
int main() {
    int a;  //声明整形变量a
    a = 10; //给变量a赋值为10
    printf("%d",a);

//标识符只能由英文字母数字下划线
//标识符不能数字开头
//标识符不能是已有的关键词

//将变量a装入特定的值两种实现方式
//1.变量声明后立即初始化
int b = 10; //声明并初始化整形变量b为10

int c;  //声明整形变量c
c = 20; //给变量c赋值为20
printf("%d",c);
//变量可以多次赋值，但不能多次初始化
a = 30; //给变量a重新赋值为30
a = 40; //给变量a重新赋值为40

//常量
//字面常量：123 3.14  'a'  "hello world"
//根据整数数字的大小，程序会自动选择类型int    unsigned int     long      unsigned long      long long     unsigned long long
//浮点常量默认是 double

//符号常量
//    #define 符号常量名 值
#define PRICE 100  //通常建议写在函数外或头文件中,此处用来演示（全局的，只要声明过后面的都可以调用）

    return 0;
}
```

```
#include <stdio.h>

int main()
{
    printf("Hello, world!\n");
    //字符常量是由单引号包括的单个字符，例如'a'、'1'、'%'等
    //字符串常量是由双引号包括的字符序列，例如"Hello,
    //printf的第一个参数是格式字符串
    //占位符:整数类型 %d 浮点类型 %f 字符类型 %c 字符串类型 %s
    printf("%c%c%c%c%c%c%c%c%c%c%c\n", 'H', 'e', 'l', 'l', 'o', ',', 'w', 'o', 'r', 'l', 'd');
    //字符类型占用空间
    printf("sizeof a= %d\n", sizeof('a'));
    printf("sizeof b= %d\n", sizeof('b'));
    printf("sizeof c= %d\n", sizeof('c'));
    printf("sizeof d= %d\n", sizeof('d'));
    printf("sizeof e= %d\n", sizeof('e'));
//C++编译器字符类型占用空间是1个字节，C编译器将字符常量看作int类型，占用4个字节

//字符变量占用空间
    char f = 'f';
    char g = 'g';
    printf("sizeof f= %d\n", sizeof(f));
    printf("sizeof g= %d\n", sizeof(g));
//字符变量占用空间是1个字节
    printf("%d %d %d %d %d\n", 'a', 'b', 'c', 'd', 'e');
    //输出结果为97 98 99 100 101
//字符常量在计算机中是以ASCII码的形式存储的，'a'对应的ASCII码是97，'b'对应的ASCII码是98，依次类推
//字符和数值存在一一对应的关系，字符常量在计算机中是以ASCII码的形式存储的，字符变量在计算机中也是以ASCII码的形式存储的
//ASCII码设计的时候，仅仅考虑了一个拉丁字符，0-127的范围内，包含了英文字母、数字、标点符号和一些控制字符，一个字节够用
//ASCII码表使用方法，OEC十进制OCT八进制HEX十六进制CHAR字符

char c1 = 'A';
char c2 = '\n';  // 换行符,算一个字符
char c3 = '1';
printf("%c%c%c", c1, c2, c3);
//char本质还是整数类型，可以加减乘除运算
    char letter = 'A';
    letter = letter + 32; // 将字符'A'的ASCII码加32，
    printf("\n%c\n", letter); // 输出字符'a'
//字符串占用字节空间
printf("%d\n", sizeof("Helloworld")); // 输出字符串常量占用的字节数,发现比字符多一字节
//字符串常量在计算机中是以字符数组的形式存储的，字符串常量的最后一个字符是'\0'，表示字符串的结束，所以字符串常量占用的字节数比字符多一字节
//转义字符
printf("Hello\0World"); //只输出Hello,因为\0表示字符串的结束，后面的World不会被输出
//  \数值(八进制) :转义字符,虽然写法上有d
printf("Hello\12World"); //\12和\n是等价的，都是换行符，所以输出结果为Hello换行World
//记数值比较麻烦，为了方便使用常用数值，用字母代替
//例如 \a表示报警 \b表示退格 \f表示换页 \n表示换行 \r表示回车 \t表示水平制表符 \v表示垂直制表符   （是无法直接在键盘上输入的，被称为不可见字符）
//在ASCII码表中，十进制0-31是不可见字符，十进制32-127是可见字符

    return 0;
}
```

```
//printf用法
//printf使用公式
//printf("占位符1 占位符2 占位符3",替换1,替换2,替换3);
//printf是一个变参函数(参数个数和参数类型是不确定的)
//printf的第一个参数是格式字符串，后面的参数是要替换的值
//printf的第一个参数是需要输出的内容
//占位符:整数类型 %d 浮点类型 %f 字符类型 %c 字符串类型 %s
//printf的第二及后续参数将依次替换占位符
//占位符的类型和数量需要与后续参数一一对应
#include <stdio.h>
int main()
{
    int a = 10;
    float b = 3.14;
    char c = 'A';
    printf("整型a为%d,浮点型b为%f,字符型c为%c\n", a, b, c);
//类型提升：print是一个可变参数函数，编译器在编译时会将float类型提升为double类型，将char类型提升为int类型
//所以short int 类型可以使用%d占位符，float类型可以使用%f占位符
//long %ld
//long long %lld
//无符号整形，将d换为u表示最后一位不看为符号位
//unsigned int %u
//unsigned long %lu
//unsigned long long %llu
//转换规范：  % -+0# 12 .4 l d
//转换规范:  百分号开始 零个或多个标志字符( -+0# )  可选的最小字段宽度(12)  可选的精度(.4)  可选的长度修饰符(h/hh/l/ll/z)  转换说明符(d)

    return 0;
}
```

```
//表达式
//100
//100 + 1
//每个表达式都有一个结果
//表达式的结果可以赋值给变量
//表达式的结果可以作为函数的参数传递给函数
//表达式语句：   5 + 10;
//c语言中，表达式不能单独存在，必须作为语句的一部分存在，表达式语句以分号结尾
// +100 的结果是 100
// -100 的结果是 -100
#include <stdio.h>
int main()
{
    int a = 200;
    int b = 100;
    int c = a + b;
    printf("c = %d\n", c);

    a = 5;
    b = 2;
    float d = (float)a/b;  //整形与整形相除，结果为整形，强制类型转换为浮点型
    int e = a%b;  //取余运算符，求a除以b的余数,经常用在判断奇偶数，奇数%2=1，偶数%2=0
    printf("d = %f\n", d);
    printf("e = %d\n", e);
    //赋值表达式 结果：等号右边对象的值，额外作用，右边的值传到左边
    int f = 10;
    f = f + 5;  //f的值为15
    printf("f = %d\n", f);
    //自增++  自减-- 运算符
    //前缀模式：
    int g = 10;
    int h = 10;
    printf("%d %d\n", ++g, --h);  //++g先自增再使用，--h先自减再使用(++a a的值加1，--a a的值减1,对运算本身产生操作)
    printf("%d %d\n", g, h);  //g=11,h=9
    //后缀模式：
    g = 10;
    h = 10;
    printf("%d %d\n", g++, h--);  //g++先使用再自增，h--先使用再自减
    printf("%d %d\n", g, h);  //g=11,h=9
    //额外作用(不同的编译器对何时产生额外作用的理解不同)   vs累积到所有子表达式求值后再产生额外作用   gcc每完成一个子表达式就会立即产生额外作用
    a = 1;
    b = a++ + a++ + a++;
    printf("%d\n",a);
    printf("%d\n",b);
    //为了避免出现不同的结果，请不要在一个表达式中重复对一个变量进行自增或者自减
    
    //运算符优先级：
    //四则运算同数学
    //后缀自增自减 前缀自增自减 正号负号 乘除取余 加减 赋值
    
    return 0;
}
```

### 自动转换类型：

高级别类型数据范围大于或等于低级别数据类型

char<short<int<long

有符号整形运算，小于int转换为int，比int高级保持不变

无符号同样，小于int转换为int，比int高级保持不变

浮点取最高

浮点级别比整形级别高

强制类型转换(不会改变原变量类型，只会改变)

或 ||

与 &&

(x <= 2) || (x >= 10)

非  !

!((x <= 2) || (x >= 10))

```
#include <stdio.h>
int main()
{
    int x;
    scanf("%d",&x);  //如果scanf将转换后的二进制存储到基本变量当中，请在变量名前加&   如果scanf将字符串存储到字符数组中，字符数组名不用加&
    //%hhd 代表char %hd代表short %d代表int %ld代表long %f代表float %lf代表double
    return(0);
}
```

```
#include <stdio.h>
int add(int a, int b) {
    return a + b;
}

int main() {
    int result = add(2,3);   //声明整形变量result并调用add函数计算2+3的结果   变量必须先声明才能再使用
    printf("%d",result);
    return 0;
}
```

```
//add a b result都是标识符（必须进行声明或定义，才能被编译器识别）
//标识符可以用小写字母大写字母数字和下划线命名   标识符的第一i个字符必须是字母或是下划线，不能是数字 标识符是区分大小写的
//关键词不能作为标识符使用
//常量：
//不需要被声明,例如“hello world”
//printf 是系统自带函数   print 和 format 组成，译为格式化打印
//%d是个整形占位符
//使用printf打印一个整形: printf("%d",整型int);
//使用printf打印两个整型: printf("%d %d",整型int1,整形int2)
//printf公式：
//printf("占位1 占位2 占位3",替换1,替换2,替换3);
//例如 printf("A=%d B=%d",123,123);  //输出结果为A=123 B=123

//#include <stdio.h>  //stdio.h文件声明了printf函数
```

```
#include <stdio.h>
int main() {
//整数类型
//char: 通常占用1个字节，范围是-128到127
//int: 通常占用4个字节，范围是-2,147,483,648到2,147,483,647
//short: 通常占用2个字节，范围是-32,768到32,767
//long: 通常占用4个字节，范围是-2,147,483,648到2,147,483,647
//long long: 通常占用8个字节，范围是-9,223,372,036,854,775,808到9,223,372,036,854,775,807
//sizeof运算符: 测量实体占用字节大小
printf("char类型占用字节大小:%d\n",sizeof(char));
printf("int类型占用字节大小:%d\n",sizeof(int));
printf("short类型占用字节大小:%d\n",sizeof(short));
printf("long类型占用字节大小:%d\n",sizeof(long));
printf("long long类型占用字节大小:%d\n",sizeof(long long));

//upsigned修饰符: 用于声明无符号类型,即不带符号的整数类型,范围是0到最大值
printf("unsigned char类型占用字节大小:%d\n",sizeof(unsigned char));
return 0;
}
```

```
#include <stdio.h>
int main() {
    float a = 1.234567;
    float b = 1.234456;
    double c = 1.234456;
    printf("%f\n", a);
    printf("%f\n", b);
    printf("%f\n", c);//float和double都可以使用%f作为占位符
    printf("sizeof(float): %lu bytes\n", sizeof(float));
    printf("sizeof(double): %lu bytes\n", sizeof(double));
    return 0;
    //float至少能装六位数字，比float精度更高的，double
}
```

```
//标识符  由自己命名 表示变量函数或其他实体的名称 必须声明或者定义
//关键词  C语言标准的规定词汇，有特殊意义和用途。可以在程序中直接使用
//声明变量公式
//数据类型 变量名 分号
#include <stdio.h>
int main() {
    int a;  //声明整形变量a
    a = 10; //给变量a赋值为10
    printf("%d",a);

//标识符只能由英文字母数字下划线
//标识符不能数字开头
//标识符不能是已有的关键词

//将变量a装入特定的值两种实现方式
//1.变量声明后立即初始化
int b = 10; //声明并初始化整形变量b为10

int c;  //声明整形变量c
c = 20; //给变量c赋值为20
printf("%d",c);
//变量可以多次赋值，但不能多次初始化
a = 30; //给变量a重新赋值为30
a = 40; //给变量a重新赋值为40

//常量
//字面常量：123 3.14  'a'  "hello world"
//根据整数数字的大小，程序会自动选择类型int    unsigned int     long      unsigned long      long long     unsigned long long
//浮点常量默认是 double

//符号常量
//    #define 符号常量名 值
#define PRICE 100  //通常建议写在函数外或头文件中,此处用来演示（全局的，只要声明过后面的都可以调用）

    return 0;
}
```

```
#include <stdio.h>

int main()
{
    printf("Hello, world!\n");
    //字符常量是由单引号包括的单个字符，例如'a'、'1'、'%'等
    //字符串常量是由双引号包括的字符序列，例如"Hello,
    //printf的第一个参数是格式字符串
    //占位符:整数类型 %d 浮点类型 %f 字符类型 %c 字符串类型 %s
    printf("%c%c%c%c%c%c%c%c%c%c%c\n", 'H', 'e', 'l', 'l', 'o', ',', 'w', 'o', 'r', 'l', 'd');
    //字符类型占用空间
    printf("sizeof a= %d\n", sizeof('a'));
    printf("sizeof b= %d\n", sizeof('b'));
    printf("sizeof c= %d\n", sizeof('c'));
    printf("sizeof d= %d\n", sizeof('d'));
    printf("sizeof e= %d\n", sizeof('e'));
//C++编译器字符类型占用空间是1个字节，C编译器将字符常量看作int类型，占用4个字节

//字符变量占用空间
    char f = 'f';
    char g = 'g';
    printf("sizeof f= %d\n", sizeof(f));
    printf("sizeof g= %d\n", sizeof(g));
//字符变量占用空间是1个字节
    printf("%d %d %d %d %d\n", 'a', 'b', 'c', 'd', 'e');
    //输出结果为97 98 99 100 101
//字符常量在计算机中是以ASCII码的形式存储的，'a'对应的ASCII码是97，'b'对应的ASCII码是98，依次类推
//字符和数值存在一一对应的关系，字符常量在计算机中是以ASCII码的形式存储的，字符变量在计算机中也是以ASCII码的形式存储的
//ASCII码设计的时候，仅仅考虑了一个拉丁字符，0-127的范围内，包含了英文字母、数字、标点符号和一些控制字符，一个字节够用
//ASCII码表使用方法，OEC十进制OCT八进制HEX十六进制CHAR字符

char c1 = 'A';
char c2 = '\n';  // 换行符,算一个字符
char c3 = '1';
printf("%c%c%c", c1, c2, c3);
//char本质还是整数类型，可以加减乘除运算
    char letter = 'A';
    letter = letter + 32; // 将字符'A'的ASCII码加32，
    printf("\n%c\n", letter); // 输出字符'a'
//字符串占用字节空间
printf("%d\n", sizeof("Helloworld")); // 输出字符串常量占用的字节数,发现比字符多一字节
//字符串常量在计算机中是以字符数组的形式存储的，字符串常量的最后一个字符是'\0'，表示字符串的结束，所以字符串常量占用的字节数比字符多一字节
//转义字符
printf("Hello\0World"); //只输出Hello,因为\0表示字符串的结束，后面的World不会被输出
//  \数值(八进制) :转义字符,虽然写法上有d
printf("Hello\12World"); //\12和\n是等价的，都是换行符，所以输出结果为Hello换行World
//记数值比较麻烦，为了方便使用常用数值，用字母代替
//例如 \a表示报警 \b表示退格 \f表示换页 \n表示换行 \r表示回车 \t表示水平制表符 \v表示垂直制表符   （是无法直接在键盘上输入的，被称为不可见字符）
//在ASCII码表中，十进制0-31是不可见字符，十进制32-127是可见字符

    return 0;
}
```

```
//printf用法
//printf使用公式
//printf("占位符1 占位符2 占位符3",替换1,替换2,替换3);
//printf是一个变参函数(参数个数和参数类型是不确定的)
//printf的第一个参数是格式字符串，后面的参数是要替换的值
//printf的第一个参数是需要输出的内容
//占位符:整数类型 %d 浮点类型 %f 字符类型 %c 字符串类型 %s
//printf的第二及后续参数将依次替换占位符
//占位符的类型和数量需要与后续参数一一对应
#include <stdio.h>
int main()
{
    int a = 10;
    float b = 3.14;
    char c = 'A';
    printf("整型a为%d,浮点型b为%f,字符型c为%c\n", a, b, c);
//类型提升：print是一个可变参数函数，编译器在编译时会将float类型提升为double类型，将char类型提升为int类型
//所以short int 类型可以使用%d占位符，float类型可以使用%f占位符
//long %ld
//long long %lld
//无符号整形，将d换为u表示最后一位不看为符号位
//unsigned int %u
//unsigned long %lu
//unsigned long long %llu
//转换规范：  % -+0# 12 .4 l d
//转换规范:  百分号开始 零个或多个标志字符( -+0# )  可选的最小字段宽度(12)  可选的精度(.4)  可选的长度修饰符(h/hh/l/ll/z)  转换说明符(d)

    return 0;
}
```

```
//表达式
//100
//100 + 1
//每个表达式都有一个结果
//表达式的结果可以赋值给变量
//表达式的结果可以作为函数的参数传递给函数
//表达式语句：   5 + 10;
//c语言中，表达式不能单独存在，必须作为语句的一部分存在，表达式语句以分号结尾
// +100 的结果是 100
// -100 的结果是 -100
#include <stdio.h>
int main()
{
    int a = 200;
    int b = 100;
    int c = a + b;
    printf("c = %d\n", c);

    a = 5;
    b = 2;
    float d = (float)a/b;  //整形与整形相除，结果为整形，强制类型转换为浮点型
    int e = a%b;  //取余运算符，求a除以b的余数,经常用在判断奇偶数，奇数%2=1，偶数%2=0
    printf("d = %f\n", d);
    printf("e = %d\n", e);
    //赋值表达式 结果：等号右边对象的值，额外作用，右边的值传到左边
    int f = 10;
    f = f + 5;  //f的值为15
    printf("f = %d\n", f);
    //自增++  自减-- 运算符
    //前缀模式：
    int g = 10;
    int h = 10;
    printf("%d %d\n", ++g, --h);  //++g先自增再使用，--h先自减再使用(++a a的值加1，--a a的值减1,对运算本身产生操作)
    printf("%d %d\n", g, h);  //g=11,h=9
    //后缀模式：
    g = 10;
    h = 10;
    printf("%d %d\n", g++, h--);  //g++先使用再自增，h--先使用再自减
    printf("%d %d\n", g, h);  //g=11,h=9
    //额外作用(不同的编译器对何时产生额外作用的理解不同)   vs累积到所有子表达式求值后再产生额外作用   gcc每完成一个子表达式就会立即产生额外作用
    a = 1;
    b = a++ + a++ + a++;
    printf("%d\n",a);
    printf("%d\n",b);
    //为了避免出现不同的结果，请不要在一个表达式中重复对一个变量进行自增或者自减
    
    //运算符优先级：
    //四则运算同数学
    //后缀自增自减 前缀自增自减 正号负号 乘除取余 加减 赋值
    
    return 0;
}
```

```
//判断数据类型小技巧
//高级别类型数据范围大于或等于低级别数据类型
//char<short<int<long
//有符号整形运算，小于int转换为int，比int高级保持不变
//无符号同样，小于int转换为int，比int高级保持不变
//浮点取最高
//浮点级别比整形级别高
//强制类型转换(不会改变原变量类型，只会改变)

//或 ||
//与 &&
// (x <= 2) || (x >= 10)
// 非  !
// !((x <= 2) || (x >= 10))
```

```
#include <stdio.h>
int main()
{
    int x;
    scanf("%d",&x);  //如果scanf将转换后的二进制存储到基本变量当中，请在变量名前加&   如果scanf将字符串存储到字符数组中，字符数组名不用加&
    //%hhd 代表char %hd代表short %d代表int %ld代表long %f代表float %lf代表double
    return(0);
}
```
