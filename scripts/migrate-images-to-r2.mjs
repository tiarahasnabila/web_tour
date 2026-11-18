import { neon } from '@neondatabase/serverless';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

// Baca file .env manual
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/(^"|"$)/g, '');
    env[key] = val;
  }
});

const databaseUrl = process.env.DATABASE_URL || env.DATABASE_URL;
const accountId = process.env.R2_ACCOUNT_ID || env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID || env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || env.R2_BUCKET_NAME;
const publicUrl = (process.env.R2_PUBLIC_URL || env.R2_PUBLIC_URL || '').replace(/\/+$/, '');

if (!databaseUrl) {
  console.error('DATABASE_URL is missing in .env');
  process.exit(1);
}

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
  console.error('Cloudflare R2 credentials are incomplete in .env');
  process.exit(1);
}

const sql = neon(databaseUrl);
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

async function uploadBase64(base64String, fileName, folder = 'gallery') {
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }
  const contentType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const cleanName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 30) || 'img';
  const key = `${folder}/${Date.now()}-${cleanName}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `${publicUrl}/${key}`;
}

async function run() {
  console.log('🚀 Memulai migrasi foto Base64 dari Neon ke Cloudflare R2...\n');

  // 1. Migrasi Galeri
  console.log('--- 1. Memeriksa tabel `gallery` ---');
  const galleryRows = await sql`SELECT id, title, image_url FROM gallery WHERE image_url LIKE 'data:image/%';`;
  console.log(`Ditemukan ${galleryRows.length} foto Base64 di tabel gallery.`);

  let galleryCount = 0;
  for (const item of galleryRows) {
    try {
      process.stdout.write(`Mengunggah foto [${item.id}] ${item.title}... `);
      const newUrl = await uploadBase64(item.image_url, item.title || `gallery-${item.id}`, 'gallery');
      if (newUrl) {
        await sql`UPDATE gallery SET image_url = ${newUrl} WHERE id = ${item.id};`;
        console.log(`✅ Sukses -> ${newUrl}`);
        galleryCount++;
      } else {
        console.log(`⚠️ Format Base64 tidak valid, dilewati.`);
      }
    } catch (err) {
      console.log(`❌ Gagal:`, err.message);
    }
  }

  // 2. Migrasi Tours
  console.log('\n--- 2. Memeriksa tabel `tours` ---');
  const tourRows = await sql`SELECT id, title, slug, thumbnail, gallery FROM tours;`;
  let tourCount = 0;

  for (const tour of tourRows) {
    let updated = false;
    let newThumbnail = tour.thumbnail;
    let newGallery = tour.gallery;

    // Cek thumbnail
    if (tour.thumbnail && tour.thumbnail.startsWith('data:image/')) {
      process.stdout.write(`Mengunggah thumbnail tour [${tour.title}]... `);
      const url = await uploadBase64(tour.thumbnail, `${tour.slug}-thumb`, 'tours');
      if (url) {
        newThumbnail = url;
        updated = true;
        console.log(`✅`);
      }
    }

    // Cek gallery array
    if (Array.isArray(tour.gallery)) {
      const updatedGallery = [];
      for (let i = 0; i < tour.gallery.length; i++) {
        const img = tour.gallery[i];
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          process.stdout.write(`Mengunggah foto galeri tour [${tour.title}] #${i + 1}... `);
          const url = await uploadBase64(img, `${tour.slug}-gallery-${i + 1}`, 'tours');
          if (url) {
            updatedGallery.push(url);
            updated = true;
            console.log(`✅`);
          } else {
            updatedGallery.push(img);
          }
        } else {
          updatedGallery.push(img);
        }
      }
      newGallery = updatedGallery;
    }

    if (updated) {
      await sql`
        UPDATE tours 
        SET thumbnail = ${newThumbnail}, gallery = ${JSON.stringify(newGallery)}
        WHERE id = ${tour.id};
      `;
      tourCount++;
    }
  }

  console.log(`\n🎉 Migrasi selesai!`);
  console.log(`- Foto galeri yang dipindahkan ke Cloudflare R2: ${galleryCount}`);
  console.log(`- Paket tour yang dibersihkan fotonya: ${tourCount}`);
  console.log(`Database Neon Anda sekarang bebas dari beban Base64 dan kuota transfernya aman!\n`);
}

run().catch(err => {
  console.error('Error saat migrasi:', err);
  process.exit(1);
});
