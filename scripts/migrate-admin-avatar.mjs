import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
  console.log('Adding avatar_url to admins table...');

  await sql`
    ALTER TABLE admins
    ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
  `;

  console.log('✔ avatar_url column added to admins table!');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

