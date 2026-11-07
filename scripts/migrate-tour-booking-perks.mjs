import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set!');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function main() {
  console.log('Adding booking_perks to tours table...');
  await sql`
    ALTER TABLE tours 
    ADD COLUMN IF NOT EXISTS booking_perks TEXT;
  `;
  console.log('Migration successful: booking_perks added to tours table!');
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

