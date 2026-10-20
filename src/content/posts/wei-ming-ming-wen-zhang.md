---
title: "西电CTF_2026 查分系统_revenge"
slug: "wei-ming-ming-wen-zhang"
date: 2026-09-20
updated: 2026-09-20
published: true
categories: ["西电CTF_2026"]
tags: ["西电CTF_2026"]
---

# 西电CTF_2026 查分系统_revenge

> 发布于 2026-09-20 12:40:00

```
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MOECTF 2026 学号全量爆破
- 对每条密文，爆破 00000000 ~ 99999999
- 多进程 + 进度显示
- 80 条全部跑完（命中不停止）
"""

import base64
import hashlib
import json
import os
import re
import sys
import time
from multiprocessing import Pool, cpu_count

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# ================= 配置 =================
HTML_PATH = "system_rev.html"
COMMON_IV_B64 = "bW9lY3RmMjAyNml2"
COMMON_IV = base64.b64decode(COMMON_IV_B64)
print(f"[*] IV = {COMMON_IV!r}")

# ================= 提取密文 =================
def extract_from_html(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    pattern = re.compile(r'"数据"\s*:\s*"([^"]+)"')
    return pattern.findall(content)

def decrypt_one(sid, ciphertext, iv):
    key = hashlib.sha256(sid.encode()).digest()
    try:
        return AESGCM(key).decrypt(iv, ciphertext, None)
    except Exception:
        return None

# ================= 工作进程 =================
def worker_chunk(args):
    """
    在 [start, end) 范围内爆破一个 chunk。
    命中则返回 (record_idx, sid, plain_bytes)；否则返回 None。
    """
    record_idx, start, end, ciphertext, iv = args
    for n in range(start, end):
        sid = f"{n:08d}"
        key = hashlib.sha256(sid.encode()).digest()
        try:
            plain = AESGCM(key).decrypt(iv, ciphertext, None)
            return (record_idx, sid, plain)
        except Exception:
            pass
    return None

# ================= 构建全部任务 =================
def build_all_tasks(ciphers, iv, chunk_size):
    """
    把所有密文的所有 chunk 合成一个大任务列表。
    这样 80 条密文会被均匀分给所有进程，不会出现“某条卡住等半天”的情况。
    """
    total = 100_000_000  # 1e8
    tasks = []
    for idx, cipher in enumerate(ciphers):
        for start in range(0, total, chunk_size):
            end = min(start + chunk_size, total)
            tasks.append((idx, start, end, cipher, iv))
    return tasks

# ================= 主流程 =================
def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("-w", "--workers", type=int, default=24,
                    help="进程数（默认 CPU-1）")
    ap.add_argument("-c", "--chunk", type=int, default=2000000,
                    help="每个 chunk 大小（默认 200000）")
    ap.add_argument("-n", "--num", type=int, default=None,
                    help="只跑前 N 条（默认全部）")
    ap.add_argument("--progress-every", type=int, default=50,
                    help="每完成多少个 chunk 打印一次进度")
                    
    args = ap.parse_args()

    # 1. 加载密文
    if not os.path.exists(HTML_PATH):
        print(f"[!] 找不到 {HTML_PATH}，请把 HTML 放到当前目录")
        sys.exit(1)

    ciphers_b64 = extract_from_html(HTML_PATH)
    if args.num:
        ciphers_b64 = ciphers_b64[:args.num]
    print(f"[*] 从 HTML 提取到 {len(ciphers_b64)} 条密文")
    ciphers = [base64.b64decode(c) for c in ciphers_b64]

    # 2. 构建任务
    chunk_size = args.chunk
    tasks = build_all_tasks(ciphers, COMMON_IV, chunk_size)
    total_chunks = len(tasks)

    num_workers = args.workers or max(1, cpu_count() - 1)
    print(f"[*] 使用 {num_workers} 进程，共 {total_chunks} 个 chunk "
          f"（chunk={chunk_size}, 每条 {100_000_000 // chunk_size} chunk）")
    print(f"[*] 预计总计算量: {total_chunks * chunk_size / 1e9:.2f} G 次解密")

    # 3. 开始爆破
    t0 = time.time()
    done = 0
    found = []          # 命中列表
    found_idx_set = set()  # 已经命中的 record idx，避免重复浪费

    # 用 imap_unordered 让完成的 chunk 先返回，避免“卡在某一条”
    with Pool(num_workers) as pool:
        try:
            for result in pool.imap_unordered(worker_chunk, tasks, chunksize=1):
                done += 1

                if result is not None:
                    ridx, sid, plain = result
                    try:
                        obj = json.loads(plain)
                        print(f"\n[+] 命中! 记录 #{ridx} 学号={sid}")
                        print(f"    明文: {json.dumps(obj, ensure_ascii=False, indent=2)}")
                        found.append((ridx, sid, obj))
                    except Exception:
                        print(f"\n[+] 命中! 记录 #{ridx} 学号={sid}")
                        print(f"    明文(原始): {plain!r}")
                        found.append((ridx, sid, plain))
                    found_idx_set.add(ridx)

                # 进度
                if done % args.progress_every == 0 or done == total_chunks:
                    pct = done / total_chunks * 100
                    elapsed = time.time() - t0
                    speed = done * chunk_size / max(elapsed, 1e-9)
                    eta = (total_chunks - done) * chunk_size / max(speed, 1e-9)
                    print(f"    进度 {done}/{total_chunks} ({pct:.2f}%) "
                          f"已命中 {len(found)} 条 "
                          f"速度 {speed/1e6:.2f} M/s ETA {eta:.0f}s",
                          end="\r")
        except KeyboardInterrupt:
            print("\n[!] 收到 Ctrl-C，正在停止...")
            pool.terminate()
            pool.join()
            raise

    t1 = time.time()
    print(f"\n\n[*] 总耗时 {t1 - t0:.1f}s")
    print(f"[*] 共命中 {len(found)} / {len(ciphers)} 条")
    print("=" * 60)
    for ridx, sid, obj in sorted(found, key=lambda x: x[0]):
        if isinstance(obj, dict):
            print(f"#{ridx:3d} 学号={sid}  ->  {json.dumps(obj, ensure_ascii=False)}")
        else:
            print(f"#{ridx:3d} 学号={sid}  ->  {obj!r}")

    # 4. 落盘
    out_path = "brute_results.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(
            [{"record_idx": r, "sid": s,
              "plain": o if isinstance(o, dict) else repr(o)}
             for r, s, o in found],
            f, ensure_ascii=False, indent=2
        )
    print(f"\n[*] 结果已保存到 {out_path}")

if __name__ == "__main__":
    main()
```

暴力破解脚本如上
