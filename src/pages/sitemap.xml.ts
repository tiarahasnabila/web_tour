import type { APIRoute } from 'astro';
import { getAllTours } from '../lib/tours';
import { getSiteSettings } from '../lib/settings';

export const GET: APIRoute = async ({ request }) => {
  const settings = await getSiteSettings();
  const origin = settings.canonical_site_url || new URL(request.url).origin;
  const baseUrl = origin.replace(/\/+$/, '');

  const tours = await getAllTours();
  const today = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { url: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { url: `${baseUrl}/tour-package`, priority: '0.9', changefreq: 'daily' },
    { url: `${baseUrl}/layanan`, priority: '0.9', changefreq: 'daily' },
    { url: `${baseUrl}/tentang-kami`, priority: '0.7', changefreq: 'monthly' },
    { url: `${baseUrl}/kontak`, priority: '0.7', changefreq: 'monthly' },
    { url: `${baseUrl}/galeri`, priority: '0.6', changefreq: 'monthly' },
  ];

  const tourRoutes = tours.map(tour => {
    let lastmod = today;
    if (tour.created_at) {
      try {
        lastmod = new Date(tour.created_at).toISOString().split('T')[0];
      } catch {}
    }
    return {
      url: `${baseUrl}/tour-package/${tour.slug}`,
      lastmod,
      priority: '0.8',
      changefreq: 'weekly',
    };
  });

  const allRoutes = [...staticRoutes, ...tourRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    route => `  <url>
    <loc>${route.url}</loc>
    <lastmod>${route.lastmod || today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`.trim();

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

