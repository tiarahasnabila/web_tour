import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
  console.log('Connecting to Neon to create new feature tables...');

  // 1. Table site_settings (Fitur 1)
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INT PRIMARY KEY DEFAULT 1,
      site_title VARCHAR(150) NOT NULL DEFAULT 'Beyond Jogja Tours',
      site_description TEXT NOT NULL DEFAULT 'Layanan Rental Mobil & Paket Wisata Jogja Murah dan Terpercaya',
      phone_number VARCHAR(50) NOT NULL DEFAULT '+6285213814714',
      whatsapp_number VARCHAR(50) NOT NULL DEFAULT '6285213814714',
      email_address VARCHAR(150) NOT NULL DEFAULT 'beyondjogjajourneys@gmail.com',
      office_address TEXT NOT NULL DEFAULT 'Perumahan Samara Regency, Mertosanan Kulon, Potorono, Kec. Banguntapan, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55196',
      instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/beyondjogja.tours/',
      operating_hours VARCHAR(100) NOT NULL DEFAULT 'Setiap Hari: 07:00 – 22:00 WIB',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  // Seed default settings row if not exists
  await sql`
    INSERT INTO site_settings (id, site_title, phone_number, whatsapp_number, email_address, office_address, instagram_url)
    VALUES (1, 'Beyond Jogja Tours', '+6285213814714', '6285213814714', 'beyondjogjajourneys@gmail.com', 'Perumahan Samara Regency, Mertosanan Kulon, Potorono, Kec. Banguntapan, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55196', 'https://www.instagram.com/beyondjogja.tours/')
    ON CONFLICT (id) DO NOTHING;
  `;
  console.log('✔ Table site_settings ready');

  // 2. Table inquiries (Fitur 2: Rekap Pesan & Leads)
  await sql`
    CREATE TABLE IF NOT EXISTS inquiries (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      service VARCHAR(150),
      trip_date DATE,
      message TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'baru',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✔ Table inquiries ready');

  // 3. Table testimonials (Fitur 4: Testimoni)
  await sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      origin VARCHAR(100) DEFAULT 'Wisatawan',
      rating INT DEFAULT 5,
      comment TEXT NOT NULL,
      trip_package VARCHAR(150),
      avatar TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  // Seed 3 starter testimonials if empty
  const existingTests = await sql`SELECT count(*) as count FROM testimonials;`;
  if (Number(existingTests[0]?.count || 0) === 0) {
    await sql`
      INSERT INTO testimonials (name, origin, rating, comment, trip_package, avatar)
      VALUES 
      ('Budi Pratama', 'Jakarta', 5, 'Pelayanan sangat ramah dan mobil Avanza-nya bersih banget, AC dingin. Driver Pak Joko hafal rute alternatif jadi gak kena macet Malioboro.', 'Paket Wisata Borobudur & Merapi', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'),
      ('Siti Rahma', 'Surabaya', 5, 'Sewa Hiace buat rombongan keluarga 12 orang sangat puas! Mobil wangi, driver sabar dan bantu foto-foto di Tebing Breksi.', 'Sewa Hiace + Driver', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'),
      ('Kevin Sanjaya', 'Bandung', 5, 'Booking dadakan H-1 via WA langsung di-handle cepet. Harga jujur sesuai kesepakatan gak ada biaya aneh-aneh di akhir. Recommended banget buat trip Jogja.', 'Paket Tour Candi Prambanan', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200');
    `;
    console.log('  + Seeded 3 starter testimonials');
  }
  console.log('✔ Table testimonials ready');

  console.log('Done migrating tables for features 1, 2, 4, 5!');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

