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
const GALLERY_CACHE_TTL = 5 * 60 * 1000; // 5 menit cache

export function invalidateGalleryCache() {
  cachedGallery = null;
}

export async function getAllGallery(): Promise<GalleryItem[]> {
  if (cachedGallery && cachedGallery.expires > Date.now()) {
    return cachedGallery.data;
  }

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

