import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
  console.log('Connecting to Neon to create cars & blogs tables...');

  // 1. Table cars
  await sql`
    CREATE TABLE IF NOT EXISTS cars (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      thumbnail TEXT NOT NULL,
      features JSONB NOT NULL DEFAULT '[]',
      whatsapp_message TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✔ Table "cars" ready');

  // 2. Table blogs
  await sql`
    CREATE TABLE IF NOT EXISTS blogs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      thumbnail TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✔ Table "blogs" ready');

  // 3. Migrate cars
  const carsDir = path.resolve('src/content/cars');
  if (fs.existsSync(carsDir)) {
    const files = fs.readdirSync(carsDir).filter(f => f.endsWith('.md'));
    for (const f of files) {
      const fullPath = path.join(carsDir, f);
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (match) {
        const fm = match[1];
        const content = match[2].trim();

        const title = (fm.match(/title:\s*["']?(.*?)["']?$/m) || [])[1] || f.replace('.md', '');
        const slug = (fm.match(/slug:\s*["']?(.*?)["']?$/m) || [])[1] || f.replace('.md', '');
        const thumbnail = (fm.match(/thumbnail:\s*["']?(.*?)["']?$/m) || [])[1] || '';
        const whatsapp_message = (fm.match(/whatsappMessage:\s*["']?(.*?)["']?$/m) || [])[1] || `Halo, saya ingin Booking ${title}`;
        
        // Parse features array
        let features = ["Mobil Prima", "BBM", "Driver", "Air Mineral"];
        const featMatch = fm.match(/features:\s*(\[.*?\])/s);
        if (featMatch) {
          try {
            features = JSON.parse(featMatch[1]);
          } catch {
            // fallback if not strict JSON
            features = featMatch[1].replace(/[\[\]"']/g, '').split(',').map(s => s.trim()).filter(Boolean);
          }
        }

        const existing = await sql`SELECT id FROM cars WHERE slug = ${slug.toLowerCase()} LIMIT 1;`;
        if (existing.length === 0) {
          await sql`
            INSERT INTO cars (title, slug, thumbnail, features, whatsapp_message, content)
            VALUES (${title}, ${slug.toLowerCase()}, ${thumbnail}, ${JSON.stringify(features)}, ${whatsapp_message}, ${content});
          `;
          console.log(`  + Migrated car: ${title} (${slug})`);
        } else {
          console.log(`  = Car already exists: ${slug}`);
        }
      }
    }
  }

  // 4. Migrate blogs
  const blogsDir = path.resolve('src/content/blog');
  if (fs.existsSync(blogsDir)) {
    const files = fs.readdirSync(blogsDir).filter(f => f.endsWith('.md'));
    for (const f of files) {
      const fullPath = path.join(blogsDir, f);
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (match) {
        const fm = match[1];
        const content = match[2].trim();

        const title = (fm.match(/title:\s*["']?(.*?)["']?$/m) || [])[1] || f.replace('.md', '');
        const slug = (fm.match(/slug:\s*["']?(.*?)["']?$/m) || [])[1] || f.replace('.md', '');
        const thumbnail = (fm.match(/thumbnail:\s*["']?(.*?)["']?$/m) || [])[1] || '';
        const excerpt = (fm.match(/excerpt:\s*["']?(.*?)["']?$/m) || [])[1] || '';
        const publishDate = (fm.match(/publishDate:\s*(.*)$/m) || [])[1] || '2026-08-30';

        const existing = await sql`SELECT id FROM blogs WHERE slug = ${slug.toLowerCase()} LIMIT 1;`;
        if (existing.length === 0) {
          await sql`
            INSERT INTO blogs (title, slug, thumbnail, excerpt, content, publish_date)
            VALUES (${title}, ${slug.toLowerCase()}, ${thumbnail}, ${excerpt}, ${content}, ${publishDate});
          `;
          console.log(`  + Migrated blog: ${title} (${slug})`);
        } else {
          console.log(`  = Blog already exists: ${slug}`);
        }
      }
    }
  }

  console.log('Done migrating all data to Neon!');
}

run().catch(console.error);

