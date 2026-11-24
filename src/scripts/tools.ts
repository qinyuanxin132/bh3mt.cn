import {
  STD_B64,
  URL_B64,
  base32Decode,
  base32Encode,
  base58Decode,
  base58Encode,
  base64Decode,
  base64Encode,
  bytesToHex,
  bytesToUtf8,
  caesarBruteForce,
  caesarShift,
  computeHashes,
  convertNumberOrAscii,
  decodeJwt,
  formatOutputBytes,
  hexToBytes,
  htmlEntityDecode,
  htmlEntityEncode,
  parseInputBytes,
  unicodeEscape,
  unicodeUnescape,
  urlDecode,
  urlEncode,
  utf8ToBytes,
  xorBytes,
} from './tools-codec';
import {
  compressStream,
  createZip,
  decompressStream,
  detectMagic,
  hasStreamCompression,
  parseZip,
  type StreamFormat,
  type ZipEntryInfo,
} from './tools-archive';

const $ = <T extends HTMLElement>(selector: string): T | null => document.querySelector<T>(selector);

function formatBytesSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function downloadBlob(bytes: Uint8Array, filename: string, mime = 'application/octet-stream'): void {
  const blob = new Blob([Uint8Array.from(bytes)], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyText(text: string, button?: HTMLButtonElement | null): Promise<void> {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    if (button) {
      const prev = button.textContent;
      button.textContent = '已复制 ✓';
      window.setTimeout(() => {
        button.textContent = prev;
      }, 1200);
    }
  } catch {
    // ignore clipboard permission errors
  }
}

function initTabs(): void {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-tool-tab]')];
  const panels = [...document.querySelectorAll<HTMLElement>('[data-tool-panel]')];

  const activate = (id: string) => {
    buttons.forEach((btn) => {
      const active = btn.dataset.toolTab === id;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.toolPanel !== id;
    });
    if (window.location.hash !== `#${id}`) {
      history.replaceState(null, '', `#${id}`);
    }
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.toolTab) activate(btn.dataset.toolTab);
    });
  });

  const initial = window.location.hash.replace('#', '');
  if (['codec', 'convert', 'compress'].includes(initial)) {
    activate(initial);
  }
}

/* ==================== TAB 1: CODEC ==================== */
function initCodec(): void {
  const algSelect = $<HTMLSelectElement>('#codec-alg');
  const inMode = $<HTMLSelectElement>('#codec-in-mode');
  const outMode = $<HTMLSelectElement>('#codec-out-mode');
  const inputEl = $<HTMLTextAreaElement>('#codec-input');
  const outputEl = $<HTMLTextAreaElement>('#codec-output');
  const statusEl = $<HTMLElement>('#codec-status');
  const b64CustomWrap = $<HTMLElement>('#codec-b64-custom-wrap');
  const b64TableEl = $<HTMLInputElement>('#codec-b64-table');
  const b64PadEl = $<HTMLInputElement>('#codec-b64-pad');
  const caesarWrap = $<HTMLElement>('#codec-caesar-wrap');
  const caesarShiftEl = $<HTMLInputElement>('#codec-caesar-shift');
  const xorWrap = $<HTMLElement>('#codec-xor-wrap');
  const xorKeyEl = $<HTMLInputElement>('#codec-xor-key');
  const xorKeyMode = $<HTMLSelectElement>('#codec-xor-key-mode');

  const setStatus = (msg: string, isError = false) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.dataset.state = isError ? 'error' : 'ok';
  };

  const syncOptionVisibility = () => {
    const alg = algSelect?.value ?? 'base64';
    if (b64CustomWrap) b64CustomWrap.hidden = alg !== 'base64-custom';
    if (caesarWrap) caesarWrap.hidden = alg !== 'caesar';
    if (xorWrap) xorWrap.hidden = alg !== 'xor';
  };

  const run = (direction: 'encode' | 'decode' | 'brute') => {
    if (!inputEl || !outputEl || !algSelect) return;
    const raw = inputEl.value;
    const alg = algSelect.value;
    const inFmt = (inMode?.value as 'utf8' | 'hex') ?? 'utf8';
    const outFmt = (outMode?.value as 'utf8' | 'hex') ?? 'utf8';

    try {
      let result = '';
      if (alg === 'base64') {
        if (direction === 'encode') {
          result = base64Encode(parseInputBytes(raw, inFmt), STD_B64, '=');
        } else {
          result = formatOutputBytes(base64Decode(raw, STD_B64, '='), outFmt);
        }
      } else if (alg === 'base64-url') {
        if (direction === 'encode') {
          result = base64Encode(parseInputBytes(raw, inFmt), URL_B64, '');
        } else {
          result = formatOutputBytes(base64Decode(raw, URL_B64, '='), outFmt);
        }
      } else if (alg === 'base64-custom') {
        const table = b64TableEl?.value || STD_B64;
        const pad = b64PadEl?.value ?? '=';
        if (direction === 'encode') {
          result = base64Encode(parseInputBytes(raw, inFmt), table, pad);
        } else {
          result = formatOutputBytes(base64Decode(raw, table, pad), outFmt);
        }
      } else if (alg === 'base32') {
        if (direction === 'encode') {
          result = base32Encode(parseInputBytes(raw, inFmt));
        } else {
          result = formatOutputBytes(base32Decode(raw), outFmt);
        }
      } else if (alg === 'base58') {
        if (direction === 'encode') {
          result = base58Encode(parseInputBytes(raw, inFmt));
        } else {
          result = formatOutputBytes(base58Decode(raw), outFmt);
        }
      } else if (alg === 'hex') {
        if (direction === 'encode') {
          result = bytesToHex(utf8ToBytes(raw), ' ');
        } else {
          result = bytesToUtf8(hexToBytes(raw));
        }
      } else if (alg === 'url') {
        result = direction === 'encode' ? urlEncode(raw, false) : urlDecode(raw);
      } else if (alg === 'url-full') {
        result = direction === 'encode' ? urlEncode(raw, true) : urlDecode(raw);
      } else if (alg === 'unicode') {
        result = direction === 'encode' ? unicodeEscape(raw) : unicodeUnescape(raw);
      } else if (alg === 'html') {
        result = direction === 'encode' ? htmlEntityEncode(raw) : htmlEntityDecode(raw);
      } else if (alg === 'caesar') {
        if (direction === 'brute') {
          result = caesarBruteForce(raw);
        } else {
          const shift = Number(caesarShiftEl?.value ?? 13) || 13;
          result = caesarShift(raw, direction === 'encode' ? shift : -shift);
        }
      } else if (alg === 'xor') {
        const data = parseInputBytes(raw, inFmt);
        const keyStr = xorKeyEl?.value ?? '';
        const keyBytes = xorKeyMode?.value === 'hex' ? hexToBytes(keyStr) : utf8ToBytes(keyStr);
        result = formatOutputBytes(xorBytes(data, keyBytes), outFmt);
      } else if (alg === 'jwt') {
        result = decodeJwt(raw);
      }

      outputEl.value = result;
      setStatus(`完成 · 输出 ${result.length} 字符`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err), true);
    }
  };

  algSelect?.addEventListener('change', syncOptionVisibility);
  syncOptionVisibility();

  $<HTMLButtonElement>('#codec-encode')?.addEventListener('click', () => run('encode'));
  $<HTMLButtonElement>('#codec-decode')?.addEventListener('click', () => run('decode'));
  $<HTMLButtonElement>('#codec-caesar-brute')?.addEventListener('click', () => run('brute'));
  $<HTMLButtonElement>('#codec-swap')?.addEventListener('click', () => {
    if (!inputEl || !outputEl) return;
    const tmp = inputEl.value;
    inputEl.value = outputEl.value;
    outputEl.value = tmp;
    setStatus('已交换输入与输出');
  });
  $<HTMLButtonElement>('#codec-copy')?.addEventListener('click', (e) => {
    copyText(outputEl?.value ?? '', e.currentTarget as HTMLButtonElement);
  });
  $<HTMLButtonElement>('#codec-clear')?.addEventListener('click', () => {
    if (inputEl) inputEl.value = '';
    if (outputEl) outputEl.value = '';
    setStatus('已清空');
  });
}

/* ==================== TAB 2: CONVERT ==================== */
function initConvert(): void {
  // 1. Radix & Endianness
  const numInput = $<HTMLInputElement>('#conv-num-input');
  const numBase = $<HTMLSelectElement>('#conv-num-base');
  const numErr = $<HTMLElement>('#conv-num-error');
  const fields: Record<string, HTMLElement | null> = {
    dec: $('#out-dec'),
    hex: $('#out-hex'),
    bin: $('#out-bin'),
    oct: $('#out-oct'),
    beHex: $('#out-be-hex'),
    leHex: $('#out-le-hex'),
    asciiBE: $('#out-ascii-be'),
    asciiLE: $('#out-ascii-le'),
    uint32: $('#out-u32'),
    int32: $('#out-i32'),
    cArray: $('#out-c-array'),
    pyBytes: $('#out-py-bytes'),
  };

  const updateNum = () => {
    if (!numInput || !numBase) return;
    const val = numInput.value;
    if (!val.trim()) {
      if (numErr) numErr.textContent = '';
      Object.values(fields).forEach((el) => {
        if (el) el.textContent = '—';
      });
      return;
    }
    try {
      const res = convertNumberOrAscii(val, numBase.value as 'auto' | 'dec' | 'hex' | 'bin' | 'oct' | 'ascii');
      if (numErr) numErr.textContent = '';
      if (fields.dec) fields.dec.textContent = res.dec;
      if (fields.hex) fields.hex.textContent = res.hex;
      if (fields.bin) fields.bin.textContent = res.bin;
      if (fields.oct) fields.oct.textContent = res.oct;
      if (fields.beHex) fields.beHex.textContent = bytesToHex(res.bytesBigEndian, ' ');
      if (fields.leHex) fields.leHex.textContent = bytesToHex(res.bytesLittleEndian, ' ');
      if (fields.asciiBE) fields.asciiBE.textContent = res.asciiBE || '—';
      if (fields.asciiLE) fields.asciiLE.textContent = res.asciiLE || '—';
      if (fields.uint32) fields.uint32.textContent = res.uint32;
      if (fields.int32) fields.int32.textContent = res.int32;
      if (fields.cArray) fields.cArray.textContent = res.cArray;
      if (fields.pyBytes) fields.pyBytes.textContent = res.pyBytes;
    } catch (err) {
      if (numErr) numErr.textContent = err instanceof Error ? err.message : String(err);
    }
  };

  numInput?.addEventListener('input', updateNum);
  numBase?.addEventListener('change', updateNum);
  updateNum();

  document.querySelectorAll<HTMLButtonElement>('[data-copy-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.copyTarget;
      const target = targetId ? document.getElementById(targetId) : null;
      const text = target?.textContent?.trim() ?? '';
      if (text && text !== '—') copyText(text, btn);
    });
  });

  // 2. JSON Formatter
  const jsonInput = $<HTMLTextAreaElement>('#json-input');
  const jsonStatus = $<HTMLElement>('#json-status');

  const sortKeysDeep = (val: unknown): unknown => {
    if (Array.isArray(val)) return val.map(sortKeysDeep);
    if (val && typeof val === 'object') {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(val as Record<string, unknown>).sort()) {
        sorted[k] = sortKeysDeep((val as Record<string, unknown>)[k]);
      }
      return sorted;
    }
    return val;
  };

  const runJson = (mode: 'pretty' | 'minify' | 'sort' | 'escape' | 'unescape') => {
    if (!jsonInput) return;
    try {
      const raw = jsonInput.value;
      if (mode === 'escape') {
        jsonInput.value = JSON.stringify(raw);
      } else if (mode === 'unescape') {
        const parsed = JSON.parse(raw);
        jsonInput.value = typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
      } else {
        const obj = JSON.parse(raw);
        if (mode === 'pretty') jsonInput.value = JSON.stringify(obj, null, 2);
        else if (mode === 'minify') jsonInput.value = JSON.stringify(obj);
        else jsonInput.value = JSON.stringify(sortKeysDeep(obj), null, 2);
      }
      if (jsonStatus) {
        jsonStatus.textContent = 'JSON 有效 ✓';
        jsonStatus.dataset.state = 'ok';
      }
    } catch (err) {
      if (jsonStatus) {
        jsonStatus.textContent = err instanceof Error ? err.message : String(err);
        jsonStatus.dataset.state = 'error';
      }
    }
  };

  $('#json-pretty')?.addEventListener('click', () => runJson('pretty'));
  $('#json-minify')?.addEventListener('click', () => runJson('minify'));
  $('#json-sort')?.addEventListener('click', () => runJson('sort'));
  $('#json-escape')?.addEventListener('click', () => runJson('escape'));
  $('#json-unescape')?.addEventListener('click', () => runJson('unescape'));
  $('#json-copy')?.addEventListener('click', (e) => {
    copyText(jsonInput?.value ?? '', e.currentTarget as HTMLButtonElement);
  });

  // 3. Timestamp Converter
  const tsInput = $<HTMLInputElement>('#ts-input');
  const tsLocal = $<HTMLElement>('#ts-local');
  const tsUtc = $<HTMLElement>('#ts-utc');
  const tsSec = $<HTMLElement>('#ts-sec');
  const tsMs = $<HTMLElement>('#ts-ms');

  const updateTimestamp = () => {
    const raw = tsInput?.value.trim() ?? '';
    if (!raw) return;
    let date: Date;
    if (/^-?\d+$/.test(raw)) {
      const num = Number(raw);
      date = new Date(Math.abs(num) < 1e12 ? num * 1000 : num);
    } else {
      date = new Date(raw);
    }
    if (Number.isNaN(date.getTime())) {
      if (tsLocal) tsLocal.textContent = '无效时间格式';
      return;
    }
    if (tsLocal) tsLocal.textContent = date.toLocaleString('zh-CN', { hour12: false });
    if (tsUtc) tsUtc.textContent = date.toISOString();
    if (tsSec) tsSec.textContent = String(Math.floor(date.getTime() / 1000));
    if (tsMs) tsMs.textContent = String(date.getTime());
  };

  tsInput?.addEventListener('input', updateTimestamp);
  $('#ts-now')?.addEventListener('click', () => {
    if (tsInput) {
      tsInput.value = String(Math.floor(Date.now() / 1000));
      updateTimestamp();
    }
  });
  if (tsInput) {
    tsInput.value = String(Math.floor(Date.now() / 1000));
    updateTimestamp();
  }

  // 4. Hash Digest
  const hashInput = $<HTMLTextAreaElement>('#hash-input');
  const hashFile = $<HTMLInputElement>('#hash-file');
  const hashSource = $<HTMLElement>('#hash-source');
  const hashGrid = $<HTMLElement>('#hash-results');

  const renderHashes = async (bytes: Uint8Array, label: string) => {
    if (hashSource) hashSource.textContent = `${label} · ${formatBytesSize(bytes.length)}`;
    const hashes = await computeHashes(bytes);
    if (!hashGrid) return;
    hashGrid.innerHTML = Object.entries(hashes)
      .map(
        ([alg, val]) =>
          `<div class="kv-row"><span class="kv-label">${alg}</span><code class="kv-value">${val}</code><button type="button" class="mini-copy" data-copy-literal="${val}">复制</button></div>`,
      )
      .join('');
    hashGrid.querySelectorAll<HTMLButtonElement>('[data-copy-literal]').forEach((btn) => {
      btn.addEventListener('click', () => copyText(btn.dataset.copyLiteral ?? '', btn));
    });
  };

  hashInput?.addEventListener('input', () => {
    void renderHashes(utf8ToBytes(hashInput.value), '文本输入');
  });
  hashFile?.addEventListener('change', async () => {
    const file = hashFile.files?.[0];
    if (!file) return;
    const buf = new Uint8Array(await file.arrayBuffer());
    await renderHashes(buf, `文件: ${file.name}`);
  });
  void renderHashes(utf8ToBytes(hashInput?.value ?? ''), '文本输入');
}

/* ==================== TAB 3: COMPRESS & ZIP ==================== */
function initCompress(): void {
  const fmtSelect = $<HTMLSelectElement>('#comp-format');
  const inMode = $<HTMLSelectElement>('#comp-in-mode');
  const outMode = $<HTMLSelectElement>('#comp-out-mode');
  const inputEl = $<HTMLTextAreaElement>('#comp-input');
  const outputEl = $<HTMLTextAreaElement>('#comp-output');
  const fileEl = $<HTMLInputElement>('#comp-file');
  const magicEl = $<HTMLElement>('#comp-magic');
  const statusEl = $<HTMLElement>('#comp-status');
  const downloadBtn = $<HTMLButtonElement>('#comp-download');

  let loadedFileBytes: Uint8Array | null = null;
  let loadedFileName = 'output.bin';
  let lastResultBytes: Uint8Array | null = null;
  let lastResultName = 'output.bin';

  const setStatus = (msg: string, isError = false) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.dataset.state = isError ? 'error' : 'ok';
  };

  if (!hasStreamCompression()) {
    setStatus('当前浏览器不支持原生 CompressionStream / DecompressionStream API', true);
  }

  const updateMagicHint = (bytes: Uint8Array | null) => {
    if (!magicEl) return;
    if (!bytes || bytes.length === 0) {
      magicEl.textContent = '等待输入…';
      return;
    }
    const magic = detectMagic(bytes);
    magicEl.textContent = magic ? `检测到魔数：${magic}` : `原始数据 · ${formatBytesSize(bytes.length)}`;
  };

  fileEl?.addEventListener('change', async () => {
    const file = fileEl.files?.[0];
    if (!file) return;
    loadedFileBytes = new Uint8Array(await file.arrayBuffer());
    loadedFileName = file.name;
    updateMagicHint(loadedFileBytes);
    setStatus(`已载入本地文件：${file.name}（${formatBytesSize(loadedFileBytes.length)}）`);
  });

  inputEl?.addEventListener('input', () => {
    loadedFileBytes = null;
    try {
      const bytes = parseInputBytes(inputEl.value, (inMode?.value as 'utf8' | 'hex' | 'base64') ?? 'utf8');
      updateMagicHint(bytes);
    } catch {
      updateMagicHint(null);
    }
  });

  const runStream = async (action: 'compress' | 'decompress') => {
    if (!fmtSelect || !outputEl) return;
    const format = fmtSelect.value as StreamFormat;
    const outFmt = (outMode?.value as 'utf8' | 'hex' | 'base64') ?? 'base64';
    try {
      const source =
        loadedFileBytes ??
        parseInputBytes(inputEl?.value ?? '', (inMode?.value as 'utf8' | 'hex' | 'base64') ?? 'utf8');
      const result =
        action === 'compress' ? await compressStream(source, format) : await decompressStream(source, format);
      lastResultBytes = result;
      const ext = format === 'gzip' ? '.gz' : '.zlib';
      lastResultName =
        action === 'compress'
          ? `${loadedFileName}${ext}`
          : loadedFileName.replace(/\.(gz|gzip|zlib|deflate)$/i, '') || 'decompressed.bin';
      if (downloadBtn) downloadBtn.disabled = false;

      outputEl.value = formatOutputBytes(result, outFmt);
      const ratio = source.length ? ((result.length / source.length) * 100).toFixed(1) : '0.0';
      setStatus(
        `${action === 'compress' ? '压缩' : '解压'}成功：${formatBytesSize(source.length)} → ${formatBytesSize(result.length)}（${ratio}%）`,
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err), true);
    }
  };

  $('#comp-compress')?.addEventListener('click', () => void runStream('compress'));
  $('#comp-decompress')?.addEventListener('click', () => void runStream('decompress'));
  $('#comp-copy')?.addEventListener('click', (e) => {
    copyText(outputEl?.value ?? '', e.currentTarget as HTMLButtonElement);
  });
  downloadBtn?.addEventListener('click', () => {
    if (lastResultBytes) downloadBlob(lastResultBytes, lastResultName);
  });

  /* ---- ZIP Inspector & Creator ---- */
  const zipInput = $<HTMLInputElement>('#zip-open-file');
  const zipTableBody = $<HTMLElement>('#zip-entries-body');
  const zipStatus = $<HTMLElement>('#zip-status');
  const zipPreviewWrap = $<HTMLElement>('#zip-preview-wrap');
  const zipPreviewTitle = $<HTMLElement>('#zip-preview-title');
  const zipPreviewContent = $<HTMLElement>('#zip-preview-content');

  const renderZipEntries = (entries: ZipEntryInfo[]) => {
    if (!zipTableBody) return;
    if (!entries.length) {
      zipTableBody.innerHTML = '<tr><td colspan="5" class="muted">压缩包内没有条目</td></tr>';
      return;
    }
    zipTableBody.innerHTML = '';
    for (const entry of entries) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code>${entry.name}</code></td>
        <td>${entry.methodLabel}</td>
        <td>${formatBytesSize(entry.compressedSize)} → ${formatBytesSize(entry.uncompressedSize)}</td>
        <td><code>${entry.crc32Hex}</code></td>
        <td class="zip-actions"></td>
      `;
      const actionCell = tr.querySelector('.zip-actions')!;
      if (!entry.isDir) {
        const previewBtn = document.createElement('button');
        previewBtn.type = 'button';
        previewBtn.textContent = '预览';
        previewBtn.addEventListener('click', async () => {
          try {
            const bytes = await entry.extract();
            if (zipPreviewWrap) zipPreviewWrap.hidden = false;
            if (zipPreviewTitle) zipPreviewTitle.textContent = `${entry.name}（${formatBytesSize(bytes.length)}）`;
            const slice = bytes.subarray(0, 64 * 1024);
            const looksBinary = slice.some((b) => b === 0);
            if (zipPreviewContent) {
              zipPreviewContent.textContent = looksBinary
                ? `[二进制预览 · 前 ${Math.min(bytes.length, 512)} 字节 Hex]\n${bytesToHex(bytes.subarray(0, 512), ' ')}`
                : bytesToUtf8(slice) + (bytes.length > slice.length ? '\n\n…（内容较长，已截断预览，请点击下载获取完整文件）' : '');
            }
          } catch (err) {
            if (zipStatus) {
              zipStatus.textContent = err instanceof Error ? err.message : String(err);
              zipStatus.dataset.state = 'error';
            }
          }
        });

        const dlBtn = document.createElement('button');
        dlBtn.type = 'button';
        dlBtn.textContent = '下载';
        dlBtn.addEventListener('click', async () => {
          try {
            const bytes = await entry.extract();
            const baseName = entry.name.split('/').pop() || 'file.bin';
            downloadBlob(bytes, baseName);
          } catch (err) {
            if (zipStatus) {
              zipStatus.textContent = err instanceof Error ? err.message : String(err);
              zipStatus.dataset.state = 'error';
            }
          }
        });

        actionCell.append(previewBtn, dlBtn);
      } else {
        actionCell.innerHTML = '<span class="muted">目录</span>';
      }
      zipTableBody.append(tr);
    }
  };

  zipInput?.addEventListener('change', async () => {
    const file = zipInput.files?.[0];
    if (!file) return;
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      const entries = parseZip(buf);
      renderZipEntries(entries);
      if (zipStatus) {
        zipStatus.textContent = `已解析 ${file.name}：共 ${entries.length} 个条目`;
        zipStatus.dataset.state = 'ok';
      }
    } catch (err) {
      if (zipStatus) {
        zipStatus.textContent = err instanceof Error ? err.message : String(err);
        zipStatus.dataset.state = 'error';
      }
    }
  });

  // Create ZIP
  const packInput = $<HTMLInputElement>('#zip-pack-files');
  const packBtn = $<HTMLButtonElement>('#zip-pack-btn');
  const packStatus = $<HTMLElement>('#zip-pack-status');

  packInput?.addEventListener('change', () => {
    const count = packInput.files?.length ?? 0;
    if (packBtn) packBtn.disabled = count === 0;
    if (packStatus) {
      packStatus.textContent = count > 0 ? `已选择 ${count} 个文件，准备打包` : '未选择文件';
    }
  });

  packBtn?.addEventListener('click', async () => {
    const files = packInput?.files;
    if (!files || files.length === 0) return;
    try {
      const list: Array<{ name: string; data: Uint8Array }> = [];
      for (const f of Array.from(files)) {
        list.push({ name: f.name, data: new Uint8Array(await f.arrayBuffer()) });
      }
      const zipBytes = await createZip(list, true);
      downloadBlob(zipBytes, `bundle-${Date.now()}.zip`, 'application/zip');
      if (packStatus) {
        packStatus.textContent = `打包完成：${list.length} 个文件，总大小 ${formatBytesSize(zipBytes.length)}`;
        packStatus.dataset.state = 'ok';
      }
    } catch (err) {
      if (packStatus) {
        packStatus.textContent = err instanceof Error ? err.message : String(err);
        packStatus.dataset.state = 'error';
      }
    }
  });
}

initTabs();
initCodec();
initConvert();
initCompress();
