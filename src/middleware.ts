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

  return next();
});

