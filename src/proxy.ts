import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const ROUTE_ROLES: Record<string, string[]> = {
  "/coordinator": ["COORDINATOR"],
  "/vrijwilliger": ["VRIJWILLIGER"],
  "/familie": ["FAMILIE"],
};

export default auth(
  async (req: NextRequest & { auth: { user?: { rol?: string } } | null }) => {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/login") || pathname === "/geen-toegang") {
      return NextResponse.next();
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

    return NextResponse.next();
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
