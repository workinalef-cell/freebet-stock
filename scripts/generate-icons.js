const fs = require('fs');
const path = require('path');

// Tentar carregar sharp, mas falhar silenciosamente se não estiver disponível
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log('Sharp não está disponível. Os ícones existentes serão mantidos.');
  process.exit(0);
}

const SOURCE_SVG = path.join(__dirname, '../public/icons/icon.svg');
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Certifique-se de que o diretório de saída existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateIcons() {
  try {
    // Converter SVG para PNG
    for (const size of SIZES) {
      const outputFile = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
      
      // Usar sharp para converter o SVG para PNG com o tamanho especificado
      await sharp(SOURCE_SVG)
        .resize(size, size)
        .png()
        .toFile(outputFile);
        
      console.log(`Gerado: ${outputFile}`);
    }
    
    console.log('Todos os ícones foram gerados com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar ícones:', error);
  }
}

generateIcons();
