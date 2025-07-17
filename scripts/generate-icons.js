const fs = require('fs');
const path = require('path');

// Função para criar um ícone SVG simples
function createIconSVG(size, text = 'DS') {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#970700"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" 
        font-weight="bold" fill="white" text-anchor="middle" dy="0.35em">${text}</text>
</svg>`;
}

// Criar ícones SVG
const icon192 = createIconSVG(192, 'DS');
const icon512 = createIconSVG(512, 'DS');

// Salvar ícones SVG
fs.writeFileSync(path.join(__dirname, '../public/icon-192.svg'), icon192);
fs.writeFileSync(path.join(__dirname, '../public/icon-512.svg'), icon512);

console.log('Ícones SVG criados com sucesso!');
console.log('Agora você pode converter para PNG usando uma ferramenta online ou local.'); 