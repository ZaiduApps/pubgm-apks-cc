import { NextRequest, NextResponse } from 'next/server';

import { getMainSiteUrl, normalizeRequestHost, resolveSiteIdentity } from '@/lib/site-runtime';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const host = normalizeRequestHost(
    request.headers.get('x-forwarded-host') || request.headers.get('host') || '',
  );
  const identity = resolveSiteIdentity(host);

  if (identity) {
    return NextResponse.next();
  }

  const redirectUrl = new URL(request.url);
  const mainSiteUrl = getMainSiteUrl();
  const target = new URL(mainSiteUrl);
  target.pathname = pathname;
  target.search = redirectUrl.search;

  return NextResponse.redirect(target, 302);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
