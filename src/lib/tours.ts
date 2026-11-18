import { sql } from './db';
import { marked } from 'marked';

export interface TourItineraryItem {
  time: string;
  title: string;
  desc: string;
}

export interface TourItem {
  id: number;
  slug: string;
  data: {
    title: string;
    thumbnail: string;
    tagline: string;
    whatsappMessage: string;
    price: string;
    priceUnit: string;
    duration: string;
    isActive: boolean;
    rating?: number | null;
    reviewsCount?: number | null;
    badge: string;
    location: string;
    highlights: string[];
    itinerary: TourItineraryItem[];
    included: string[];
    excluded: string[];
    gallery: string[];
    priceNote?: string;
    importantInfo?: string;
    pickupLocation?: string;
    groupType?: string;
    groupTypeNote?: string;
    driverService?: string;
    driverServiceNote?: string;
    bookingPerks?: string[];
  };
  content: string;
  htmlContent: string;
  created_at: string;
}

const defaultIncluded = [
  'Mobil Ber-AC Prima (Avanza / Innova / Hiace)',
  'Driver Ramah & Berpengalaman merangkap pemandu lokal',
  'Bahan Bakar Minyak (BBM) selama tour',
  'Antar-Jemput di Hotel, Stasiun, atau Bandara Yogyakarta',
  'Air mineral dingin selama perjalanan',
  'Biaya parkir di seluruh destinasi'
];

const defaultExcluded = [
  'Tiket masuk objek wisata (bisa diatur all-in via WhatsApp)',
  'Pengeluaran pribadi & makan siang / malam',
  'Tipping untuk driver (sukarela)'
];

const defaultHighlights = [
  'Pengalaman 100% Private Tour tanpa digabung tamu lain',
  'Jadwal dan durasi perjalanan fleksibel mengikuti ritme Anda',
  'Driver lokal berpengalaman siap merekomendasikan spot foto terbaik',
  'Armada ber-AC bersih, harum, dan nyaman untuk perjalanan jauh'
];

const defaultBookingPerks = [
  '100% Private Tour (Tanpa Campur Tamu Lain)',
  'Jadwal & Waktu Singgah Bebas Diatur',
  'Bisa Bayar DP Ringan / Bayar di Tempat',
  'Driver Ramah & Siap Bantu Ambilkan Foto'
];

const defaultItinerary: TourItineraryItem[] = [
  { time: '08:00 - 08:30', title: 'Penjemputan di Hotel / Stasiun', desc: 'Driver kami akan menjemput Anda tepat waktu di lobi hotel atau stasiun di area Yogyakarta.' },
  { time: '08:30 - 10:30', title: 'Perjalanan & Eksplorasi Destinasi Utama', desc: 'Menuju objek wisata utama, menikmati keindahan alam dan mengabadikan momen foto terbaik.' },
  { time: '12:00 - 13:30', title: 'Istirahat & Makan Siang Kuliner Khas Jogja', desc: 'Menikmati kuliner lezat khas Yogyakarta di resto lokal rekomendasi driver.' },
  { time: '13:30 - 16:30', title: 'Kunjungan Destinasi Wisata Kedua & Oleh-Oleh', desc: 'Melanjutkan wisata ikonik dan singgah di sentra oleh-oleh khas Jogja (Bakpia / Batik).' },
  { time: '16:30 - 17:30', title: 'Pengantaran Kembali ke Akomodasi', desc: 'Diantar kembali ke hotel atau stasiun dengan aman dan nyaman.' }
];

function parseJsonArray<T>(val: any, fallback: T[]): T[] {
  if (!val) return fallback;
  if (Array.isArray(val)) return val.length > 0 ? val : fallback;
  try {
    const parsed = typeof val === 'string' ? JSON.parse(val) : val;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

let cachedTours: { data: TourItem[]; expires: number } | null = null;
const tourSlugCache = new Map<string, { data: TourItem | null; expires: number }>();
const TOURS_CACHE_TTL = 60 * 1000; // 1 menit cache

export function invalidateToursCache() {
  cachedTours = null;
  tourSlugCache.clear();
}

export async function getAllTours(): Promise<TourItem[]> {
  if (cachedTours && cachedTours.expires > Date.now()) {
    return cachedTours.data;
  }

  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const rows = await sql`
        SELECT 
          id, title, slug, thumbnail, tagline, whatsapp_message, created_at,
          COALESCE(price, 'Rp 450.000') as price,
          COALESCE(price_unit, '/ mobil') as price_unit,
          COALESCE(duration, '10-12 Jam') as duration,
          COALESCE(is_active, true) as is_active,
          rating,
          reviews_count,
          COALESCE(badge, 'Paling Populer') as badge,
          COALESCE(location, 'Yogyakarta') as location,
          booking_perks
        FROM tours 
        ORDER BY id ASC;
      `;
      const data = rows.map((r: any) => ({
        id: r.id,
        slug: r.slug,
        data: {
          title: r.title,
          thumbnail: r.thumbnail,
          tagline: r.tagline,
          whatsappMessage: r.whatsapp_message,
          price: r.price,
          priceUnit: r.price_unit,
          duration: r.duration,
          isActive: r.is_active !== false,
          rating: r.rating !== null && r.rating !== undefined && r.rating !== '' ? Number(r.rating) : null,
          reviewsCount: r.reviews_count !== null && r.reviews_count !== undefined && r.reviews_count !== '' ? Number(r.reviews_count) : null,
          badge: r.badge,
          location: r.location,
          highlights: defaultHighlights,
          itinerary: defaultItinerary,
          included: defaultIncluded,
          excluded: defaultExcluded,
          gallery: [r.thumbnail],
          priceNote: 'Harga per mobil (kapasitas 1-6 orang). Termasuk mobil ber-AC, driver ramah, & BBM.',
          importantInfo: '',
          pickupLocation: 'Hotel, Stasiun Tugu/Lempuyangan, Bandara',
          groupType: 'Hanya Anda & Rombongan',
          groupTypeNote: 'Tidak digabung dengan tamu lain',
          driverService: 'Bahasa Indonesia / English',
          driverServiceNote: 'Ramah, sopan, & siap ambilkan foto terbaik',
          bookingPerks: parseJsonArray<string>(r.booking_perks, defaultBookingPerks),
        },
        content: '',
        htmlContent: '',
        created_at: r.created_at,
      }));

      cachedTours = {
        data,
        expires: Date.now() + TOURS_CACHE_TTL,
      };
      return data;
    } catch (err) {
      if (attempt < maxRetries) {
        console.warn(`Retry ${attempt + 1}/${maxRetries} fetching tours after error:`, (err as any)?.message || err);
        await new Promise((res) => setTimeout(res, 300));
        continue;
      }
      console.error('Error fetching tours from Neon after retries:', err);
      if (cachedTours) {
        console.warn('Returning stale cached tours as fallback.');
        return cachedTours.data;
      }
      return [];
    }
  }
  return [];
}

export async function getTourBySlug(slug: string): Promise<TourItem | null> {
  const cached = tourSlugCache.get(slug);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    const rows = await sql`
      SELECT 
        id, title, slug, thumbnail, tagline, whatsapp_message, content, created_at,
        COALESCE(price, 'Rp 450.000') as price,
        COALESCE(price_unit, '/ mobil') as price_unit,
        COALESCE(duration, '10-12 Jam') as duration,
        COALESCE(is_active, true) as is_active,
        rating,
        reviews_count,
        COALESCE(badge, 'Paling Populer') as badge,
        COALESCE(location, 'Yogyakarta') as location,
        COALESCE(price_note, 'Harga per mobil (kapasitas 1-6 orang). Termasuk mobil ber-AC, driver ramah, & BBM.') as price_note,
        COALESCE(important_info, 'Pakaian yang nyaman dan menyerap keringat, kacamata hitam, topi/payung, kamera atau smartphone terisi penuh, serta uang tunai secukupnya untuk keperluan pribadi di lokasi wisata.') as important_info,
        COALESCE(pickup_location, 'Hotel, Stasiun Tugu/Lempuyangan, Bandara') as pickup_location,
        COALESCE(group_type, 'Hanya Anda & Rombongan') as group_type,
        COALESCE(group_type_note, 'Tidak digabung dengan tamu lain') as group_type_note,
        COALESCE(driver_service, 'Bahasa Indonesia / English') as driver_service,
        COALESCE(driver_service_note, 'Ramah, sopan, & siap ambilkan foto terbaik') as driver_service_note,
        booking_perks,
        highlights, itinerary, included, excluded, gallery
      FROM tours 
      WHERE slug = ${slug} 
      LIMIT 1;
    `;
    if (rows.length === 0) return null;
    const r = rows[0];
    const gallery = parseJsonArray<string>(r.gallery, [r.thumbnail]);

    const result: TourItem = {
      id: r.id,
      slug: r.slug,
      data: {
        title: r.title,
        thumbnail: r.thumbnail,
        tagline: r.tagline,
        whatsappMessage: r.whatsapp_message,
        price: r.price,
        priceUnit: r.price_unit,
        duration: r.duration,
        isActive: r.is_active !== false,
        rating: r.rating !== null && r.rating !== undefined && r.rating !== '' ? Number(r.rating) : null,
        reviewsCount: r.reviews_count !== null && r.reviews_count !== undefined && r.reviews_count !== '' ? Number(r.reviews_count) : null,
        badge: r.badge,
        location: r.location,
        highlights: parseJsonArray<string>(r.highlights, defaultHighlights),
        itinerary: parseJsonArray<TourItineraryItem>(r.itinerary, defaultItinerary),
        included: parseJsonArray<string>(r.included, defaultIncluded),
        excluded: parseJsonArray<string>(r.excluded, defaultExcluded),
        gallery: gallery.length > 0 ? gallery : [r.thumbnail],
        priceNote: r.price_note,
        importantInfo: r.important_info,
        pickupLocation: r.pickup_location,
        groupType: r.group_type,
        groupTypeNote: r.group_type_note,
        driverService: r.driver_service,
        driverServiceNote: r.driver_service_note,
        bookingPerks: parseJsonArray<string>(r.booking_perks, defaultBookingPerks),
      },
      content: r.content,
      htmlContent: marked.parse(r.content || '') as string,
      created_at: r.created_at,
    };
    tourSlugCache.set(slug, { data: result, expires: Date.now() + TOURS_CACHE_TTL });
    return result;
  } catch (err) {
    console.error('Error fetching tour by slug:', err);
    return null;
  }
}
