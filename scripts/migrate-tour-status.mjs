import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
if (!match) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}
const dbUrl = match[1];
const sql = neon(dbUrl);

async function run() {
  console.log('Adding is_active column to tours table...');
  await sql`
    ALTER TABLE tours
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
  `;
  // Ensure existing tours are set to true if null
  await sql`UPDATE tours SET is_active = true WHERE is_active IS NULL;`;
  console.log('✔ Column is_active added and initialized successfully!');
}

run().catch(console.error);

