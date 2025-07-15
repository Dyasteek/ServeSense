import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isPublicPage = ['/login', '/_next', '/favicon.ico', '/api'].some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Si no hay token y no es una página pública, redirigir a login
  if (!token && !isPublicPage) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // Si hay token y está en login, redirigir según el rol
  if (token && isLoginPage) {
    if (token.role === 'admin') {
      const url = new URL('/admin', request.url);
      return NextResponse.redirect(url);
    } else {
      const url = new URL('/matches', request.url);
      return NextResponse.redirect(url);
    }
  }

  // Si un usuario autenticado que no es admin intenta acceder a /admin, redirigir a /acceso-restringido
  if (token && request.nextUrl.pathname.startsWith('/admin') && token.role !== 'admin') {
    const url = new URL('/acceso-restringido', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 