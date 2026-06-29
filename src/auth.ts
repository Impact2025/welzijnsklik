import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";
import type { Rol } from "@/generated/prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@welzijnsklik.nl",
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      const gebruiker = await prisma.gebruiker.findUnique({
        where: { userId: user.id },
        select: { id: true, rol: true, organisatieId: true, naam: true },
      });
      if (gebruiker) {
        session.user.gebruikerId = gebruiker.id;
        session.user.rol = gebruiker.rol as Rol;
        session.user.organisatieId = gebruiker.organisatieId;
        session.user.naam = gebruiker.naam;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login",
  },
});
