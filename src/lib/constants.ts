export const SITE_TITLE = 'Beyond Jogja Tours';
export const SITE_DESCRIPTION = 'Layanan Rental Mobil & Paket Wisata Jogja Murah dan Terpercaya';
export const PHONE_NUMBER = '+6281234567890'; // Placeholder
export const WHATSAPP_NUMBER = '6281234567890'; // Tanpa +
export const EMAIL_ADDRESS = 'info@beyondjogjatours.com';
export const OFFICE_ADDRESS = 'Jl. Malioboro No. 1, Yogyakarta';

export const getWhatsAppUrl = (message: string) => {
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
};
