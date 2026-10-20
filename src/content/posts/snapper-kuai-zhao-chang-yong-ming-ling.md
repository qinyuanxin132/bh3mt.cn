---
title: "snapper（快照）常用命令"
slug: "snapper-kuai-zhao-chang-yong-ming-ling"
date: 2026-06-22
updated: 2026-06-22
published: true
categories: []
tags: []
---

# snapper（快照）常用命令

> 发布于 2026-06-22 10:28:57

**snapper：Btrfs 文件系统的快照管理工具**

## 📝 以后怎么用

### 手动创建 home 快照

fish

```
sudo snapper -c home create --description "描述"
```

### 创建 root 快照

fish

```
sudo snapper -c root create --description "描述"
```

### 查看 home 快照列表

fish

```
sudo snapper -c home list
```

### 删除某个旧快照

fish

```
sudo snapper -c home delete 快照编号
```
