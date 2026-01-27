import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('user_id')?.value;
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Redirect to admin if already logged in
  if (request.nextUrl.pathname === '/login') {
    if (userId) {
      return NextResponse.redirect(new URL('/admin/timeline', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
