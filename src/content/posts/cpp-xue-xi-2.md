---
title: "C++ 入门学习 #2 实战"
slug: "cpp-xue-xi-2"
date: 2026-11-18
updated: 2026-11-18
published: true
categories: ["编程与硬件"]
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

经过一天的摸索，也是写完了

```c++
#include <iostream>
#include <string>
#include <cstdlib> // 提供 rand() 和 srand()
#include <ctime>   // 提供 time()
// 泠被白浆喷中时的表情差分：
void draw_ling_stained() {
    std::cout << std::endl;
    std::cout << "\033[37m"; // 白色高亮
    std::cout << "      ( >_< )  ~~~ 💦 黏糊糊...\n";
    std::cout << "     /| █ |\\ \n";
    std::cout << "      /   \\  \n";
    std::cout << "\033[0m";
    std::cout << std::endl;
}

class base_player{
    public:
        std::string name;
        int max_hp;
        int hp;
        int level;
        bool live;
        int atk;
        int def;
        int down_hp(int a)
        {
            if(a >= hp){
                live = 0;
                hp = 0;
                return 0;
            }
            hp -= a;
            return 1;
        }
        int up_hp(int a)
        {
            if((a+hp)>=max_hp){
                hp = max_hp;
                return 1;
            }
            hp += a;
            {
                return 1;
            }
        }
        void m_hp()
        {hp = max_hp;}
        int up_level(int a){
            level += a;
            max_hp += a*10;
            return level;
        }
        int get_atk(int a){
            atk = a;
            return atk;
        }
        int get_def(int a){
            def = a;
            return def;
        }
    base_player(std::string n, int max,int t_atk,int t_def)
    : name(n),
      max_hp(max),
      hp(max),
      level(1),
      live(max > 0),
      atk(t_atk),
      def(t_def)
      {}
      virtual void print_info(std::ostream& os) const {
        os << "角色：" << name << '\n'
           << "等级：" << level << '\n'
           << "血量：" << hp << "/" << max_hp << '\n'
           << "攻击/防御：" << atk << "/" << def << '\n';
    }
};
/*

*/
std::ostream& operator<<(std::ostream& os, const base_player& p) {
    p.print_info(os); // 动态派发到对应子类！
    return os;
}


/*
泠的附加属性以及攻击
*/

class player_ling : public base_player{
    public:
    //泠魔力值计算
    int mp;
    int max_mp;

    int up_mp(int a)
    {
        if((mp + a)>max_mp)
            mp = max_mp;
        else
            mp += a;
        return mp;
    }

    int down_mp(int a)
    {
        if(a > mp)
            return 0;
        mp -= a;
        return 1;
    }    

    void print_info(std::ostream& os) const {
        os << "角色：" << name << '\n'
           << "等级：" << level << '\n'
           << "血量：" << hp << "/" << max_hp << '\n'
           << "攻击/防御：" << atk << "/" << def << '\n'
           << "魔力:" << mp << "/" << max_mp <<std::endl;
    }

    player_ling(std::string name)
        : base_player(name, 100, 10, 10), // 初始属性：血量100，攻击10，防御10 //base_player name("name",hp,atk,def)
          mp(0), 
          max_mp(5)
    {}

    //k1技能，水莫攻击 (普攻)
    int ling_k1(base_player& target){
        std::cout << name << " 对 " << target.name << " 使用了水莫攻击！\n";
        // 1. 攻击者按自己的属性算伤害（比如根据 atk 计算）
        int damage = atk; // 技能基础打1倍 攻击力
        // 2. 被攻击者按自己的防御 def 减免伤害
        int final_damage = damage - target.def;
        if (final_damage <= 0) {
            final_damage = 1; // 保底 1 点伤害
        }
        // 3. 结算扣血（调用目标的 down_hp）
        target.down_hp(final_damage);
        std::cout << "造成了 " << final_damage << " 点伤害！\n";
        // 4.普攻增加魔力
        up_mp(1);
        return final_damage;
    }
    //k2技能，回血
    int ling_k2(base_player& target){ //这是为了方便以后写的时候格式统一
        if (down_mp(1))
        {
        up_hp(20);
        std::cout << "回血成功" << std::endl;
        return 1;}
        std::cout << "魔力不够" << std::endl;
        return 0;
    }
    // k3大招，绝命射箭（魔力不够直接反噬暴毙，血量不够也可以同归于尽）
    int ling_k3(base_player& target) {
        // 1. 强行开大，先献祭 10 点生命！
        down_hp(10);

        // 2. 检查魔力：如果魔力不够 3 点，魔力反噬，直接猝死！
        if (mp < 3) {
            std::cout << "【施法反噬！】魔力不足强行开大，" << name << " 受到魔力反冲当场暴毙！\n";
            down_hp(hp); // 把剩下的血全部扣光，直接暴毙
            return 0;
        }

        // 3. 魔力足够，正常扣除 3 点魔力
        down_mp(3);

        // 4. 哪怕刚刚扣 10 点血已经死了，箭雨也已经射出去了，拉对面垫背！
        std::cout << name << " 燃烧生命与魔力，对 " << target.name << " 释放了【破空箭雨】！\n";

        int damage = atk * 5; 
        int final_damage = damage - target.def / 5;
        if (final_damage <= 0) {
            final_damage = 1;
        }

        target.down_hp(final_damage);
        std::cout << "造成了 " << final_damage << " 点毁灭伤害！\n";

        return final_damage;
    }

};

/*
史莱姆：
*/

/*
魔物：变异黏液史莱姆
*/
class monster_slime : public base_player {
public:
    monster_slime(std::string n = "变异黏液史莱姆", int h = 20, int a = 12, int d = 5)
        : base_player(n, h, a, d) 
    {}

    // 技能 1：蠕动撞击（普攻）
    int attack_tackle(base_player& target) {
        std::cout << name << " 扭动着透明半流体的身躯，湿漉漉地撞向 " << target.name << "！\n";
        
        int dmg = atk - target.def;
        if (dmg <= 0) dmg = 1;
        
        target.down_hp(dmg);
        std::cout << "造成 " << dmg << " 点物理撞击伤害！\n";
        return dmg;
    }

    // 技能 2：浓稠白浆喷射（核心机制技能）
    int attack_white_splash(base_player& target) {
        std::cout << "\n【警告】" << name << " 核心剧烈收缩蓄力，对准 " << target.name 
                  << " 喷射出大量滚烫浓稠的乳白浆液！\n";

        // 机制 1：白浆附着，腐蚀防御力（破甲）
        if (target.def > 0) {
            target.def -= 2;
            if (target.def < 0) target.def = 0;
            std::cout << ">>> 黏液沾满了 " << target.name << " 的衣物，防御力下降 2 点！（当前防御: " 
                      << target.def << "）\n";
        }

        // 机制 2：造成酸蚀魔法伤害（部分无视防御）
        int dmg = atk * 1.5; 
        target.down_hp(dmg);
        std::cout << ">>> 滚烫的浆液让 " << target.name << " 受到 " << dmg << " 点腐蚀灼烧伤害！\n";

        // 机制 3：由于黏稠包裹，史莱姆自身回复微量生命
        up_hp(10);
        std::cout << ">>> " << name << " 吸收了飞溅的体液，自身恢复了 10 点生命！\n";
        draw_ling_stained();
        return dmg;
    }
};

/*
战斗机制
*/
int battle_slime(player_ling& p, monster_slime& m){
    int choise_jn;
    std::cout << p.name << "VS" << m.name << std::endl;
    while(true){
    if(!p.live)
    return 0;
    std::cout << "状态:" << p << std::endl << m << std::endl;
    std::cout << "请选择技能" << std::endl;
    std::cin >> choise_jn;
    switch (choise_jn)
    {
    case 2:
        p.ling_k2(m);
        break; 
    case 3:
        p.ling_k3(m);
        break;
    default:
        p.ling_k1(m);
        break;
    }
    if(!m.live)
    return 1;
    if (rand() % 100 < 30)// 30% 概率触发
    m.attack_white_splash(p);
    else
    m.attack_tackle(p);
}
}

int choise_k()
{
    std::cout << "请选择模式" << '\n' << "1.闯关模式" << '\n' <<"2.无尽模式" << std::endl;
    int game_mode;
    std::cin >> game_mode;
    switch(game_mode){
    case 1:return 1;
    case 2:return 2;
    default:
        return 0;
    }
}

int cg(){
    std::cout << "开始闯关" << std::endl << "请给角色起名" <<std::endl;
    std::string name;
    std::cin >> name;
    player_ling ling{name};
    // 第一关：遭遇变异史莱姆
    std::cout << ling.name << "，祝你好运" << std::endl;
    std::cout << "家门口一只史莱姆" << std::endl;
    monster_slime slime_1{}; 
    if (!battle_slime(ling, slime_1)) // 开启第一场战斗
    {
        std::cout << "被第一场的史莱姆打得屁滚尿流" << std::endl;
        return 0;
    }
    std::cout << "恭喜闯过第一关" << std::endl << "等级+1 " << "血量已回满" << std::endl;
    ling.live = 1;
    ling.up_level(1);
    ling.m_hp();
    return 1;
}

int main()
{   
    srand(time(nullptr));
while(true){
    int t = choise_k();
    if(t == 1)
    cg();
    else if(t == 2)
    std::cout << "还没做" << std::endl;
    else
    std::cout << "重新输入" << std::endl;
}
} 
```
