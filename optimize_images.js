import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = path.join(process.cwd(), 'public', 'category-images');

fs.readdir(dir, (err, files) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  files.forEach(file => {
    if (file.endsWith('.png') || file.endsWith('.jpg')) {
      const inputPath = path.join(dir, file);
      const ext = path.extname(file);
      const base = path.basename(file, ext);
      const outputPath = path.join(dir, `${base}.webp`);

      sharp(inputPath)
        .resize({ width: 80, height: 80, fit: 'inside' })
        .webp({ quality: 80 })
        .toFile(outputPath)
        .then(() => {
          console.log(`Converted ${file} to ${base}.webp`);
          // optionally remove old file
          // fs.unlinkSync(inputPath);
        })
        .catch(err => {
          console.error(`Error converting ${file}:`, err);
        });
    }
  });
});
