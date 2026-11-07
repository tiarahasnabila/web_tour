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
  console.log('Adding activity overview columns to tours table...');
  await sql`
    ALTER TABLE tours
    ADD COLUMN IF NOT EXISTS group_type VARCHAR(255) DEFAULT 'Hanya Anda & Rombongan',
    ADD COLUMN IF NOT EXISTS group_type_note VARCHAR(255) DEFAULT 'Tidak digabung dengan tamu lain',
    ADD COLUMN IF NOT EXISTS driver_service VARCHAR(255) DEFAULT 'Bahasa Indonesia / English',
    ADD COLUMN IF NOT EXISTS driver_service_note VARCHAR(255) DEFAULT 'Ramah, sopan, & siap ambilkan foto terbaik';
  `;
  console.log('✔ Columns added successfully!');
}

run().catch(console.error);

