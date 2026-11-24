// Makes the small copies of the sample (stock) photos that listing rows and
// gallery thumbnails use. Run after adding or replacing a photo in
// public/sample-photos:
//
//   node scripts/make-sample-thumbs.mjs
//
// Each copy is the original scaled to 40% (1000px wide becomes 400px), so the
// `400w` and `1000w` descriptors in sampleSrcSet() stay in proportion even for
// portrait photos. It uses sharp, which Next.js already installs.
import { readdir } from 'node:fs/promises';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.join(process.cwd(), 'public', 'sample-photos');
const out = path.join(dir, 'small');
mkdirSync(out, { recursive: true });

for (const file of await readdir(dir)) {
  if (!file.endsWith('.jpg')) continue;
  const src = path.join(dir, file);
  const { width } = await sharp(src).metadata();
  const info = await sharp(src)
    .resize({ width: Math.round(width * 0.4) })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(path.join(out, file));
  console.log(`${file}: ${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB`);
}
