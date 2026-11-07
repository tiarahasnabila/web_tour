import { sql } from './db';
import { marked } from 'marked';

export interface CarItem {
  id: number;
  slug: string;
  data: {
    title: string;
    thumbnail: string;
    features: string[];
    whatsappMessage: string;
    price?: string;
    priceUnit?: string;
    capacity?: string;
    transmission?: string;
    badge?: string;
  };
  content: string;
  htmlContent: string;
  created_at: string;
}

export async function getAllCars(): Promise<CarItem[]> {
  try {
    const rows = await sql`
      SELECT id, title, slug, thumbnail, features, whatsapp_message, content, created_at,
             COALESCE(price, 'Rp 400.000') as price,
             COALESCE(price_unit, '/ hari') as price_unit,
             COALESCE(capacity, '6-7 Orang') as capacity,
             COALESCE(transmission, 'Manual / Matic') as transmission,
             COALESCE(badge, 'Tersedia') as badge
      FROM cars 
      ORDER BY id ASC;
    `;
    return rows.map((r: any) => {
      let features: string[] = [];
      try {
        features = typeof r.features === 'string' ? JSON.parse(r.features) : (r.features || []);
      } catch {
        features = [];
      }
      return {
        id: r.id,
        slug: r.slug,
        data: {
          title: r.title,
          thumbnail: r.thumbnail,
          features: Array.isArray(features) ? features : [],
          whatsappMessage: r.whatsapp_message,
          price: r.price,
          priceUnit: r.price_unit,
          capacity: r.capacity,
          transmission: r.transmission,
          badge: r.badge,
        },
        content: r.content,
        htmlContent: marked.parse(r.content || '') as string,
        created_at: r.created_at,
      };
    });
  } catch (err) {
    console.error('Error fetching cars from Neon:', err);
    return [];
  }
}

export async function getCarBySlug(slug: string): Promise<CarItem | null> {
  try {
    const rows = await sql`
      SELECT id, title, slug, thumbnail, features, whatsapp_message, content, created_at,
             COALESCE(price, 'Rp 400.000') as price,
             COALESCE(price_unit, '/ hari') as price_unit,
             COALESCE(capacity, '6-7 Orang') as capacity,
             COALESCE(transmission, 'Manual / Matic') as transmission,
             COALESCE(badge, 'Tersedia') as badge
      FROM cars 
      WHERE slug = ${slug.toLowerCase()} 
      LIMIT 1;
    `;
    if (rows.length === 0) return null;
    const r = rows[0];
    let features: string[] = [];
    try {
      features = typeof r.features === 'string' ? JSON.parse(r.features) : (r.features || []);
    } catch {
      features = [];
    }
    return {
      id: r.id,
      slug: r.slug,
      data: {
        title: r.title,
        thumbnail: r.thumbnail,
        features: Array.isArray(features) ? features : [],
        whatsappMessage: r.whatsapp_message,
        price: r.price,
        priceUnit: r.price_unit,
        capacity: r.capacity,
        transmission: r.transmission,
        badge: r.badge,
      },
      content: r.content,
      htmlContent: marked.parse(r.content || '') as string,
      created_at: r.created_at,
    };
  } catch (err) {
    console.error('Error fetching car by slug:', err);
    return null;
  }
}

