import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, SESSION_TOKEN_PATTERN } from "@/shared/auth-constants";

// Protected routes that require authentication
const protectedPaths = ["/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path needs protection
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token || !SESSION_TOKEN_PATTERN.test(token)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
