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

export async function getAllTestimonials(): Promise<TestimonialItem[]> {
  try {
    const rows = await sql`SELECT * FROM testimonials ORDER BY id DESC;`;
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      origin: r.origin || 'Wisatawan',
      rating: Number(r.rating) || 5,
      comment: r.comment,
      trip_package: r.trip_package || '',
      avatar: r.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=0d9488&color=fff`,
      created_at: r.created_at,
    }));
  } catch (err) {
    console.error('Error fetching testimonials from Neon:', err);
    return [];
  }
}

