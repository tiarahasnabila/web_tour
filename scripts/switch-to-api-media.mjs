import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(l => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/(^"|"$)/g, '')];
    })
);

const sql = neon(env.DATABASE_URL);

async function run() {
  const oldUrl = 'https://pub-92100fe9e24c4f359fa3d4ed38114aec.r2.dev';
  const newUrl = '/api/media';

  console.log('🔄 Memperbarui URL di tabel gallery...');
  await sql`
    UPDATE gallery
    SET image_url = REPLACE(image_url, ${oldUrl}, ${newUrl})
    WHERE image_url LIKE ${oldUrl + '%'};
  `;

  console.log('🔄 Memperbarui URL di tabel tours...');
  const tRows = await sql`SELECT id, thumbnail, gallery FROM tours;`;
  for (const t of tRows) {
    let thumb = t.thumbnail ? t.thumbnail.replace(oldUrl, newUrl) : t.thumbnail;
    let gal = t.gallery;
    if (Array.isArray(gal)) {
      gal = gal.map(x => (typeof x === 'string' ? x.replace(oldUrl, newUrl) : x));
    } else if (typeof gal === 'string') {
      gal = gal.replace(new RegExp(oldUrl, 'g'), newUrl);
    }
    await sql`
      UPDATE tours
      SET thumbnail = ${thumb}, gallery = ${JSON.stringify(gal)}
      WHERE id = ${t.id};
    `;
  }

  console.log('🔄 Memperbarui URL di tabel cars...');
  await sql`
    UPDATE cars
    SET thumbnail = REPLACE(thumbnail, ${oldUrl}, ${newUrl})
    WHERE thumbnail LIKE ${oldUrl + '%'};
  `;

  console.log('✅ Semua URL berhasil diarahkan ke /api/media!');
}

run().catch(console.error);
