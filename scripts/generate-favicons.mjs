import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function main() {
  const logoPath = path.resolve('public/logo.png');
  const logoBuffer = fs.readFileSync(logoPath);

  // Read dimensions of original logo
  const meta = await sharp(logoBuffer).metadata();
  console.log('Original logo:', meta.width, 'x', meta.height);

  // We want a square favicon (e.g. 256x256) where the logo is cleanly contained in the center
  // with a subtle crisp rounded or circular clean background so it's gorgeous on both dark & light browser tabs
  const size = 256;
  
  // Resize logo keeping aspect ratio, max width 220, max height 220
  const resizedLogo = await sharp(logoBuffer)
    .resize(220, 220, {
      fit: 'inside',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  const resizedMeta = await sharp(resizedLogo).metadata();

  // Create a 256x256 square canvas with rounded white/cream circle or transparent
  // A white circular background with subtle shadow or clean circle makes it pop on dark tabs
  const circleSvg = Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 4}" fill="#ffffff" stroke="#e2e8f0" stroke-width="4" />
    </svg>
  `);

  const squareFavicon256 = await sharp(circleSvg)
    .composite([
      {
        input: resizedLogo,
        top: Math.round((size - (resizedMeta.height || 0)) / 2),
        left: Math.round((size - (resizedMeta.width || 0)) / 2),
      }
    ])
    .png()
    .toBuffer();

  // Save 32x32 for standard favicon.ico
  const favicon32 = await sharp(squareFavicon256).resize(32, 32).png().toBuffer();
  // Save 48x48
  const favicon48 = await sharp(squareFavicon256).resize(48, 48).png().toBuffer();
  // Save 180x180 for apple-touch-icon
  const appleTouchIcon = await sharp(squareFavicon256).resize(180, 180).png().toBuffer();
  fs.writeFileSync('public/apple-touch-icon.png', appleTouchIcon);
  fs.writeFileSync('public/favicon-32x32.png', favicon32);
  fs.writeFileSync('public/favicon-48x48.png', favicon48);

  // Create a valid multi-size or 32x32 Windows ICO file
  // ICO format:
  // Header: 6 bytes
  // Entry: 16 bytes
  // Image data: PNG buffer
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // icon type
  icoHeader.writeUInt16LE(1, 4); // 1 image

  const icoEntry = Buffer.alloc(16);
  icoEntry.writeUInt8(32, 0); // width 32
  icoEntry.writeUInt8(32, 1); // height 32
  icoEntry.writeUInt8(0, 2);  // color palette 0
  icoEntry.writeUInt8(0, 3);  // reserved
  icoEntry.writeUInt16LE(1, 4); // color planes
  icoEntry.writeUInt16LE(32, 6); // bits per pixel
  icoEntry.writeUInt32LE(favicon32.length, 8); // size
  icoEntry.writeUInt32LE(22, 12); // offset (6 + 16 = 22)

  const icoBuffer = Buffer.concat([icoHeader, icoEntry, favicon32]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  console.log('Generated public/favicon.ico successfully');

  // Also create a high-quality SVG favicon (public/favicon.svg)
  const base64Png = squareFavicon256.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.1" />
    </filter>
  </defs>
  <circle cx="128" cy="128" r="124" fill="#ffffff" stroke="#e2e8f0" stroke-width="4" filter="url(#shadow)" />
  <image href="data:image/png;base64,${base64Png}" x="0" y="0" width="256" height="256" />
</svg>
`;
  fs.writeFileSync('public/favicon.svg', svgContent, 'utf8');
  console.log('Generated public/favicon.svg successfully');
}

main().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});

