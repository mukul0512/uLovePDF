export interface ZipEntry {
  readonly name: string;
  readonly bytes: Uint8Array;
}

const encoder = new TextEncoder();

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let crc = n;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    table[n] = crc >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let index = 0; index < data.length; index += 1) {
    const byte = data[index] ?? 0;
    const tableEntry = CRC_TABLE[(crc ^ byte) & 0xff] ?? 0;
    crc = tableEntry ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function sanitizeZipName(name: string): string {
  return name.replaceAll('\\', '/').replace(/^\//, '').replaceAll('../', '');
}

/**
 * Builds an uncompressed (STORE) ZIP archive.
 *
 * PDFs are already deflate-compressed internally, so wrapping them in another
 * deflate layer costs CPU and rarely saves bytes. STORE also keeps this helper
 * free of a ZIP library — jszip would be a dependency for a file format we
 * can write in ~100 lines.
 */
export function createZipArchive(entries: readonly ZipEntry[]): Uint8Array {
  const prepared = entries.map((entry) => {
    const name = sanitizeZipName(entry.name);
    const nameBytes = encoder.encode(name);
    return { nameBytes, data: entry.bytes, crc: crc32(entry.bytes) };
  });

  let localSize = 0;
  let centralSize = 0;
  for (const entry of prepared) {
    localSize += 30 + entry.nameBytes.byteLength + entry.data.byteLength;
    centralSize += 46 + entry.nameBytes.byteLength;
  }

  const archive = new Uint8Array(localSize + centralSize + 22);
  const view = new DataView(archive.buffer);
  const utf8Flag = 0x0800;

  let localOffset = 0;
  const centralOffsets: number[] = [];

  for (const entry of prepared) {
    centralOffsets.push(localOffset);
    view.setUint32(localOffset, 0x04034b50, true);
    view.setUint16(localOffset + 4, 20, true);
    view.setUint16(localOffset + 6, utf8Flag, true);
    view.setUint16(localOffset + 8, 0, true);
    view.setUint16(localOffset + 10, 0, true);
    view.setUint16(localOffset + 12, 0, true);
    view.setUint32(localOffset + 14, entry.crc, true);
    view.setUint32(localOffset + 18, entry.data.byteLength, true);
    view.setUint32(localOffset + 22, entry.data.byteLength, true);
    view.setUint16(localOffset + 26, entry.nameBytes.byteLength, true);
    view.setUint16(localOffset + 28, 0, true);
    archive.set(entry.nameBytes, localOffset + 30);
    archive.set(entry.data, localOffset + 30 + entry.nameBytes.byteLength);
    localOffset += 30 + entry.nameBytes.byteLength + entry.data.byteLength;
  }

  const centralStart = localOffset;
  let centralOffset = localOffset;

  prepared.forEach((entry, index) => {
    const localHeaderOffset = centralOffsets[index] ?? 0;
    view.setUint32(centralOffset, 0x02014b50, true);
    view.setUint16(centralOffset + 4, 20, true);
    view.setUint16(centralOffset + 6, 20, true);
    view.setUint16(centralOffset + 8, utf8Flag, true);
    view.setUint16(centralOffset + 10, 0, true);
    view.setUint16(centralOffset + 12, 0, true);
    view.setUint16(centralOffset + 14, 0, true);
    view.setUint32(centralOffset + 16, entry.crc, true);
    view.setUint32(centralOffset + 20, entry.data.byteLength, true);
    view.setUint32(centralOffset + 24, entry.data.byteLength, true);
    view.setUint16(centralOffset + 28, entry.nameBytes.byteLength, true);
    view.setUint16(centralOffset + 30, 0, true);
    view.setUint16(centralOffset + 32, 0, true);
    view.setUint16(centralOffset + 34, 0, true);
    view.setUint16(centralOffset + 36, 0, true);
    view.setUint32(centralOffset + 38, 0, true);
    view.setUint32(centralOffset + 42, localHeaderOffset, true);
    archive.set(entry.nameBytes, centralOffset + 46);
    centralOffset += 46 + entry.nameBytes.byteLength;
  });

  view.setUint32(centralOffset, 0x06054b50, true);
  view.setUint16(centralOffset + 4, 0, true);
  view.setUint16(centralOffset + 6, 0, true);
  view.setUint16(centralOffset + 8, prepared.length, true);
  view.setUint16(centralOffset + 10, prepared.length, true);
  view.setUint32(centralOffset + 12, centralOffset - centralStart, true);
  view.setUint32(centralOffset + 16, centralStart, true);
  view.setUint16(centralOffset + 20, 0, true);

  return archive;
}
