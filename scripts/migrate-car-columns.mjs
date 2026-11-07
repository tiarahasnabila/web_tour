import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
  console.log('Adding pricing and specs columns to cars table...');

  await sql`
    ALTER TABLE cars 
    ADD COLUMN IF NOT EXISTS price VARCHAR(50) DEFAULT 'Rp 400.000',
    ADD COLUMN IF NOT EXISTS price_unit VARCHAR(50) DEFAULT '/ hari',
    ADD COLUMN IF NOT EXISTS capacity VARCHAR(50) DEFAULT '6-7 Orang',
    ADD COLUMN IF NOT EXISTS transmission VARCHAR(50) DEFAULT 'Manual / Matic',
    ADD COLUMN IF NOT EXISTS badge VARCHAR(50) DEFAULT 'Tersedia';
  `;

  await sql`
    UPDATE cars SET 
      price = 'Rp 400.000',
      price_unit = '/ hari',
      capacity = '6-7 Orang',
      transmission = 'Manual / Matic',
      badge = 'Favorit Keluarga ⭐'
    WHERE slug LIKE '%avanza%';
  `;

  await sql`
    UPDATE cars SET 
      price = 'Rp 550.000',
      price_unit = '/ hari',
      capacity = '7-8 Orang',
      transmission = 'Matic / Manual',
      badge = 'Paling Nyaman 👍'
    WHERE slug LIKE '%innova%';
  `;

  await sql`
    UPDATE cars SET 
      price = 'Rp 900.000',
      price_unit = '/ hari',
      capacity = '14-15 Orang',
      transmission = 'Manual',
      badge = 'Rombongan Besar 🚐'
    WHERE slug LIKE '%hiace%';
  `;

  await sql`
    UPDATE cars SET 
      price = 'Rp 1.200.000',
      price_unit = '/ hari',
      capacity = '7 Orang',
      transmission = 'Matic (Automatic)',
      badge = 'VIP & Elegan 👑'
    WHERE slug LIKE '%fortuner%';
  `;

  console.log('✔ Cars table columns added and values updated successfully!');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

