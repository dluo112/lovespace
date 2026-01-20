import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value
 
  // 保护 /admin 路由
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!authToken) {
      // 未登录，重定向到登录页
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: [
    /*
     * 匹配所有以 /admin 开头的路径
     */
    '/admin/:path*',
  ],
}
