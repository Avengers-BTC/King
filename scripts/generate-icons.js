const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure the icons directory exists
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a basic icon (a black square with "NV" text)
const width = 512;
const height = 512;
const textColor = '#FFFFFF';
const backgroundColor = '#000000';

// Create SVG with "NV" text
const svgBuffer = Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  <text x="50%" y="50%" font-family="Arial" font-size="200" 
    text-anchor="middle" dominant-baseline="middle" fill="${textColor}">
    NV
  </text>
</svg>
`);

// Generate icons of different sizes
const sizes = [192, 256, 384, 512];

async function generateIcons() {
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    
    console.log(`Generated icon: icon-${size}x${size}.png`);
  }
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
