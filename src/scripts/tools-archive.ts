import { crc32 } from './tools-codec';

export type StreamFormat = 'gzip' | 'deflate' | 'deflate-raw';

export function hasStreamCompression(): boolean {
  return typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';
}

export function detectMagic(bytes: Uint8Array): string | null {
  if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) return 'Gzip (1F 8B)';
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 0x03 || bytes[2] === 0x05)) {
    return 'ZIP 归档 (50 4B)';
  }
  if (bytes.length >= 2 && bytes[0] === 0x78 && [0x01, 0x5e, 0x9c, 0xda].includes(bytes[1])) {
    return 'Zlib / Deflate (78 9C/01/DA)';
  }
  if (bytes.length >= 6 && bytes[0] === 0xfd && bytes[1] === 0x37 && bytes[2] === 0x7a && bytes[3] === 0x58) {
    return 'XZ (FD 37 7A 58)';
  }
  if (bytes.length >= 4 && bytes[0] === 0x28 && bytes[1] === 0xb5 && bytes[2] === 0x2f && bytes[3] === 0xfd) {
    return 'Zstd (28 B5 2F FD)';
  }
  if (bytes.length >= 4 && bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) {
    return 'ELF 可执行文件';
  }
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'PNG 图片';
  }
  return null;
}

async function pipeBytes(bytes: Uint8Array, stream: ReadableWritablePair<Uint8Array, Uint8Array>): Promise<Uint8Array> {
  const writer = stream.writable.getWriter();
  const writePromise = writer.write(Uint8Array.from(bytes)).then(() => writer.close());
  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        total += value.length;
      }
    }
    await writePromise;
  } finally {
    reader.releaseLock();
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

export async function compressStream(bytes: Uint8Array, format: StreamFormat): Promise<Uint8Array> {
  if (!hasStreamCompression()) {
    throw new Error('当前浏览器不支持原生 CompressionStream API');
  }
  return pipeBytes(bytes, new CompressionStream(format));
}

export async function decompressStream(bytes: Uint8Array, format: StreamFormat): Promise<Uint8Array> {
  if (!hasStreamCompression()) {
    throw new Error('当前浏览器不支持原生 DecompressionStream API');
  }
  return pipeBytes(bytes, new DecompressionStream(format));
}

/* -------------------- Minimal Standard ZIP Parser & Builder -------------------- */
export interface ZipEntryInfo {
  name: string;
  method: number;
  methodLabel: string;
  compressedSize: number;
  uncompressedSize: number;
  crc32Hex: string;
  isDir: boolean;
  localHeaderOffset: number;
  extract: () => Promise<Uint8Array>;
}

const utf8Dec = new TextDecoder('utf-8', { fatal: false });
const utf8Enc = new TextEncoder();

export function parseZip(buffer: Uint8Array): ZipEntryInfo[] {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  // Locate End of Central Directory (EOCD) signature 0x06054b50
  const minPos = Math.max(0, buffer.length - 65557);
  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= minPos; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error('未找到有效的 ZIP 目录尾（EOCD），文件可能不是标准 ZIP 或已损坏');
  }

  const totalEntries = view.getUint16(eocdOffset + 10, true);
  const cdOffset = view.getUint32(eocdOffset + 16, true);
  const entries: ZipEntryInfo[] = [];

  let ptr = cdOffset;
  for (let idx = 0; idx < totalEntries && ptr + 46 <= buffer.length; idx++) {
    if (view.getUint32(ptr, true) !== 0x02014b50) break;
    const method = view.getUint16(ptr + 10, true);
    const crc = view.getUint32(ptr + 16, true);
    const compressedSize = view.getUint32(ptr + 20, true);
    const uncompressedSize = view.getUint32(ptr + 24, true);
    const nameLen = view.getUint16(ptr + 28, true);
    const extraLen = view.getUint16(ptr + 30, true);
    const commentLen = view.getUint16(ptr + 32, true);
    const localHeaderOffset = view.getUint32(ptr + 42, true);
    const name = utf8Dec.decode(buffer.subarray(ptr + 46, ptr + 46 + nameLen));
    ptr += 46 + nameLen + extraLen + commentLen;

    const methodLabel = method === 0 ? 'Store' : method === 8 ? 'Deflate' : `Method ${method}`;
    const isDir = name.endsWith('/');

    entries.push({
      name,
      method,
      methodLabel,
      compressedSize,
      uncompressedSize,
      crc32Hex: crc.toString(16).padStart(8, '0'),
      isDir,
      localHeaderOffset,
      extract: async () => {
        if (isDir) return new Uint8Array(0);
        if (view.getUint32(localHeaderOffset, true) !== 0x04034b50) {
          throw new Error(`条目 ${name} 的本地文件头签名无效`);
        }
        const localNameLen = view.getUint16(localHeaderOffset + 26, true);
        const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
        const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
        const rawSlice = buffer.subarray(dataStart, dataStart + compressedSize);
        if (method === 0) return Uint8Array.from(rawSlice);
        if (method === 8) return decompressStream(rawSlice, 'deflate-raw');
        throw new Error(`暂不支持 ZIP 压缩方式 ${method}（仅支持 Store 与 Deflate）`);
      },
    });
  }
  return entries;
}

export async function createZip(
  files: Array<{ name: string; data: Uint8Array }>,
  useDeflate = true,
): Promise<Uint8Array> {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  const canDeflate = useDeflate && hasStreamCompression();

  for (const file of files) {
    const nameBytes = utf8Enc.encode(file.name);
    const crc = crc32(file.data);
    let method = 0;
    let payload = file.data;

    if (canDeflate && file.data.length > 0) {
      const deflated = await compressStream(file.data, 'deflate-raw');
      if (deflated.length < file.data.length) {
        method = 8;
        payload = deflated;
      }
    }

    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true); // UTF-8 filename flag
    lv.setUint16(8, method, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, payload.length, true);
    lv.setUint32(22, file.data.length, true);
    lv.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, 30);

    localParts.push(local, payload);

    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, method, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, payload.length, true);
    cv.setUint32(24, file.data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centralParts.push(central);

    offset += local.length + payload.length;
  }

  const cdSize = centralParts.reduce((s, p) => s + p.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);

  const total = offset + cdSize + eocd.length;
  const out = new Uint8Array(total);
  let pos = 0;
  for (const part of [...localParts, ...centralParts, eocd]) {
    out.set(part, pos);
    pos += part.length;
  }
  return out;
}
