// Image optimization script - runs during CI/CD build
// Compresses JPG/PNG images in the public folder using sharp
// Also handles any new images added in the future

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

async function optimizeImages() {
  const files = fs.readdirSync(PUBLIC_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

  console.log('Found ' + imageFiles.length + ' image(s) to process...');

  for (const file of imageFiles) {
    const inputPath = path.join(PUBLIC_DIR, file);
    const ext = path.extname(file).toLowerCase();
    const tmpPath = inputPath + '.tmp';

    try {
      const stat = fs.statSync(inputPath);
      const sizeBefore = (stat.size / 1024).toFixed(1);

      if (ext === '.jpg' || ext === '.jpeg') {
        await sharp(inputPath)
          .jpeg({ quality: 75, progressive: true, mozjpeg: false })
          .toFile(tmpPath);
      } else if (ext === '.png') {
        await sharp(inputPath)
          .png({ compressionLevel: 9, quality: 80 })
          .toFile(tmpPath);
      } else {
        continue;
      }

      const sizeAfter = (fs.statSync(tmpPath).size / 1024).toFixed(1);
      fs.renameSync(tmpPath, inputPath);
      console.log(file + ': ' + sizeBefore + 'KB -> ' + sizeAfter + 'KB');
    } catch (err) {
      console.error('Error processing ' + file + ':', err.message);
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    }
  }

  console.log('Image optimization complete!');
}

optimizeImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
