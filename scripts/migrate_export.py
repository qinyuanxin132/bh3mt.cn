from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path('/home/qinyuanxin132/Downloads/out')
PROJECT = Path(__file__).resolve().parents[1]
CONTENT = PROJECT / 'src' / 'content'
PUBLIC = PROJECT / 'public'

posts = json.loads((ROOT / 'posts.json').read_text(encoding='utf-8'))
for directory in (CONTENT / 'posts', CONTENT / 'drafts', PUBLIC / 'upload'):
    directory.mkdir(parents=True, exist_ok=True)

# Keep the original uploaded filenames and URLs. This lets the article body remain unchanged.
upload_dir = ROOT / 'attachments' / 'upload'
for source in upload_dir.iterdir():
    if source.is_file():
        shutil.copy2(source, PUBLIC / 'upload' / source.name)

# Metadata is added outside the original body. The body itself is copied byte-for-byte.
for post in posts:
    source = ROOT / 'markdown' / f"{post['file']}.md"
    if not source.exists():
        print(f'MISSING {source}')
        continue
    body = source.read_text(encoding='utf-8')
    target_dir = CONTENT / ('posts' if post.get('published') and post.get('visible') != 'PRIVATE' else 'drafts')
    target = target_dir / f"{post['slug']}.md"
    title = str(post.get('title', '')).replace('\\', '\\\\').replace('"', '\\"')
    date = str(post.get('publish_time') or post.get('created') or '')[:10]
    updated = str(post.get('last_modify') or post.get('publish_time') or post.get('created') or '')[:10]
    categories = json.dumps(post.get('categories') or [], ensure_ascii=False)
    tags = json.dumps(post.get('tags') or [], ensure_ascii=False)
    frontmatter = (
        '---\n'
        f'title: "{title}"\n'
        f'slug: "{post["slug"]}"\n'
        f'date: {date}\n'
        f'updated: {updated}\n'
        f'published: {str(bool(post.get("published") and post.get("visible") != "PRIVATE")).lower()}\n'
        f'categories: {categories}\n'
        f'tags: {tags}\n'
        '---\n\n'
    )
    target.write_text(frontmatter + body, encoding='utf-8')

print(f'Migrated {len(posts)} posts')
print(f'Public: {sum(bool(p.get("published") and p.get("visible") != "PRIVATE") for p in posts)}')
print(f'Drafts/private: {sum(not bool(p.get("published") and p.get("visible") != "PRIVATE") for p in posts)}')
print(f'Assets: {len([p for p in upload_dir.iterdir() if p.is_file()])}')
