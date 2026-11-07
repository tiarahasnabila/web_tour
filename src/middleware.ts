import { defineMiddleware } from 'astro:middleware';
import { verifySessionToken } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Protect /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = context.cookies.get('admin_session')?.value;
    const user = verifySessionToken(sessionCookie);

    if (!user) {
      return context.redirect('/admin/login');
    }

    context.locals.user = user;
  }

  const response = await next();

  // Optimasi Kecepatan Vercel CDN Edge Cache untuk Halaman Publik:
  // Menyajikan respon HTML langsung dari Edge Network terdekat (~20-50ms)
  if (
    context.request.method === 'GET' &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api') &&
    response.status === 200
  ) {
    response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
  }

  return response;
});

