import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const protectedPaths = ["/dashboard", "/create", "/preview", "/checkout", "/generate"];

// Build locale-stripping regex from routing config to stay in sync
const localePattern = new RegExp(`^/(${routing.locales.join("|")})`);

function isProtectedPath(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(localePattern, "") || "/";
  return protectedPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/")
  );
}

export function proxy(request: NextRequest) {
  // In demo mode, skip all auth checks but still handle i18n
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return handleI18nRouting(request);
  }

  // Run next-intl middleware first for locale detection/routing.
  // The response carries locale-related headers/cookies that must be preserved.
  const response = handleI18nRouting(request);

  // Check auth for protected paths (edge-only: just check for session cookie)
  if (isProtectedPath(request.nextUrl.pathname)) {
    const sessionCookie =
      request.cookies.get("authjs.session-token") ||
      request.cookies.get("__Secure-authjs.session-token") ||
      request.cookies.get("next-auth.session-token") ||
      request.cookies.get("__Secure-next-auth.session-token");

    if (!sessionCookie) {
      // Preserve locale prefix in the redirect to login
      const localeMatch = request.nextUrl.pathname.match(localePattern);
      const prefix = localeMatch ? localeMatch[0] : "";
      const loginUrl = new URL(`${prefix}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      const redirect = NextResponse.redirect(loginUrl);

      // Copy locale cookies/headers from the i18n response to preserve locale state
      response.headers.forEach((value, key) => {
        redirect.headers.set(key, value);
      });

      return redirect;
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)"],
};
