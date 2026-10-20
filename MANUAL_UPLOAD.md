# 手动维护和上传博客指南

这份文档说明 GitHub 仓库 `bh3mt.cn` 的内容结构，方便不使用 Blog Studio 时直接在 GitHub 网页或本地 Git 中维护文章。

## 1. 仓库是什么

博客仓库是一个 Astro 静态站点：

```text
GitHub Repository
    ↓ GitHub Actions
Astro build
    ↓
GitHub Pages
```

公开仓库地址：

```text
https://github.com/qinyuanxin132/bh3mt.cn
```

公开站点地址：

```text
https://qinyuanxin132.github.io/bh3mt.cn/
```

## 2. 目录结构

```text
bh3mt.cn/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自动部署
│
├── src/
│   ├── content.config.ts       # Markdown 元数据定义
│   ├── content/
│   │   ├── posts/              # 公开文章，只读取这里的 .md
│   │   └── attachments/
│   │       └── upload/         # Markdown 相对路径使用的图片
│   ├── layouts/                # 页面布局
│   ├── pages/                  # 首页、分类、关于、文章路由
│   └── styles/                 # 全站样式
│
├── public/
│   ├── CNAME                   # 自定义域名配置
│   └── upload/                 # 兼容文章中 /upload/ 图片引用
│
├── astro.config.mjs            # Astro site/base 配置
├── package.json
└── README.md
```

## 3. 新增文章放哪里

公开文章放在：

```text
src/content/posts/
```

文件名建议使用英文小写 slug：

```text
src/content/posts/my-new-article.md
```

不要把新文章只放在：

```text
markdown/
html/
```

这些是原始导出格式，不是当前网站的内容源目录。

## 4. 文章文件格式

推荐使用以下 Front Matter：

```markdown
---
title: "文章标题"
slug: "my-new-article"
date: 2026-10-20
updated: 2026-10-20
published: true
categories: ["分类"]
tags: ["标签一", "标签二"]
---

# 文章标题

这里是正文。
```

字段说明：

| 字段 | 是否建议 | 作用 |
|---|---|---|
| `title` | 必须 | 首页、文章页和浏览器标题 |
| `slug` | 必须 | 文章 URL，建议和文件名保持一致 |
| `date` | 必须 | 首页排序、更新频次图、文章日期 |
| `updated` | 建议 | 最后修改日期 |
| `published` | 必须 | `true` 才会进入公开站点 |
| `categories` | 建议 | 分类数组 |
| `tags` | 建议 | 标签数组 |

### 分类和标签写法

单个值：

```yaml
categories: ["Reverse"]
tags: ["IDA"]
```

多个值：

```yaml
categories: ["CTF", "Reverse"]
tags: ["Assembly", "Linux", "分析"]
```

没有分类或标签时：

```yaml
categories: []
tags: []
```

## 5. 图片上传和引用

### 推荐图片目录

文章图片放到：

```text
src/content/attachments/upload/
```

例如：

```text
src/content/attachments/upload/reverse-screen-01.png
```

文章中使用相对路径：

```markdown
![逆向分析截图](../attachments/upload/reverse-screen-01.png)
```

### 兼容旧文章的图片

部分旧文章使用：

```html
<img src="/upload/example.png">
```

这类图片需要同时放到：

```text
public/upload/example.png
```

否则旧文章中的绝对 `/upload/` 路径可能找不到图片。

### 图片建议

- 文件名尽量使用英文、数字和短横线；
- 不要使用特别大的原始截图；
- 可以使用 PNG、JPG、WebP、SVG；
- 图片路径大小写必须完全一致；
- 上传文章时不要忘记同时上传图片文件。

## 6. 草稿和私有文章

公开仓库不能放不希望公开的文章、Flag、私密截图或凭据。

建议：

```text
公开文章：src/content/posts/
草稿：     保存在本地私有目录，不要推送到公开仓库
```

`published: false` 的文章不会生成公开页面，但如果文件本身已经在公开 GitHub 仓库中，别人仍然可以从源码看到它。因此私密文章不要提交到公开仓库。

## 7. GitHub 网页手动上传

### 新增文章

1. 打开仓库：<https://github.com/qinyuanxin132/bh3mt.cn>
2. 进入 `src/content/posts/`；
3. 点击 **Add file → Create new file**；
4. 输入文件名，例如：

   ```text
   src/content/posts/my-new-article.md
   ```

5. 粘贴完整 Markdown；
6. 点击 **Commit changes**；
7. 等待 GitHub Actions 完成构建。

### 上传图片

1. 进入 `src/content/attachments/upload/`；
2. 点击 **Add file → Upload files**；
3. 上传图片；
4. 提交 commit；
5. 再在文章 Markdown 中引用图片。

如果文章使用旧的 `/upload/xxx.png` 绝对路径，则图片要放到 `public/upload/`。

### 修改文章

直接打开：

```text
src/content/posts/文章文件.md
```

点击编辑按钮，修改后提交 commit。

## 8. 本地 Git 手动上传

```bash
git clone https://github.com/qinyuanxin132/bh3mt.cn.git
cd bh3mt.cn

# 编辑文章和图片
$EDITOR src/content/posts/my-new-article.md

git add src/content/posts/my-new-article.md src/content/attachments/upload/
git commit -m "docs: add my new article"
git push origin main
```

推送后，GitHub Actions 会自动执行：

```text
checkout
  ↓
Astro build
  ↓
GitHub Pages deploy
```

## 9. 如何判断部署成功

查看 Actions：

<https://github.com/qinyuanxin132/bh3mt.cn/actions>

需要看到：

```text
Build Astro site       成功
Deploy to GitHub Pages 成功
```

文章 URL 格式：

```text
https://qinyuanxin132.github.io/bh3mt.cn/posts/文章 slug/
```

如果文章 404，检查：

- 文件是否位于 `src/content/posts/`；
- Front Matter 是否完整；
- `slug` 是否和预期一致；
- Actions 是否成功；
- URL 是否包含 `/bh3mt.cn/`；
- 是否使用了正确的大小写。

## 10. 不要提交的内容

不要提交：

```text
Token
SSH 私钥
密码
私密文章
未公开比赛资料
不应公开的 Flag
个人本地配置
node_modules/
dist/
```

原始导出备份也不建议直接提交到公开仓库。
