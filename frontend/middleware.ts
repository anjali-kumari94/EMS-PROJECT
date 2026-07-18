import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Fast, edge-safe check: is there a token cookie at all? Role-level and
// ownership checks happen on the backend (source of truth) and again in
// each page component, since a cookie's mere presence doesn't guarantee
// a valid or unexpired JWT.
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

  if (isDashboardRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
