// Jalankan dengan: node --env-file=.env scripts/migrate-profile.mjs
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL belum diset.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);`;
await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`;
console.log('✔ Kolom display_name & updated_at siap di tabel admins');

