import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionActive = request.cookies.get('session_active')?.value === 'true';

  const isAuthRoute = pathname.startsWith('/login');
  
  // Protected routes matcher
  const isProtectedRoute = 
    pathname.startsWith('/activity') ||
    pathname.startsWith('/approvals') ||
    pathname.startsWith('/business') ||
    pathname.startsWith('/invoices') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/users') ||
    pathname === '/'; // root index redirector

  if (isProtectedRoute && !sessionActive) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && sessionActive) {
    const invoicesUrl = new URL('/invoices', request.url);
    return NextResponse.redirect(invoicesUrl);
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
