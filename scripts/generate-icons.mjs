import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'src-tauri', 'icons');

// Create a simple microphone icon as SVG
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="96" fill="#7c3aed"/>
  <path d="M256 112c-35.3 0-64 28.7-64 64v96c0 35.3 28.7 64 64 64s64-28.7 64-64v-96c0-35.3-28.7-64-64-64z" fill="white"/>
  <path d="M352 256v16c0 53-43 96-96 96s-96-43-96-96v-16h-32v16c0 64.5 48.4 118.2 112 126.4V432h-48v32h128v-32h-48v-33.6c63.6-8.2 112-61.9 112-126.4v-16h-32z" fill="white"/>
</svg>
`;

// ICO file format helper
function createIco(pngBuffers) {
  // ICO header: 6 bytes
  // Entry: 16 bytes each
  // Image data follows
  
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  const entriesSize = numImages * entrySize;
  
  let offset = headerSize + entriesSize;
  const entries = [];
  
  for (const { buffer, size } of pngBuffers) {
    entries.push({
      width: size === 256 ? 0 : size, // 0 means 256
      height: size === 256 ? 0 : size,
      colorCount: 0,
      reserved: 0,
      planes: 1,
      bitCount: 32,
      bytesInRes: buffer.length,
      imageOffset: offset
    });
    offset += buffer.length;
  }
  
  // Calculate total size
  const totalSize = offset;
  const icoBuffer = Buffer.alloc(totalSize);
  
  // Write header
  icoBuffer.writeUInt16LE(0, 0); // Reserved
  icoBuffer.writeUInt16LE(1, 2); // Type: 1 = ICO
  icoBuffer.writeUInt16LE(numImages, 4); // Number of images
  
  // Write entries
  let entryOffset = headerSize;
  for (const entry of entries) {
    icoBuffer.writeUInt8(entry.width, entryOffset);
    icoBuffer.writeUInt8(entry.height, entryOffset + 1);
    icoBuffer.writeUInt8(entry.colorCount, entryOffset + 2);
    icoBuffer.writeUInt8(entry.reserved, entryOffset + 3);
    icoBuffer.writeUInt16LE(entry.planes, entryOffset + 4);
    icoBuffer.writeUInt16LE(entry.bitCount, entryOffset + 6);
    icoBuffer.writeUInt32LE(entry.bytesInRes, entryOffset + 8);
    icoBuffer.writeUInt32LE(entry.imageOffset, entryOffset + 12);
    entryOffset += entrySize;
  }
  
  // Write image data
  let dataOffset = headerSize + entriesSize;
  for (const { buffer } of pngBuffers) {
    buffer.copy(icoBuffer, dataOffset);
    dataOffset += buffer.length;
  }
  
  return icoBuffer;
}

async function generateIcons() {
  await mkdir(iconsDir, { recursive: true });
  
  const svgBuffer = Buffer.from(svgIcon);
  
  // Generate PNGs at various sizes
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const png128 = await sharp(svgBuffer).resize(128, 128).png().toBuffer();
  const png256 = await sharp(svgBuffer).resize(256, 256).png().toBuffer();
  
  // Write PNG files
  await writeFile(join(iconsDir, '32x32.png'), png32);
  await writeFile(join(iconsDir, '128x128.png'), png128);
  await writeFile(join(iconsDir, '128x128@2x.png'), png256);
  await writeFile(join(iconsDir, 'icon.png'), png128);
  
  // Create proper ICO file with multiple sizes
  const icoBuffer = createIco([
    { buffer: png256, size: 256 },
    { buffer: png128, size: 128 },
    { buffer: png32, size: 32 }
  ]);
  await writeFile(join(iconsDir, 'icon.ico'), icoBuffer);
  
  // For macOS, just use PNG (proper ICNS would need a different tool)
  await writeFile(join(iconsDir, 'icon.icns'), png256);
  
  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
