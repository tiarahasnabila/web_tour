import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
  console.log('Adding detail columns to tours table...');

  await sql`
    ALTER TABLE tours
    ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS included JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS excluded JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
  `;

  console.log('✔ Columns added. Updating sample tours with rich itinerary, gallery, included, and highlights...');

  const defaultIncluded = [
    'Mobil Ber-AC Prima (Avanza / Innova sesuai jumlah peserta)',
    'Driver Ramah & Berpengalaman merangkap pemandu lokal',
    'Bahan Bakar Minyak (BBM) selama tour',
    'Antar-Jemput di Hotel, Stasiun, atau Bandara Yogyakarta',
    'Air mineral dingin selama perjalanan',
    'Biaya parkir di seluruh destinasi'
  ];

  const defaultExcluded = [
    'Tiket masuk objek wisata (bisa diaturkan all-in sesuai request)',
    'Pengeluaran pribadi & makan siang/malam',
    'Tipping untuk driver (sukarela)'
  ];

  // Borobudur
  await sql`
    UPDATE tours SET
      highlights = ${JSON.stringify([
        'Menyaksikan kemegahan Candi Borobudur sebagai warisan mahakarya dunia UNESCO',
        'Spot foto instagramable dengan view stupa dan latar perbukitan Menoreh',
        'Eksplorasi candi didampingi pemandu lokal berlisensi (opsional)',
        'Perjalanan santai dan privat tanpa terburu-buru atau digabung orang lain'
      ])},
      itinerary = ${JSON.stringify([
        { time: '07:30 - 08:30', title: 'Penjemputan di Hotel / Stasiun', desc: 'Driver kami akan menjemput Anda tepat waktu di lobi hotel atau titik pertemuan di area Yogyakarta.' },
        { time: '08:30 - 09:45', title: 'Perjalanan Menuju Candi Borobudur', desc: 'Menikmati pemandangan pedesaan dan perbukitan Jawa Tengah dalam kendaraan ber-AC yang nyaman.' },
        { time: '09:45 - 12:30', title: 'Eksplorasi Kompleks Candi Borobudur', desc: 'Mengagumi relief candi yang megah, berfoto di pelataran stupa utama, dan menyerap energi sejarahnya.' },
        { time: '12:30 - 14:00', title: 'Istirahat & Makan Siang Kuliner Lokal', desc: 'Mencicipi kuliner khas seperti Mangut Beong atau masakan Jawa autentik di resto rekomendasi driver.' },
        { time: '14:00 - 16:00', title: 'Kunjungan Candi Mendut & Pawon', desc: 'Melihat dua candi purba yang segaris lurus dengan Borobudur dan menikmati suasana tenang di vihara.' },
        { time: '16:00 - 17:30', title: 'Perjalanan Kembali & Pengantaran', desc: 'Diantar kembali ke hotel, stasiun, atau pusat oleh-oleh khas Jogja (Bakpia Pathok) dengan aman.' }
      ])},
      included = ${JSON.stringify(defaultIncluded)},
      excluded = ${JSON.stringify(defaultExcluded)},
      gallery = ${JSON.stringify([
        'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'
      ])}
    WHERE slug ILIKE '%borobudur%';
  `;

  // Prambanan
  await sql`
    UPDATE tours SET
      highlights = ${JSON.stringify([
        'Mengagumi candi Hindu tertinggi dan terindah di Indonesia',
        'Relief kisah epik Ramayana terpahat memukau di dinding candi Siwa',
        'Menikmati suasana sore nan magis dengan latar siluet candi yang menjulang',
        'Bisa mampir ke Candi Sewu & Candi Plaosan kembar yang syahdu'
      ])},
      itinerary = ${JSON.stringify([
        { time: '13:00 - 13:45', title: 'Penjemputan Peserta di Hotel', desc: 'Penjemputan fleksibel di akomodasi Anda di Yogyakarta dengan mobil privat ber-AC.' },
        { time: '13:45 - 14:30', title: 'Menuju Kawasan Prambanan', desc: 'Perjalanan santai menuju perbatasan Yogyakarta - Klaten.' },
        { time: '14:30 - 17:00', title: 'Eksplorasi Candi Prambanan & Candi Sewu', desc: 'Menjelajahi candi utama Siwa, Brahma, Wisnu, serta naik shuttle mini bus menuju kompleks Candi Sewu.' },
        { time: '17:00 - 18:00', title: 'Sunset di Candi Plaosan / Spot Sunset', desc: 'Menikmati matahari terbenam dengan siluet candi kembar yang sangat fotogenik.' },
        { time: '18:00 - 19:30', title: 'Makan Malam & Pengantaran Kembali', desc: 'Mencicipi kuliner khas atau langsung diantar kembali ke hotel/stasiun.' }
      ])},
      included = ${JSON.stringify(defaultIncluded)},
      excluded = ${JSON.stringify(defaultExcluded)},
      gallery = ${JSON.stringify([
        'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1609137144822-42b781fa8fa1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80'
      ])}
    WHERE slug ILIKE '%prambanan%';
  `;

  // Kraton
  await sql`
    UPDATE tours SET
      highlights = ${JSON.stringify([
        'Eksplorasi istana hidup Kesultanan Ngayogyakarta Hadiningrat yang agung',
        'Menyaksikan benda pusaka, gamelan keraton, dan pertunjukan tarian/wayang tradisional',
        'Mengunjungi keunikan arsitektur pemandian permaisuri di Taman Sari Water Castle',
        'Belanja batik dan cinderamata legendaris di sepanjang Jalan Malioboro'
      ])},
      itinerary = ${JSON.stringify([
        { time: '08:30 - 09:00', title: 'Penjemputan di Hotel', desc: 'Driver kami menyapa Anda dan bersiap memulai city tour budaya Yogyakarta.' },
        { time: '09:00 - 11:30', title: 'Kunjungan Keraton Yogyakarta', desc: 'Menjelajahi bangsal-bangsal keraton, melihat koleksi pusaka, dan mengenal sejarah Sri Sultan.' },
        { time: '11:30 - 13:00', title: 'Taman Sari & Sumur Gumuling', desc: 'Menjelajahi lorong bawah tanah misterius, masjid bawah tanah, dan kolam pemandian bersejarah.' },
        { time: '13:00 - 14:30', title: 'Makan Siang Gudeg Legendaris', desc: 'Menikmati kuliner khas Yogyakarta (Gudeg Yu Djum / Sentra Gudeg Wijilan).' },
        { time: '14:30 - 16:30', title: 'Belanja Malioboro & Sentra Bakpia', desc: 'Berburu oleh-oleh khas Jogja langsung dari pabriknya yang masih hangat.' },
        { time: '16:30 - 17:00', title: 'Pengantaran Kembali ke Hotel / Stasiun', desc: 'Tour selesai dengan kenangan indah kota budaya.' }
      ])},
      included = ${JSON.stringify(defaultIncluded)},
      excluded = ${JSON.stringify(defaultExcluded)},
      gallery = ${JSON.stringify([
        'https://images.unsplash.com/photo-1627881729605-7763fcaec6fb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80'
      ])}
    WHERE slug ILIKE '%kraton%' OR slug ILIKE '%city%';
  `;

  console.log('✔ Tour detail fields migrated and seeded successfully!');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

