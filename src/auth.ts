import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import type { Rol } from "@/generated/prisma/client";

const devProviders =
  process.env.NODE_ENV === "development"
    ? [
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
              // Geef alleen velden terug die NextAuth verwacht
              return { id: user.id, email: user.email ?? email, name: user.name };
            } catch (err) {
              console.error("[dev-login] authorize fout:", err);
              return null;
            }
          },
        }),
      ]
    : [];

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
    async jwt({ token, user }) {
      if (user?.id && !token.gebruikerId) {
        console.log("[auth] jwt callback: userId =", user.id);
        try {
          const gebruiker = await prisma.gebruiker.findUnique({
            where: { userId: user.id },
            select: { id: true, rol: true, organisatieId: true, naam: true },
          });
          console.log("[auth] jwt callback: gebruiker =", gebruiker);
          if (gebruiker) {
            token.gebruikerId = gebruiker.id;
            token.rol = gebruiker.rol as Rol;
            token.organisatieId = gebruiker.organisatieId;
            token.naam = gebruiker.naam;
          }
        } catch (err) {
          console.error("[auth] jwt callback fout:", err);
        }
      }
      return token;
    },
  },
});
