import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { fail } from "@/lib/api-response";

/**
 * Determines if a given pathname is protected based on specific path prefixes
 * @param pathname - The URL pathname to check
 * @returns boolean - True if the pathname is protected, false otherwise
 */
const isProtectedPath = (pathname: string): boolean => {
  return (
    pathname.startsWith("/dashboard") || // Dashboard routes are protected
    pathname.startsWith("/buckets") || // Bucket-related routes are protected
    pathname.startsWith("/lists") || // List-related routes are protected
    pathname.startsWith("/profile") ||
    pathname.startsWith("/api/lists") ||
    pathname.startsWith("/api/invitations") ||
    pathname.startsWith("/api/auth/me")
  );
};

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return fail("Unauthorized", 401, { code: "UNAUTHORIZED" });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Edge middleware performs lightweight gating only.
  // Token verification and user lookup happen in API handlers/session utilities.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/lists/:path*", "/profile/:path*", "/api/:path*"]
};
