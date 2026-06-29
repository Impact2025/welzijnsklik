import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import type { Rol } from "@/generated/prisma/client";

const devProviders = [
        Credentials({
          id: "dev-login",
          name: "Dev Login",
          credentials: { email: { label: "E-mail", type: "email" } },
          async authorize(credentials) {
            try {
              const email = credentials?.email as string | undefined;
              if (!email) return null;
              const user = await prisma.user.findUnique({ where: { email } });
              if (!user) {
                console.log("[dev-login] geen user gevonden voor:", email);
                return null;
              }
              console.log("[dev-login] user gevonden:", user.id, user.email);
              return { id: user.id, email: user.email ?? email, name: user.name };
            } catch (err) {
              console.error("[dev-login] authorize fout:", err);
              return null;
            }
          },
        }),
      ]

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...devProviders,
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@welzijnsklik.nl",
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session: sessionData }) {
      // session.update({ profielFoto: url }) vanuit client
      if (trigger === "update" && sessionData?.profielFoto !== undefined) {
        token.profielFoto = sessionData.profielFoto;
        return token;
      }
      // Query DB bij eerste login OF als vereiste velden ontbreken (verouderd token)
      const userId = user?.id ?? (token.sub as string | undefined);
      if (userId && (!token.gebruikerId || !token.organisatieId)) {
        try {
          const gebruiker = await prisma.gebruiker.findUnique({
            where: { userId },
            select: { id: true, rol: true, organisatieId: true, naam: true, profielFoto: true },
          });
          if (gebruiker) {
            token.gebruikerId = gebruiker.id;
            token.rol = gebruiker.rol as Rol;
            token.organisatieId = gebruiker.organisatieId;
            token.naam = gebruiker.naam;
            token.profielFoto = gebruiker.profielFoto ?? null;
          }
        } catch (err) {
          console.error("[auth] jwt callback fout:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Kopieer custom JWT-velden naar session.user
      if (token) {
        session.user.gebruikerId = token.gebruikerId as string | undefined;
        session.user.rol = token.rol as Rol | undefined;
        session.user.organisatieId = token.organisatieId as string | undefined;
        session.user.naam = token.naam as string | undefined;
        session.user.profielFoto = token.profielFoto as string | null | undefined;
      }
      return session;
    },
  },
});
