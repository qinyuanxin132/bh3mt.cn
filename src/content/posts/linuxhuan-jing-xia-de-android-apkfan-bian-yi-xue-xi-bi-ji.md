---
title: "Linux环境下的Android APK反编译 学习笔记"
slug: "linuxhuan-jing-xia-de-android-apkfan-bian-yi-xue-xi-bi-ji"
date: 2026-10-18
updated: 2026-10-18
published: true
categories: ["默认分类"]
tags: ["Android学习"]
---

# Linux环境下的Android APK反编译 学习笔记

> 发布于 2026-10-18 09:28:32

[参考连接](https://blog.csdn.net/weixin_36304957/article/details/150555076)

APK文件其实就是一个包含了Dalvik可执行文件（DEX文件）、资源文件、资源索引文件、签名信息以及AndroidManifest.xml文件等的压缩包

## 工具

#### 1.Apktool是一个强大的工具，可以将APK文件反编译成几乎原始的代码和资源，使得开发者可以查看和修改APK文件。

arch linux

```
# 使用 yay
yay -S android-apktool

# 或者使用 paru
paru -S android-apktool
```

验证成功后常用命令：

b

```
# 反编译 APK
apktool d app.apk -o app_out

# 修改后回编译
apktool b app_out -o app_new.apk

# 回编译后通常还需要签名
```

#### **2.Dex2jar****安装**

```
paru -S dex2jar
  # 或者使用 yay
  # yay -S dex2jar
```

#### **3.JD-GUI安装**

```
paru -S jd-gui
```

### 4.jadx安装

```
sudo pacman -S jadx
```

## 反编译基本步骤

### 1.使用Apktool反编译APK文件到目标目录

```
 # 使用Apktool反编译APK文件到目标目录
  apktool d /home/qinyuanxin132/Downloads/chall11.apk -o /home/qinyuanxin132/Downloads/out/
I: Using Apktool 2.7.0-dirty on chall11.apk
I: Decoding AndroidManifest.xml with only framework resources...
I: Loading resource table from file: /home/qinyuanxin132/.local/share/apktool/framework/1.apk
I: Baksmaling classes.dex...
I: Copying assets and libs...
I: Copying unknown files...
I: Copying original files...
```

使用Apktool反编译后，输出文件夹 中将包含所有可读资源和Smali代码。

```
 ls
󰗀 AndroidManifest.xml   assets     smali
 apktool.yml           original
```

### 4.jadx

```
jadx-gui chall11.apk          # 直接喂 apk
```

得到：

```
package com.moectf.apkreverse;

import android.app.Activity;
import android.os.Bundle;

/* JADX INFO: loaded from: classes.dex */
public class MainActivity extends Activity {
    public static String OooO0o0() {
        return "RXYzcnNlXzFz";
    }

    @Override // android.app.Activity
    protected void onCreate(Bundle bundle) {
        super.onCreate(bundle);
    }
}
```
