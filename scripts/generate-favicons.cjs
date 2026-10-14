const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background rounded rectangle
  const radius = size * 0.22;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  
  // Vibrant royal blue gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#2563eb');
  grad.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = grad;
  ctx.fill();

  // Crisp Open Book Pages (White)
  ctx.fillStyle = '#ffffff';
  // Left page
  ctx.beginPath();
  ctx.moveTo(size * 0.22, size * 0.68);
  ctx.bezierCurveTo(size * 0.32, size * 0.64, size * 0.42, size * 0.64, size * 0.49, size * 0.67);
  ctx.lineTo(size * 0.49, size * 0.36);
  ctx.bezierCurveTo(size * 0.42, size * 0.33, size * 0.32, size * 0.33, size * 0.22, size * 0.36);
  ctx.closePath();
  ctx.fill();

  // Right page
  ctx.beginPath();
  ctx.moveTo(size * 0.51, size * 0.67);
  ctx.bezierCurveTo(size * 0.58, size * 0.64, size * 0.68, size * 0.64, size * 0.78, size * 0.68);
  ctx.lineTo(size * 0.78, size * 0.36);
  ctx.bezierCurveTo(size * 0.68, size * 0.33, size * 0.58, size * 0.33, size * 0.51, size * 0.36);
  ctx.closePath();
  ctx.fill();

  // Lightning Bolt Accent (Golden Yellow)
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = Math.max(1, size * 0.03);
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(size * 0.55, size * 0.18);
  ctx.lineTo(size * 0.36, size * 0.48);
  ctx.lineTo(size * 0.50, size * 0.48);
  ctx.lineTo(size * 0.45, size * 0.76);
  ctx.lineTo(size * 0.68, size * 0.42);
  ctx.lineTo(size * 0.52, size * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

// Generate PNG buffers
const buf16 = drawIcon(16);
const buf32 = drawIcon(32);
const buf48 = drawIcon(48);
const buf180 = drawIcon(180);

const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), buf16);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), buf32);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), buf180);

// Pack 16, 32, and 48 into valid .ico binary
function createIco(images) {
  // Header: 6 bytes (reserved 0, type 1, count N)
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(count, 4); // Number of images

  let offset = 6 + count * 16;
  const entries = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Image size in bytes
    entry.writeUInt32LE(offset, 12); // File offset

    entries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images.map(i => i.buffer)]);
}

const icoBuffer = createIco([
  { width: 16, height: 16, buffer: buf16 },
  { width: 32, height: 32, buffer: buf32 },
  { width: 48, height: 48, buffer: buf48 },
]);

fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
console.log('✓ Successfully generated real binary favicon.ico, favicon-32x32.png, favicon-16x16.png, and apple-touch-icon.png!');
