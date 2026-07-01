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

const adminProvider = Credentials({
  id: "admin-login",
  name: "Admin Login",
  credentials: {
    email: { label: "E-mail", type: "email" },
    password: { label: "Wachtwoord", type: "password" },
  },
  async authorize(credentials) {
    const email = credentials?.email as string | undefined;
    const password = credentials?.password as string | undefined;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) return null;
    if (email !== adminEmail || password !== adminPassword) return null;

    let user = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: { gebruiker: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { email: adminEmail, name: "Admin" },
        include: { gebruiker: true },
      });
    }

    if (!user.gebruiker) {
      let organisatie = await prisma.organisatie.findFirst();
      if (!organisatie) {
        organisatie = await prisma.organisatie.create({
          data: { naam: "Stichting de Baan", plaats: "Amsterdam" },
        });
      }
      await prisma.gebruiker.create({
        data: {
          naam: "Admin",
          email: adminEmail,
          rol: "COORDINATOR",
          organisatieId: organisatie.id,
          userId: user.id,
        },
      });
    }

    return { id: user.id, email: user.email ?? adminEmail, name: user.name };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...devProviders,
    adminProvider,
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
