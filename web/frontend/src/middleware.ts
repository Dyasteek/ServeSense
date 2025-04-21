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

  // Si hay token y está en login, redirigir a matches
  if (token && isLoginPage) {
    const url = new URL('/matches', request.url);
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