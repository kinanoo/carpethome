// Image optimization script - runs during CI/CD build
// Uses ES module syntax (import) because package.json has "type": "module"
// Compresses JPG/PNG images in the public folder using sharp

import sharp from 'sharp';
import { readdir, stat, rename } from 'fs/promises';
import { existsSync, renameSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');

async function optimizeImages() {
  const files = await readdir(PUBLIC_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  console.log('Found ' + imageFiles.length + ' image(s) to process...');

  for (const file of imageFiles) {
    const inputPath = join(PUBLIC_DIR, file);
    const ext = extname(file).toLowerCase();
    const tmpPath = inputPath + '.tmp';

    try {
      const stats = await stat(inputPath);
      const sizeBefore = (stats.size / 1024).toFixed(1);

      if (ext === '.jpg' || ext === '.jpeg') {
        await sharp(inputPath)
          .jpeg({ quality: 75, progressive: true })
          .toFile(tmpPath);
      } else if (ext === '.png') {
        await sharp(inputPath)
          .png({ compressionLevel: 9, quality: 80 })
          .toFile(tmpPath);
      } else {
        continue;
      }

      const statsAfter = await stat(tmpPath);
      const sizeAfter = (statsAfter.size / 1024).toFixed(1);
      renameSync(tmpPath, inputPath);
      console.log(file + ': ' + sizeBefore + 'KB -> ' + sizeAfter + 'KB (saved ' + (sizeBefore - sizeAfter).toFixed(1) + 'KB)');
    } catch (err) {
      console.error('Error processing ' + file + ':', err.message);
      if (existsSync(tmpPath)) renameSync(tmpPath, inputPath);
    }
  }

  console.log('Image optimization complete!');
}

optimizeImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
