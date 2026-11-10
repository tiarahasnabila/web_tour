import { sql } from './db';

export interface GalleryItem {
  id: number;
  title: string;
  image_url: string;
  category: string;
  is_featured: boolean;
  created_at: string;
}

let cachedGallery: { data: GalleryItem[]; expires: number } | null = null;
const GALLERY_CACHE_TTL = 30 * 1000; // 30 detik
let isTableInitialized = false;

export function invalidateGalleryCache() {
  cachedGallery = null;
}

// Inisialisasi tabel gallery di database (hanya dipanggil sekali saat server boot)
async function ensureGalleryTable() {
  if (isTableInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT DEFAULT 'Wisata',
        is_featured BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Bersihkan duplikat jika sempat ada data ganda
    await sql`
      DELETE FROM gallery a USING gallery b
      WHERE a.id > b.id AND a.title = b.title AND a.image_url = b.image_url;
    `;

    isTableInitialized = true;
  } catch (err) {
    console.error('Error ensuring gallery table:', err);
  }
}

export async function getAllGallery(): Promise<GalleryItem[]> {
  if (cachedGallery && cachedGallery.expires > Date.now()) {
    return cachedGallery.data;
  }

  await ensureGalleryTable();

  try {
    const rows = await sql`
      SELECT id, title, image_url, COALESCE(category, 'Wisata') as category, COALESCE(is_featured, true) as is_featured, created_at
      FROM gallery
      ORDER BY id DESC;
    `;
    const data = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      image_url: r.image_url,
      category: r.category,
      is_featured: r.is_featured !== false,
      created_at: r.created_at,
    }));

    cachedGallery = {
      data,
      expires: Date.now() + GALLERY_CACHE_TTL,
    };
    return data;
  } catch (err) {
    console.error('Error fetching gallery:', err);
    return cachedGallery ? cachedGallery.data : [];
  }
}

export async function getFeaturedGallery(): Promise<GalleryItem[]> {
  const all = await getAllGallery();
  return all.filter((item) => item.is_featured);
}

