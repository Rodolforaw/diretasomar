const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '../public/icon.svg');
  const publicPath = path.join(__dirname, '../public');

  // Ler o SVG
  const svgBuffer = fs.readFileSync(svgPath);

  // Gerar ícone 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicPath, 'icon-192.png'));

  // Gerar ícone 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicPath, 'icon-512.png'));

  console.log('Ícones gerados com sucesso!');
}

generateIcons().catch(console.error); 