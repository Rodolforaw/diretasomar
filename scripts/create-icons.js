const fs = require('fs');
const path = require('path');

// Função para criar um PNG básico (apenas para teste)
function createBasicPNG(width, height, filename) {
  // Criar um PNG básico com fundo vermelho e logo branco
  const canvas = {
    width,
    height,
    data: Buffer.alloc(width * height * 4)
  };

  // Preencher com cor de fundo (#970700)
  for (let i = 0; i < canvas.data.length; i += 4) {
    canvas.data[i] = 151;     // R
    canvas.data[i + 1] = 7;   // G
    canvas.data[i + 2] = 0;   // B
    canvas.data[i + 3] = 255; // A
  }

  // Criar um quadrado branco no centro (logo)
  const logoSize = Math.min(width, height) / 3;
  const startX = Math.floor((width - logoSize) / 2);
  const startY = Math.floor((height - logoSize) / 2);

  for (let y = startY; y < startY + logoSize; y++) {
    for (let x = startX; x < startX + logoSize; x++) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const index = (y * width + x) * 4;
        canvas.data[index] = 255;     // R
        canvas.data[index + 1] = 255; // G
        canvas.data[index + 2] = 255; // B
        canvas.data[index + 3] = 255; // A
      }
    }
  }

  // Criar cabeçalho PNG básico
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52  // IHDR
  ]);

  // Adicionar dimensões (big-endian)
  const widthBuffer = Buffer.alloc(4);
  const heightBuffer = Buffer.alloc(4);
  widthBuffer.writeUInt32BE(width);
  heightBuffer.writeUInt32BE(height);

  const ihdrData = Buffer.concat([
    widthBuffer,
    heightBuffer,
    Buffer.from([0x08, 0x02, 0x00, 0x00, 0x00]) // bit depth, color type, compression, filter, interlace
  ]);

  // Calcular CRC
  const crc = require('crypto').createHash('crc32').update(ihdrData).digest();

  const ihdrChunk = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x0D]), // length
    Buffer.from([0x49, 0x48, 0x44, 0x52]), // type
    ihdrData,
    crc
  ]);

  // Para simplificar, vou criar um arquivo PNG muito básico
  // Na prática, seria melhor usar uma biblioteca como sharp ou pngjs
  
  const publicPath = path.join(__dirname, '../public');
  const filePath = path.join(publicPath, filename);
  
  // Criar um arquivo PNG básico usando uma abordagem mais simples
  const pngData = Buffer.concat([
    pngHeader,
    ihdrChunk,
    // Adicionar dados de imagem (simplificado)
    Buffer.from([0x00, 0x00, 0x00, 0x00]), // IDAT chunk (vazio para este exemplo)
    Buffer.from([0x00, 0x00, 0x00, 0x00])  // IEND chunk
  ]);

  fs.writeFileSync(filePath, pngData);
  console.log(`Ícone criado: ${filename}`);
}

// Criar os ícones
createBasicPNG(192, 192, 'icon-192.png');
createBasicPNG(512, 512, 'icon-512.png');

console.log('Ícones criados com sucesso!'); 