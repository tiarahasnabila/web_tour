import { sql } from './db';

export interface TestimonialItem {
  id: number;
  name: string;
  origin: string;
  rating: number;
  comment: string;
  trip_package: string;
  avatar: string;
  created_at: string;
}

let cachedTestimonials: { data: TestimonialItem[]; expires: number } | null = null;
const TESTIMONIALS_CACHE_TTL = 5 * 60 * 1000; // 5 menit cache

export function invalidateTestimonialsCache() {
  cachedTestimonials = null;
}

export async function getAllTestimonials(): Promise<TestimonialItem[]> {
  if (cachedTestimonials && cachedTestimonials.expires > Date.now()) {
    return cachedTestimonials.data;
  }

  try {
    const rows = await sql`SELECT * FROM testimonials ORDER BY id DESC;`;
    const result: TestimonialItem[] = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      origin: r.origin || 'Wisatawan',
      rating: Number(r.rating) || 5,
      comment: r.comment,
      trip_package: r.trip_package || '',
      avatar: r.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=0d9488&color=fff`,
      created_at: r.created_at,
    }));
    cachedTestimonials = { data: result, expires: Date.now() + TESTIMONIALS_CACHE_TTL };
    return result;
  } catch (err) {
    console.error('Error fetching testimonials from Neon:', err);
    return cachedTestimonials ? cachedTestimonials.data : [];
  }
}

