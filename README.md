# 未命名技术博客

这是一个基于 Astro 的静态技术博客，文章内容来自 Halo 导出数据。

项目刻意把**文章正文**和**网站展示层**分开：迁移只添加元数据并兼容原始附件路径，不对原始 Markdown 正文做润色或重写。

## 本地开发

```bash
npm install
ASTRO_TELEMETRY_DISABLED=1 npm run dev
```

打开 <http://localhost:4321/> 查看本地站点。

## 构建检查

```bash
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

构建产物位于 `dist/`。

## 内容结构

```text
src/content/posts/       # 参与公开构建的文章
src/content/attachments/ # 文章使用的原始附件
public/upload/            # 兼容原始 HTML 图片引用
```

草稿和私有文章不会复制到公开项目中；原始导出仍保留在本机的 Downloads 目录。

## GitHub Pages

项目已经包含 `.github/workflows/deploy.yml`：推送到 `main` 后会自动构建并部署到 GitHub Pages。

创建 GitHub 仓库后：

1. 将本地项目连接到仓库：
   ```bash
   git remote add origin <你的仓库地址>
   git branch -M main
   git push -u origin main
   ```
2. 在仓库的 **Settings → Pages → Build and deployment** 中选择 **GitHub Actions**。
3. 等待 Actions 完成部署。

当前项目已经按 `bh3mt.cn` 自定义域名准备好了 `public/CNAME`，并在 Astro 配置中设置了站点地址。仓库创建完成后，还需要在域名 DNS 服务商处添加：

- `@` 的 A 记录指向 GitHub Pages 官方地址；
- `www` 的 CNAME 指向你的 `用户名.github.io`；
- GitHub 仓库的 **Settings → Pages → Custom domain** 填写 `bh3mt.cn`。

如果你最终不使用 `bh3mt.cn`，需要同步修改 `public/CNAME` 和 `astro.config.mjs`。

## 当前状态

- 43 篇公开文章已迁移；
- 47 篇文章迁移前后正文校验一致；
- 52 个被公开文章引用的附件已保留；
- 当前主题为克制的深色技术博客，后续继续迭代视觉和阅读体验。
