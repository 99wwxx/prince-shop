// Génère les icônes du site sans aucun outil externe :   node tools/icons.js
//   favicon.ico (32 px), assets/brand/apple-touch-icon.png (180 px), assets/brand/icon-512.png
// Le dessin : carré encre + « P » ivoire. Pour un vrai logo, remplacez simplement ces fichiers.
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const root = path.resolve(__dirname, '..');
const INK = [21, 18, 15], PAPER = [246, 242, 234];

/* dessine en 64 unités, avec anticrénelage par sur-échantillonnage */
function inP(x, y) {
  // fût
  if (x >= 21 && x <= 29 && y >= 15 && y <= 49) return true;
  // boucle : anneau entre deux demi-ellipses
  const cx = 29, cy = 26.5;
  const outer = ((x - cx) / 17) ** 2 + ((y - cy) / 11.5) ** 2 <= 1;
  const inner = ((x - cx) / 9.5) ** 2 + ((y - cy) / 5) ** 2 <= 1;
  return x >= 29 && outer && !inner;
}
function inBg(x, y) {
  const r = 9, dx = Math.max(r - x, 0, x - (64 - r)), dy = Math.max(r - y, 0, y - (64 - r));
  return dx * dx + dy * dy <= r * r;
}
function png(size) {
  const ss = 4, raw = Buffer.alloc((size * 4 + 1) * size);
  for (let py = 0; py < size; py++) {
    raw[py * (size * 4 + 1)] = 0;
    for (let px = 0; px < size; px++) {
      let a = 0, f = 0;
      for (let sy = 0; sy < ss; sy++) for (let sx = 0; sx < ss; sx++) {
        const x = ((px + (sx + 0.5) / ss) / size) * 64, y = ((py + (sy + 0.5) / ss) / size) * 64;
        if (inBg(x, y)) { a++; if (inP(x, y)) f++; }
      }
      const n = ss * ss, t = a ? f / a : 0, o = py * (size * 4 + 1) + 1 + px * 4;
      for (let c = 0; c < 3; c++) raw[o + c] = Math.round(INK[c] + (PAPER[c] - INK[c]) * t);
      raw[o + 3] = Math.round((a / n) * 255);
    }
  }
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td)); return Buffer.concat([len, td, cr]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
function ico(p) {
  const h = Buffer.alloc(22);
  h.writeUInt16LE(0, 0); h.writeUInt16LE(1, 2); h.writeUInt16LE(1, 4);
  h[6] = 32; h[7] = 32; h[8] = 0; h[9] = 0; h.writeUInt16LE(1, 10); h.writeUInt16LE(32, 12);
  h.writeUInt32LE(p.length, 14); h.writeUInt32LE(22, 18);
  return Buffer.concat([h, p]);
}
fs.mkdirSync(path.join(root, 'assets/brand'), { recursive: true });
fs.writeFileSync(path.join(root, 'favicon.ico'), ico(png(32)));
fs.writeFileSync(path.join(root, 'assets/brand/apple-touch-icon.png'), png(180));
fs.writeFileSync(path.join(root, 'assets/brand/icon-512.png'), png(512));
console.log('Icônes générées : favicon.ico, assets/brand/apple-touch-icon.png, assets/brand/icon-512.png');
