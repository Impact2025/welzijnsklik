import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import type { Rol } from "@/generated/prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Bij eerste inlog: laad rol + organisatie vanuit DB
      if (user?.id) {
        const gebruiker = await prisma.gebruiker.findUnique({
          where: { userId: user.id },
          select: { id: true, rol: true, organisatieId: true, naam: true },
        });
        if (gebruiker) {
          token.gebruikerId = gebruiker.id;
          token.rol = gebruiker.rol as Rol;
          token.organisatieId = gebruiker.organisatieId;
          token.naam = gebruiker.naam;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.gebruikerId = token.gebruikerId as string | undefined;
        session.user.rol = token.rol as Rol | undefined;
        session.user.organisatieId = token.organisatieId as string | undefined;
        session.user.naam = token.naam as string | undefined;
      }
      return session;
    },
    // Overschrijft de `authorized` callback uit authConfig voor volledige sessies
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
});
