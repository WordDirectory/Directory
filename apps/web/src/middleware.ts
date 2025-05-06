import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = getSessionCookie(request);

  // Auth pages - redirect to home if already logged in
  if (path.startsWith("/auth") && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protected pages - redirect to login if not logged in
  if ((path.startsWith("/settings") || path.startsWith("/user/saved")) && !session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Add paths that should be checked by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
