import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Jalankan dengan: node --env-file=.env scripts/init-db.mjs
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL belum diset. Jalankan: node --env-file=.env scripts/init-db.mjs');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function init() {
  console.log('Connecting to Neon and setting up tables...');

  // 1. Create admins table
  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✔ Table "admins" ready');

  // 2. Create tours table
  await sql`
    CREATE TABLE IF NOT EXISTS tours (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      thumbnail TEXT NOT NULL,
      tagline TEXT NOT NULL,
      whatsapp_message TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✔ Table "tours" ready');

  // 3. Create default admin if not exists
  const existingAdmins = await sql`SELECT id FROM admins WHERE username = 'admin' LIMIT 1;`;
  if (existingAdmins.length === 0) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    await sql`
      INSERT INTO admins (username, password_hash)
      VALUES ('admin', ${passwordHash});
    `;
    console.log('✔ Default admin account created: username "admin", password "admin123"');
  } else {
    console.log('ℹ Admin user "admin" already exists');
  }

  // 4. Migrate existing markdown tours
  const toursDir = path.resolve('src/content/tours');
  if (fs.existsSync(toursDir)) {
    const files = fs.readdirSync(toursDir).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} markdown tours to migrate...`);

    for (const file of files) {
      const fullPath = path.join(toursDir, file);
      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      
      // Parse frontmatter
      const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (match) {
        const frontmatter = match[1];
        const content = match[2].trim();

        const titleMatch = frontmatter.match(/title:\s*["']?(.*?)["']?$/m);
        const slugMatch = frontmatter.match(/slug:\s*["']?(.*?)["']?$/m);
        const thumbnailMatch = frontmatter.match(/thumbnail:\s*["']?(.*?)["']?$/m);
        const taglineMatch = frontmatter.match(/tagline:\s*["']?(.*?)["']?$/m);
        const whatsappMatch = frontmatter.match(/whatsappMessage:\s*["']?(.*?)["']?$/m);

        const slug = (slugMatch && slugMatch[1]) || file.replace('.md', '');
        const title = (titleMatch && titleMatch[1]) || slug;
        const thumbnail = (thumbnailMatch && thumbnailMatch[1]) || '';
        const tagline = (taglineMatch && taglineMatch[1]) || '';
        const whatsappMessage = (whatsappMatch && whatsappMatch[1]) || `Halo, saya tertarik dengan ${title}`;

        const existing = await sql`SELECT id FROM tours WHERE slug = ${slug} LIMIT 1;`;
        if (existing.length === 0) {
          await sql`
            INSERT INTO tours (title, slug, thumbnail, tagline, whatsapp_message, content)
            VALUES (${title}, ${slug}, ${thumbnail}, ${tagline}, ${whatsappMessage}, ${content});
          `;
          console.log(`  + Migrated: ${title} (${slug})`);
        } else {
          console.log(`  = Already exists: ${slug}`);
        }
      }
    }
  }

  console.log('\nAll done! Database initialization and migration complete.');
}

init().catch((err) => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

