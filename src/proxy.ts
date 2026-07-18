import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, keyFromRequest } from "@/lib/rate-limit";

const { auth } = NextAuth(authConfig);

const ROUTE_ROLES: Record<string, string[]> = {
  "/coordinator": ["COORDINATOR"],
  "/vrijwilliger": ["VRIJWILLIGER"],
  "/familie": ["FAMILIE"],
};

function nextWithPath(req: NextRequest, pathname: string) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
}

export default auth(
  async (req: NextRequest & { auth: { user?: { rol?: string } } | null }) => {
    const { pathname } = req.nextUrl;

    const publicRoutes = [
      "/", "/geen-toegang", "/over-ons", "/pilot", "/support",
      "/algemene-voorwaarden", "/cookies", "/privacy", "/admin/login",
    ];
    if (
      publicRoutes.includes(pathname) ||
      pathname === "/sitemap.xml" ||
      pathname === "/robots.txt" ||
      pathname === "/blog" ||
      pathname.startsWith("/blog/") ||
      pathname === "/platform" ||
      pathname.startsWith("/platform/") ||
      pathname === "/sectoren" ||
      pathname.startsWith("/sectoren/")
    ) {
      return nextWithPath(req, pathname);
    }

    if (pathname.startsWith("/login") || pathname === "/demo") {
      const rl = checkRateLimit(keyFromRequest(req), { max: 10, windowSeconds: 60 });
      if (!rl.allowed) {
        return new NextResponse("Te veel verzoeken. Probeer het over een minuut opnieuw.", {
          status: 429,
          headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" },
        });
      }
      return nextWithPath(req, pathname);
    }

    // Rate-limit op schrijf-/aanmeld-routes (brute-force / abuse bescherming)
    const writeRoutes = [
      "/api/upload-foto",
      "/api/upload-hulp-foto",
      "/api/upload-profielfoto",
      "/register",
    ];
    for (const wr of writeRoutes) {
      if (pathname.startsWith(wr)) {
        const rl = checkRateLimit(keyFromRequest(req), { max: 20, windowSeconds: 60 });
        if (!rl.allowed) {
          return new NextResponse("Te veel verzoeken. Probeer het later opnieuw.", {
            status: 429,
            headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" },
          });
        }
        break;
      }
    }

    const session = req.auth;
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    for (const [prefix, roles] of Object.entries(ROUTE_ROLES)) {
      if (pathname.startsWith(prefix)) {
        const userRol = session.user.rol;
        if (!userRol || !roles.includes(userRol)) {
          return NextResponse.redirect(new URL("/geen-toegang", req.url));
        }
      }
    }

    return nextWithPath(req, pathname);
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.webp$|.*\\.ico$|.*\\.xml$|.*\\.txt$).*)",
  ],
};
