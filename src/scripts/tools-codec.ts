const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: false });

export const STD_B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export const URL_B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const B32_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const B58_ALPHA = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function utf8ToBytes(str: string): Uint8Array {
  return encoder.encode(str);
}

export function bytesToUtf8(bytes: Uint8Array): string {
  return decoder.decode(bytes);
}

export function bytesToHex(bytes: Uint8Array, sep = ' '): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(sep);
}

export function hexToBytes(input: string): Uint8Array {
  const cleaned = input
    .replace(/0x/gi, '')
    .replace(/\\x/gi, '')
    .replace(/[^0-9a-fA-F]/g, '');
  if (cleaned.length === 0) return new Uint8Array(0);
  if (cleaned.length % 2 !== 0) {
    throw new Error('Hex 长度必须为偶数（已忽略空格、0x、\\x 与分隔符）');
  }
  const out = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function parseInputBytes(input: string, mode: 'utf8' | 'hex' | 'base64'): Uint8Array {
  if (mode === 'hex') return hexToBytes(input);
  if (mode === 'base64') return base64Decode(input, STD_B64);
  return utf8ToBytes(input);
}

export function formatOutputBytes(bytes: Uint8Array, mode: 'utf8' | 'hex' | 'base64'): string {
  if (mode === 'hex') return bytesToHex(bytes, ' ');
  if (mode === 'base64') return base64Encode(bytes, STD_B64, '=');
  return bytesToUtf8(bytes);
}

/* -------------------- Base64 (Standard / URL-Safe / Custom Table) -------------------- */
export function validateBase64Table(table: string): string {
  const clean = table.trim();
  if (clean.length !== 64) {
    throw new Error(`自定义 Base64 码表需要 64 个不重复字符（当前 ${clean.length} 个）`);
  }
  if (new Set(clean).size !== 64) {
    throw new Error('自定义 Base64 码表中存在重复字符');
  }
  return clean;
}

export function base64Encode(bytes: Uint8Array, alphabet = STD_B64, pad = '='): string {
  const table = alphabet === STD_B64 || alphabet === URL_B64 ? alphabet : validateBase64Table(alphabet);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const has1 = i + 1 < bytes.length;
    const has2 = i + 2 < bytes.length;
    const b1 = has1 ? bytes[i + 1] : 0;
    const b2 = has2 ? bytes[i + 2] : 0;
    const triple = (b0 << 16) | (b1 << 8) | b2;
    out += table[(triple >> 18) & 63];
    out += table[(triple >> 12) & 63];
    out += has1 ? table[(triple >> 6) & 63] : pad;
    out += has2 ? table[triple & 63] : pad;
  }
  return out;
}

export function base64Decode(input: string, alphabet = STD_B64, pad = '='): Uint8Array {
  const table = alphabet === STD_B64 || alphabet === URL_B64 ? alphabet : validateBase64Table(alphabet);
  const map = new Map<string, number>();
  for (let i = 0; i < 64; i++) map.set(table[i], i);

  const stripped = input.replace(/\s+/g, '');
  if (!stripped) return new Uint8Array(0);

  const padChar = pad ? pad[0] : '=';
  const vals: number[] = [];
  for (const ch of stripped) {
    if (ch === padChar) continue;
    const v = map.get(ch);
    if (v === undefined) {
      throw new Error(`Base64 解码遇到非法字符: "${ch}"`);
    }
    vals.push(v);
  }

  const outLen = Math.floor((vals.length * 6) / 8);
  const out = new Uint8Array(outLen);
  let bitBuf = 0;
  let bitLen = 0;
  let idx = 0;
  for (const v of vals) {
    bitBuf = (bitBuf << 6) | v;
    bitLen += 6;
    if (bitLen >= 8) {
      bitLen -= 8;
      out[idx++] = (bitBuf >> bitLen) & 0xff;
    }
  }
  return out;
}

/* -------------------- Base32 -------------------- */
export function base32Encode(bytes: Uint8Array): string {
  let out = '';
  let bitBuf = 0;
  let bitLen = 0;
  for (const b of bytes) {
    bitBuf = (bitBuf << 8) | b;
    bitLen += 8;
    while (bitLen >= 5) {
      bitLen -= 5;
      out += B32_ALPHA[(bitBuf >> bitLen) & 31];
    }
  }
  if (bitLen > 0) {
    out += B32_ALPHA[(bitBuf << (5 - bitLen)) & 31];
  }
  while (out.length % 8 !== 0) out += '=';
  return out;
}

export function base32Decode(input: string): Uint8Array {
  const clean = input.replace(/\s+/g, '').replace(/=+$/, '').toUpperCase();
  if (!clean) return new Uint8Array(0);
  const out: number[] = [];
  let bitBuf = 0;
  let bitLen = 0;
  for (const ch of clean) {
    const v = B32_ALPHA.indexOf(ch);
    if (v === -1) throw new Error(`Base32 非法字符: "${ch}"`);
    bitBuf = (bitBuf << 5) | v;
    bitLen += 5;
    if (bitLen >= 8) {
      bitLen -= 8;
      out.push((bitBuf >> bitLen) & 0xff);
    }
  }
  return new Uint8Array(out);
}

/* -------------------- Base58 (Bitcoin) -------------------- */
export function base58Encode(bytes: Uint8Array): string {
  if (bytes.length === 0) return '';
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  let num = 0n;
  for (const b of bytes) num = (num << 8n) + BigInt(b);
  let encoded = '';
  while (num > 0n) {
    const rem = Number(num % 58n);
    num /= 58n;
    encoded = B58_ALPHA[rem] + encoded;
  }
  return '1'.repeat(zeros) + encoded;
}

export function base58Decode(input: string): Uint8Array {
  const clean = input.trim();
  if (!clean) return new Uint8Array(0);
  let zeros = 0;
  while (zeros < clean.length && clean[zeros] === '1') zeros++;
  let num = 0n;
  for (const ch of clean) {
    const idx = B58_ALPHA.indexOf(ch);
    if (idx === -1) throw new Error(`Base58 非法字符: "${ch}"`);
    num = num * 58n + BigInt(idx);
  }
  const bytes: number[] = [];
  while (num > 0n) {
    bytes.push(Number(num & 0xffn));
    num >>= 8n;
  }
  bytes.reverse();
  const out = new Uint8Array(zeros + bytes.length);
  out.set(bytes, zeros);
  return out;
}

/* -------------------- URL / Unicode / HTML -------------------- */
export function urlEncode(input: string, full = false): string {
  if (!full) return encodeURIComponent(input);
  return Array.from(utf8ToBytes(input), (b) => `%${b.toString(16).toUpperCase().padStart(2, '0')}`).join('');
}

export function urlDecode(input: string): string {
  return decodeURIComponent(input.replace(/\+/g, ' '));
}

export function unicodeEscape(input: string): string {
  let out = '';
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    out += code > 127 ? `\\u${code.toString(16).padStart(4, '0')}` : input[i];
  }
  return out;
}

export function unicodeUnescape(input: string): string {
  return input
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export function htmlEntityEncode(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[ch] ?? ch;
  });
}

export function htmlEntityDecode(input: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = input;
  return el.value;
}

/* -------------------- Caesar / ROT13 / XOR / JWT -------------------- */
export function caesarShift(input: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return input.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch >= 'a' ? 97 : 65;
    return String.fromCharCode(((ch.charCodeAt(0) - base + s) % 26) + base);
  });
}

export function caesarBruteForce(input: string): string {
  const lines: string[] = [];
  for (let s = 1; s < 26; s++) {
    lines.push(`+${String(s).padStart(2, '0')} (-${String(26 - s).padStart(2, '0')}): ${caesarShift(input, s)}`);
  }
  return lines.join('\n');
}

export function xorBytes(data: Uint8Array, key: Uint8Array): Uint8Array {
  if (key.length === 0) throw new Error('XOR 密钥不能为空');
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = data[i] ^ key[i % key.length];
  }
  return out;
}

export function decodeJwt(token: string): string {
  const parts = token.trim().split('.');
  if (parts.length < 2) throw new Error('无效的 JWT：至少需要 header.payload 两段');
  const decodePart = (seg: string) => {
    const padded = seg.replace(/-/g, '+').replace(/_/g, '/');
    return bytesToUtf8(base64Decode(padded, STD_B64));
  };
  const headerObj = JSON.parse(decodePart(parts[0]));
  const payloadObj = JSON.parse(decodePart(parts[1]));
  const timeHints: Record<string, string> = {};
  for (const field of ['iat', 'exp', 'nbf']) {
    if (typeof payloadObj[field] === 'number') {
      timeHints[field] = new Date(payloadObj[field] * 1000).toLocaleString('zh-CN');
    }
  }
  return JSON.stringify(
    {
      header: headerObj,
      payload: payloadObj,
      ...(Object.keys(timeHints).length ? { _timestamps: timeHints } : {}),
      signature: parts[2] ?? '',
    },
    null,
    2,
  );
}

/* -------------------- Radix & Endianness (BigInt) -------------------- */
export interface RadixResult {
  dec: string;
  hex: string;
  bin: string;
  oct: string;
  bytesBigEndian: Uint8Array;
  bytesLittleEndian: Uint8Array;
  asciiBE: string;
  asciiLE: string;
  uint8: string;
  int8: string;
  uint32: string;
  int32: string;
  uint64: string;
  cArray: string;
  pyBytes: string;
}

function printableAscii(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
}

export function convertNumberOrAscii(raw: string, base: 'auto' | 'dec' | 'hex' | 'bin' | 'oct' | 'ascii'): RadixResult {
  const text = raw.trim();
  if (!text) throw new Error('请输入数值或 ASCII 文本');

  let value: bigint;
  if (base === 'ascii') {
    const bytes = utf8ToBytes(raw);
    value = 0n;
    for (const b of bytes) value = (value << 8n) | BigInt(b);
  } else if (base === 'auto') {
    const clean = text.replace(/[_\s]/g, '');
    if (/^-?0x[0-9a-fA-F]+$/i.test(clean)) value = BigInt(clean);
    else if (/^-?0b[01]+$/i.test(clean)) value = BigInt(clean);
    else if (/^-?0o[0-7]+$/i.test(clean)) value = BigInt(clean);
    else if (/^-?[0-9]+$/.test(clean)) value = BigInt(clean);
    else if (/^[0-9a-fA-F]+$/.test(clean)) value = BigInt(`0x${clean}`);
    else {
      const bytes = utf8ToBytes(raw);
      value = 0n;
      for (const b of bytes) value = (value << 8n) | BigInt(b);
    }
  } else {
    const clean = text.replace(/[_\s]/g, '').replace(/^(0x|0b|0o)/i, '');
    const neg = clean.startsWith('-');
    const digits = neg ? clean.slice(1) : clean;
    const prefix = base === 'hex' ? '0x' : base === 'bin' ? '0b' : base === 'oct' ? '0o' : '';
    value = BigInt((neg ? '-' : '') + prefix + digits);
  }

  const unsigned = value < 0n ? BigInt.asUintN(64, value) : value;
  const hexRaw = unsigned.toString(16);
  const hexPadded = hexRaw.length % 2 === 0 ? hexRaw : `0${hexRaw}`;
  const be = hexToBytes(hexPadded);
  const le = Uint8Array.from(be).reverse();

  return {
    dec: value.toString(10),
    hex: `0x${hexRaw.toUpperCase()}`,
    bin: `0b${unsigned.toString(2)}`,
    oct: `0o${unsigned.toString(8)}`,
    bytesBigEndian: be,
    bytesLittleEndian: le,
    asciiBE: printableAscii(be),
    asciiLE: printableAscii(le),
    uint8: BigInt.asUintN(8, value).toString(10),
    int8: BigInt.asIntN(8, value).toString(10),
    uint32: `${BigInt.asUintN(32, value).toString(10)} (0x${BigInt.asUintN(32, value).toString(16).padStart(8, '0')})`,
    int32: BigInt.asIntN(32, value).toString(10),
    uint64: `${BigInt.asUintN(64, value).toString(10)} (0x${BigInt.asUintN(64, value).toString(16).padStart(16, '0')})`,
    cArray: `{ ${Array.from(be, (b) => `0x${b.toString(16).padStart(2, '0')}`).join(', ')} }`,
    pyBytes: `b"${Array.from(be, (b) => `\\x${b.toString(16).padStart(2, '0')}`).join('')}"`,
  };
}

/* -------------------- CRC32 & MD5 & WebCrypto SHA -------------------- */
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC32_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

export function md5(bytes: Uint8Array): string {
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
  }

  const origBitLen = BigInt(bytes.length) * 8n;
  const padLen = ((56 - ((bytes.length + 1) % 64)) + 64) % 64;
  const padded = new Uint8Array(bytes.length + 1 + padLen + 8);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Number(origBitLen & 0xffffffffn), true);
  view.setUint32(padded.length - 4, Number((origBitLen >> 32n) & 0xffffffffn), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < padded.length; offset += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) M[j] = view.getUint32(offset + j * 4, true);
    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;
    for (let i = 0; i < 64; i++) {
      let F = 0;
      let g = 0;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      const temp = D;
      D = C;
      C = B;
      const sum = (A + F + K[i] + M[g]) >>> 0;
      B = (B + ((sum << s[i]) | (sum >>> (32 - s[i])))) >>> 0;
      A = temp;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const out = new Uint8Array(16);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, a0, true);
  outView.setUint32(4, b0, true);
  outView.setUint32(8, c0, true);
  outView.setUint32(12, d0, true);
  return bytesToHex(out, '');
}

export async function computeHashes(bytes: Uint8Array): Promise<Record<string, string>> {
  const result: Record<string, string> = {
    CRC32: crc32(bytes).toString(16).padStart(8, '0'),
    MD5: md5(bytes),
  };
  if (globalThis.crypto?.subtle) {
    const copy = Uint8Array.from(bytes);
    for (const alg of ['SHA-1', 'SHA-256', 'SHA-512'] as const) {
      const digest = await crypto.subtle.digest(alg, copy);
      result[alg] = bytesToHex(new Uint8Array(digest), '');
    }
  }
  return result;
}
