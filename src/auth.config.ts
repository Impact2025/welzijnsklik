import type { NextAuthConfig } from "next-auth";
import type { Rol } from "@/generated/prisma/client";

// Minimale config voor de proxy (Edge Runtime): GEEN providers, GEEN adapter.
// De session callback pikt de custom velden uit het JWT-token — geen DB-query nodig.
export const authConfig = {
  providers: [],
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login",
  },
  callbacks: {
    session({ session, token }) {
      // Kopieer custom JWT-velden naar session.user zodat de proxy ze kan lezen
      if (token) {
        session.user.gebruikerId = token.gebruikerId as string | undefined;
        session.user.rol = token.rol as Rol | undefined;
        session.user.organisatieId = token.organisatieId as string | undefined;
        session.user.naam = token.naam as string | undefined;
      }
      return session;
    },
    authorized({ auth: session, request: { nextUrl } }) {
      const pathname = nextUrl.pathname;
      if (pathname.startsWith("/login") || pathname === "/geen-toegang") return true;
      if (!session?.user) return false;
      const rol = session.user.rol;
      if (pathname.startsWith("/coordinator") && rol !== "COORDINATOR") return false;
      if (pathname.startsWith("/vrijwilliger") && rol !== "VRIJWILLIGER") return false;
      if (pathname.startsWith("/familie") && rol !== "FAMILIE") return false;
      return true;
    },
  },
} satisfies NextAuthConfig;
