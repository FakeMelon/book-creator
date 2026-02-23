import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/preview", "/checkout", "/generate"];

export function proxy(req: NextRequest) {
  // In demo mode, skip all auth checks
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    // Check for NextAuth session token (JWT strategy)
    const token =
      req.cookies.get("__Secure-authjs.session-token")?.value ||
      req.cookies.get("authjs.session-token")?.value ||
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)"],
};
