import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
  console.log('Adding GetYourGuide style columns to tours table...');

  await sql`
    ALTER TABLE tours 
    ADD COLUMN IF NOT EXISTS price VARCHAR(50) DEFAULT 'Rp 450.000',
    ADD COLUMN IF NOT EXISTS price_unit VARCHAR(50) DEFAULT '/ mobil',
    ADD COLUMN IF NOT EXISTS duration VARCHAR(50) DEFAULT '10-12 Jam',
    ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 4.9,
    ADD COLUMN IF NOT EXISTS reviews_count INT DEFAULT 85,
    ADD COLUMN IF NOT EXISTS badge VARCHAR(50) DEFAULT 'Paling Populer',
    ADD COLUMN IF NOT EXISTS location VARCHAR(100) DEFAULT 'Yogyakarta';
  `;

  // Set nice specific values for existing tours
  await sql`
    UPDATE tours SET 
      price = 'Rp 500.000',
      duration = '10-12 Jam',
      badge = 'Bestseller ⭐',
      location = 'Magelang & Jogja'
    WHERE slug LIKE '%borobudur%';
  `;

  await sql`
    UPDATE tours SET 
      price = 'Rp 450.000',
      duration = '8-10 Jam',
      badge = 'Wisata Budaya',
      location = 'Sleman & Jogja'
    WHERE slug LIKE '%prambanan%';
  `;

  await sql`
    UPDATE tours SET 
      price = 'Rp 450.000',
      duration = '10 Jam',
      badge = 'Petualangan Seru 🌋',
      location = 'Lereng Merapi'
    WHERE slug LIKE '%merapi%';
  `;

  await sql`
    UPDATE tours SET 
      price = 'Rp 400.000',
      duration = '8 Jam',
      badge = 'Heritage Jogja',
      location = 'Kota Yogyakarta'
    WHERE slug LIKE '%kraton%' OR slug LIKE '%tamansari%' OR slug LIKE '%kotagede%';
  `;

  console.log('✔ Columns added and existing tours updated successfully!');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

