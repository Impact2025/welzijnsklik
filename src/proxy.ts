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
    if (publicRoutes.includes(pathname)) {
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
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.webp$|.*\\.ico$).*)",
  ],
};
