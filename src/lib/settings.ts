import { sql } from './db';
import { 
  SITE_TITLE as DEF_TITLE, 
  SITE_DESCRIPTION as DEF_DESC,
  PHONE_NUMBER as DEF_PHONE, 
  WHATSAPP_NUMBER as DEF_WA, 
  EMAIL_ADDRESS as DEF_EMAIL, 
  OFFICE_ADDRESS as DEF_ADDRESS 
} from './constants';

export interface SiteSettings {
  site_title: string;
  site_description: string;
  phone_number: string;
  whatsapp_number: string;
  email_address: string;
  office_address: string;
  instagram_url: string;
  operating_hours: string;
  google_analytics_id?: string;
  google_site_verification?: string;
  canonical_site_url?: string;
}

let cachedSettings: { data: SiteSettings; expires: number } | null = null;
const SETTINGS_CACHE_TTL = 10 * 1000; // 10 seconds cache to keep pages snappy without stale data

export function invalidateSettingsCache() {
  cachedSettings = null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (cachedSettings && cachedSettings.expires > Date.now()) {
    return cachedSettings.data;
  }

  try {
    const rows = await sql`SELECT * FROM site_settings WHERE id = 1 LIMIT 1;`;
    if (rows.length > 0) {
      const r = rows[0];
      const result: SiteSettings = {
        site_title: r.site_title || DEF_TITLE,
        site_description: r.site_description || DEF_DESC,
        phone_number: r.phone_number || DEF_PHONE,
        whatsapp_number: r.whatsapp_number || DEF_WA,
        email_address: r.email_address || DEF_EMAIL,
        office_address: r.office_address || DEF_ADDRESS,
        instagram_url: r.instagram_url || 'https://www.instagram.com/beyondjogja.tours/',
        operating_hours: r.operating_hours || 'Setiap Hari: 07:00 – 22:00 WIB',
        google_analytics_id: r.google_analytics_id || '',
        google_site_verification: r.google_site_verification || '',
        canonical_site_url: r.canonical_site_url || 'https://beyondjogjatours.com',
      };
      cachedSettings = { data: result, expires: Date.now() + SETTINGS_CACHE_TTL };
      return result;
    }
  } catch (err) {
    console.error('Error fetching site_settings from Neon:', err);
  }

  return {
    site_title: DEF_TITLE,
    site_description: DEF_DESC,
    phone_number: DEF_PHONE,
    whatsapp_number: DEF_WA,
    email_address: DEF_EMAIL,
    office_address: DEF_ADDRESS,
    instagram_url: 'https://www.instagram.com/beyondjogja.tours/',
    operating_hours: 'Setiap Hari: 07:00 – 22:00 WIB',
    google_analytics_id: '',
    google_site_verification: '',
    canonical_site_url: 'https://beyondjogjatours.com',
  };
}

export function formatWhatsAppUrl(whatsappNumber: string, message: string): string {
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
}

