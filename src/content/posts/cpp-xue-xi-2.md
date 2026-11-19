---
title: "C++ 入门学习 #2 实战"
slug: "cpp-xue-xi-1"
date: 2026-11-18
updated: 2026-11-18
published: true
categories: ["C++学习笔记"]
tags: ["C++"]
---

## 1.写一个文字 RPG 战斗系统

```md
========== C++ RPG ==========

玩家：勇者
生命值：100
攻击力：20

怪物：史莱姆
生命值：60
攻击力：10

----- 第 1 回合 -----
勇者攻击史莱姆，造成20点伤害！
史莱姆剩余40点生命值。

史莱姆反击，造成10点伤害！
勇者剩余90点生命值。

----- 第 2 回合 -----
...
```

首先我们需要先设定好这个世界的勇者与史莱姆，统一的模板的话先写一个基础的类

```c++
class base_player{
    public:
        std::string name;
        int max_hp;
        int hp;
        int level;
        bool live;
        int down_hp(int a)
        {
            if(a >= hp){
                live = 0;
                return 0;
            }
            hp -= a;
            return 1;
        }
        int up_hp(int a)
        {
            if((a+hp)>=max_hp){
                hp = max_hp
                return 1;
            }
            hp += a;
            {
                return 1;
            }
        }

};
```
