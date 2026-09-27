export const SITE_TITLE = 'Beyond Jogja Tours';
export const SITE_DESCRIPTION = 'Layanan Rental Mobil & Paket Wisata Jogja Murah dan Terpercaya';
export const PHONE_NUMBER = '+6285213814714'; // Placeholder
export const WHATSAPP_NUMBER = '6285213814714'; // Tanpa +
export const EMAIL_ADDRESS = 'beyondjogjajourneys@gmail.com';
export const OFFICE_ADDRESS = 'Perumahan Samara Regency, Mertosanan Kulon, Potorono, Kec. Banguntapan, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55196';

export const getWhatsAppUrl = (message: string) => {
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
};
