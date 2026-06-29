import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";

// Lichte config ZONDER Prisma-adapter — alleen gebruikt in de proxy (Edge Runtime)
export const authConfig = {
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@welzijnsklik.nl",
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const pathname = nextUrl.pathname;

      // Login-pagina's altijd toestaan
      if (pathname.startsWith("/login") || pathname === "/geen-toegang") {
        return true;
      }

      const session = auth;
      if (!session?.user) return false;

      const rol = session.user.rol;
      if (pathname.startsWith("/coordinator") && rol !== "COORDINATOR") return false;
      if (pathname.startsWith("/vrijwilliger") && rol !== "VRIJWILLIGER") return false;
      if (pathname.startsWith("/familie") && rol !== "FAMILIE") return false;

      return true;
    },
  },
} satisfies NextAuthConfig;
