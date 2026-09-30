import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPng(width, height, isMaskable = false) {
  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.45 : 0.42);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background gradient: Deep Slate / Indigo #1e293b to #0f172a
      const t = (x + y) / (width + height);
      let r = Math.round(15 + 15 * t);
      let g = Math.round(23 + 20 * t);
      let b = Math.round(42 + 45 * t);
      let a = 255;

      // Rounded squircle / container
      const cornerRadius = width * 0.22;
      const qx = Math.max(0, Math.abs(x - cx) - (cx - cornerRadius));
      const qy = Math.max(0, Math.abs(y - cy) - (cy - cornerRadius));
      const cornerDist = Math.sqrt(qx * qx + qy * qy);

      if (!isMaskable && cornerDist > cornerRadius) {
        // Transparent outside rounded icon
        r = 0; g = 0; b = 0; a = 0;
      } else {
        // Inner badge / spark grid design
        // Draw a shield / spreadsheet grid icon in vibrant teal / cyan / emerald (#06b6d4, #10b981)
        const innerX = (x - cx) / (width * 0.5);
        const innerY = (y - cy) / (height * 0.5);

        // Grid box bounds: [-0.6, 0.6]
        if (Math.abs(innerX) <= 0.6 && Math.abs(innerY) <= 0.6) {
          const borderThick = 0.04;
          const isOuterBorder = Math.abs(innerX) >= 0.54 || Math.abs(innerY) >= 0.54;
          const isHorizLine = Math.abs(innerY) <= borderThick || Math.abs(innerY + 0.28) <= borderThick || Math.abs(innerY - 0.28) <= borderThick;
          const isVertLine = Math.abs(innerX) <= borderThick || Math.abs(innerX + 0.28) <= borderThick || Math.abs(innerX - 0.28) <= borderThick;

          if (isOuterBorder || isHorizLine || isVertLine) {
            // Cyan grid lines #38bdf8
            r = 56; g = 189; b = 248; a = 255;
          } else if (innerY < -0.28) {
            // Header bar: Emerald #10b981
            r = 16; g = 185; b = 129; a = 255;
          } else if (innerX > 0 && innerY > 0) {
            // Sparkle / clean star highlight in bottom right cell
            r = 14; g = 165; b = 233; a = 240;
          }
        }
      }

      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // PNG structure
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    scanlines[rowStart] = 0; // Filter None
    buffer.copy(scanlines, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const idatData = zlib.deflateSync(scanlines);
  const idatChunk = createChunk('IDAT', idatData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(len + 12);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PNGs
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(64, 64, false));

console.log('PWA icons successfully generated in public/');
