#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');
const UPLOAD_DIR = path.join(ROOT, 'src', 'content', 'attachments', 'upload');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif', '.bmp']);
const dryRun = process.argv.includes('--dry-run');

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function walkFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function chooseTargetName(srcPath) {
  const parsed = path.parse(srcPath);
  const baseName = parsed.base;
  const directTarget = path.join(UPLOAD_DIR, baseName);

  if (!fs.existsSync(directTarget)) {
    return { targetPath: directTarget, reused: false };
  }

  const srcHash = sha256File(srcPath);
  if (sha256File(directTarget) === srcHash) {
    return { targetPath: directTarget, reused: true };
  }

  // Name collision with different content (e.g. VS Code pasting "image.png" again)
  const shortHash = srcHash.slice(0, 8);
  let candidate = path.join(UPLOAD_DIR, `${parsed.name}-${shortHash}${parsed.ext}`);
  let counter = 1;
  while (fs.existsSync(candidate)) {
    if (sha256File(candidate) === srcHash) {
      return { targetPath: candidate, reused: true };
    }
    candidate = path.join(UPLOAD_DIR, `${parsed.name}-${shortHash}-${counter}${parsed.ext}`);
    counter++;
  }
  return { targetPath: candidate, reused: false };
}

function resolveLocalRef(mdDir, rawTarget) {
  let clean = rawTarget.trim();
  if (clean.startsWith('<') && clean.endsWith('>')) {
    clean = clean.slice(1, -1).trim();
  }
  // Ignore external URLs, data URIs, and site-root absolute paths
  if (/^(https?:|data:|mailto:|#|\/)/i.test(clean)) return null;

  // Strip optional query/hash for filesystem lookup
  const [pathOnly] = clean.split(/[?#]/);
  let decoded = pathOnly;
  try {
    decoded = decodeURIComponent(pathOnly);
  } catch {
    // keep original if malformed percent-encoding
  }
  return path.resolve(mdDir, decoded);
}

function encodePosixPath(posixPath) {
  return posixPath
    .split('/')
    .map((seg) => (seg === '.' || seg === '..' ? seg : encodeURIComponent(seg)))
    .join('/');
}

function main() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const allFiles = walkFiles(POSTS_DIR);
  const imageFiles = allFiles.filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()));
  const mdFiles = allFiles.filter((f) => path.extname(f).toLowerCase() === '.md');

  if (imageFiles.length === 0) {
    console.log('图片整理：src/content/posts/ 中没有需要迁移的图片。');
    return;
  }

  // Map absolute source image path -> target path in UPLOAD_DIR
  const movePlan = new Map();
  for (const srcPath of imageFiles) {
    const plan = chooseTargetName(srcPath);
    movePlan.set(srcPath, plan);
  }

  // Rewrite references in all Markdown files
  const updatedMds = [];
  for (const mdPath of mdFiles) {
    const mdDir = path.dirname(mdPath);
    const original = fs.readFileSync(mdPath, 'utf8');
    let replacements = 0;

    // 1. Markdown images: ![alt](target "optional title")
    let updated = original.replace(
      /(!\[[^\]]*\]\()(<[^>]+>|[^)\s]+)([^)]*\))/g,
      (full, prefix, rawTarget, suffix) => {
        const resolved = resolveLocalRef(mdDir, rawTarget);
        if (!resolved || !movePlan.has(resolved)) return full;
        const { targetPath } = movePlan.get(resolved);
        const rel = toPosix(path.relative(mdDir, targetPath));
        const hasAngle = rawTarget.startsWith('<') && rawTarget.endsWith('>');
        const formatted = hasAngle ? `<${rel}>` : rel.includes(' ') ? encodePosixPath(rel) : rel;
        replacements++;
        return `${prefix}${formatted}${suffix}`;
      },
    );

    // 2. HTML <img ... src="...">
    updated = updated.replace(
      /(<img\b[^>]*?\bsrc=["'])([^"']+)(["'])/gi,
      (full, prefix, rawTarget, suffix) => {
        const resolved = resolveLocalRef(mdDir, rawTarget);
        if (!resolved || !movePlan.has(resolved)) return full;
        const { targetPath } = movePlan.get(resolved);
        const rel = toPosix(path.relative(mdDir, targetPath));
        const formatted = rel.includes(' ') ? encodePosixPath(rel) : rel;
        replacements++;
        return `${prefix}${formatted}${suffix}`;
      },
    );

    if (replacements > 0 && updated !== original) {
      if (!dryRun) {
        fs.writeFileSync(mdPath, updated, 'utf8');
      }
      updatedMds.push({ file: path.relative(ROOT, mdPath), count: replacements });
    }
  }

  // Perform file moves
  let movedCount = 0;
  let dedupCount = 0;
  for (const [srcPath, { targetPath, reused }] of movePlan.entries()) {
    const srcRel = path.relative(ROOT, srcPath);
    const dstRel = path.relative(ROOT, targetPath);
    if (reused) {
      dedupCount++;
      console.log(`  [复用去重] ${srcRel} -> ${dstRel}`);
      if (!dryRun) fs.unlinkSync(srcPath);
    } else {
      movedCount++;
      console.log(`  [迁移图片] ${srcRel} -> ${dstRel}`);
      if (!dryRun) fs.renameSync(srcPath, targetPath);
    }
  }

  for (const item of updatedMds) {
    console.log(`  [更新引用] ${item.file}（${item.count} 处）`);
  }

  const tag = dryRun ? '（dry-run 预览，未修改文件）' : '';
  console.log(
    `图片整理完成${tag}：迁移 ${movedCount} 张，复用去重 ${dedupCount} 张，更新 ${updatedMds.length} 篇文章引用。`,
  );
}

main();
