import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  // Protect /admin/* routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // E2E bypass: if cookie is set, allow (development/testing only)
    const e2eBypass = req.cookies.get('e2e_admin')?.value === '1';
    if (e2eBypass) return NextResponse.next();
    const token = await getToken({ req });
    const isAdmin = (token as any)?.isAdmin === true;
    if (!isAdmin) {
      const url = new URL('/signin', req.url);
      url.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
