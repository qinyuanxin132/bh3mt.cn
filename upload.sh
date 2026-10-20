#!/usr/bin/env bash
set -Eeuo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

if [[ ! -d .git ]]; then
  echo "错误：当前目录不是 Git 仓库：$(pwd)" >&2
  exit 1
fi

remote_url="$(git remote get-url origin 2>/dev/null || true)"
if [[ -z "$remote_url" ]]; then
  echo "错误：没有配置 origin 远程仓库。" >&2
  echo "请先执行：git remote add origin <GitHub仓库地址>" >&2
  exit 1
fi

if [[ "$remote_url" == *"github.io/"* ]]; then
  echo "错误：origin 是 GitHub Pages 网站地址，不是 Git 仓库地址：" >&2
  echo "  $remote_url" >&2
  echo "正确格式应类似：https://github.com/用户名/仓库.git" >&2
  exit 1
fi

echo "博客目录：$(pwd)"
echo "远程仓库：$remote_url"
echo
echo "正在整理整个文件夹的修改……"
git add -A

if git diff --cached --quiet; then
  echo "没有新的修改，不需要上传。"
  exit 0
fi

echo
echo "将要提交的文件："
git diff --cached --stat
echo

read -r -p "提交说明（直接回车使用默认值）：" commit_message
if [[ -z "$commit_message" ]]; then
  commit_message="更新博客内容 $(date '+%Y-%m-%d %H:%M')"
fi

git commit -m "$commit_message"
branch="$(git branch --show-current)"
echo
echo "正在上传到 GitHub：$branch"
git push origin "$branch"

local_head="$(git rev-parse HEAD)"
remote_head="$(git ls-remote origin "refs/heads/$branch" | awk '{print $1}')"
if [[ "$local_head" != "$remote_head" ]]; then
  echo "错误：push 命令结束，但远程 HEAD 与本地不一致。" >&2
  echo "本地：$local_head" >&2
  echo "远程：$remote_head" >&2
  exit 1
fi

echo
echo "上传成功。"
echo "commit：$local_head"
echo "GitHub Actions 会自动构建并部署 GitHub Pages。"
read -r -p "按回车关闭……" _
