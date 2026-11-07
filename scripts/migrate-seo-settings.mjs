import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
  console.log('Adding SEO and Analytics columns to site_settings table...');

  await sql`
    ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS google_analytics_id VARCHAR(50) DEFAULT '',
    ADD COLUMN IF NOT EXISTS google_site_verification VARCHAR(100) DEFAULT '',
    ADD COLUMN IF NOT EXISTS canonical_site_url VARCHAR(150) DEFAULT 'https://beyondjogjatours.com';
  `;

  console.log('✔ site_settings columns updated successfully!');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

