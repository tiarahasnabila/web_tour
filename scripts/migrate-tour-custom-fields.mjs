import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set!');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function main() {
  console.log('Migrating tours table with custom detail fields...');
  
  await sql`
    ALTER TABLE tours 
    ADD COLUMN IF NOT EXISTS price_note TEXT DEFAULT 'Harga per mobil (kapasitas 1-6 orang). Termasuk mobil ber-AC, driver ramah, & BBM.',
    ADD COLUMN IF NOT EXISTS important_info TEXT DEFAULT 'Pakaian yang nyaman dan menyerap keringat, kacamata hitam, topi/payung, kamera atau smartphone terisi penuh, serta uang tunai secukupnya untuk keperluan pribadi di lokasi wisata.',
    ADD COLUMN IF NOT EXISTS pickup_location TEXT DEFAULT 'Hotel, Stasiun Tugu/Lempuyangan, Bandara';
  `;

  console.log('Migration successful: price_note, important_info, pickup_location added to tours table!');
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

