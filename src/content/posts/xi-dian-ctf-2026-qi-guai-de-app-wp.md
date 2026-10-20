---
title: "西电CTF 2026 奇怪的APP wp"
slug: "xi-dian-ctf-2026-qi-guai-de-app-wp"
date: 2026-10-18
updated: 2026-10-18
published: true
categories: ["西电CTF_2026"]
tags: ["西电CTF_2026"]
---

# 西电CTF 2026 奇怪的APP wp

> 发布于 2026-10-18 11:40:33

[环境安装见https://bh3mt.cn/archives/linuxhuan-jing-xia-de-android-apkfan-bian-yi-xue-xi-bi-ji](https://bh3mt.cn/archives/linuxhuan-jing-xia-de-android-apkfan-bian-yi-xue-xi-bi-ji)

# 方式1.apktool

```
# 反编译 APK 
apktool d app.apk -o app_out
```

再输出文件夹里找到各个字符串（都有等于猜测base64，寻找4倍的字符串）

Z2hUPyEhIX0=

RXYzcnNlXzFz

bW9lY3Rme0Fwa19S

X2Z1Tl9yMQ==

ghT?!!!}

Ev3rse_1s

moectf{Apk_R

_fuN_r1

尝试两种组合

moectf{Apk_REv3rse_1s_fuN_r1ghT?!!!}

moectf{Apk_R_fuN_r1Ev3rse_1sghT?!!!}

发现

moectf{Apk_REv3rse_1s_fuN_r1ghT?!!!}

是正确的
