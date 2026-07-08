"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { sendEmail, uitnodigingHtml } from "@/lib/email";

// ─── Uitnodigen (pre-aanmaken User + Gebruiker + RegistratieToken) ─═══════

export async function nodigGebruikerUit(formData: FormData) {
  const session = await auth();
  if (!session?.user?.organisatieId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }
  const organisatieId = session.user.organisatieId;

  const naam = (formData.get("naam") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const rol = formData.get("rol") as "VRIJWILLIGER" | "FAMILIE" | "COORDINATOR";
  const telefoon = (formData.get("telefoon") as string | null)?.trim() || null;
  const bewonerId = (formData.get("bewonerId") as string | null) || null;
  const relatie = (formData.get("relatie") as string | null)?.trim() || null;

  // Intake velden (alleen relevant voor vrijwilligers)
  const beschikbaarheid = (formData.get("beschikbaarheid") as string | null)?.trim() || null;
  const vogStatus = (formData.get("vogStatus") as string | null)?.trim() || null;
  const ervaring = (formData.get("ervaring") as string | null)?.trim() || null;
  const motivatie = (formData.get("motivatie") as string | null)?.trim() || null;

  if (!naam || !email || !rol) throw new Error("Naam, e-mail en rol zijn verplicht");

  // Pre-aanmaken Auth.js User record (PrismaAdapter doet dit anders pas bij login)
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name: naam, emailVerified: null },
    update: {},
  });

  // Gebruiker record aanmaken of updaten
  const gebruiker = await prisma.gebruiker.upsert({
    where: { userId: user.id },
    create: {
      naam,
      email,
      rol,
      telefoon,
      organisatieId,
      userId: user.id,
      voorkeurActiviteiten: [],
      beschikbaarheid,
      vogStatus,
      ervaring,
      motivatie,
    },
    update: { naam, rol, telefoon },
  });

  // Familie koppelen aan bewoner
  if (rol === "FAMILIE" && bewonerId && relatie) {
    const bestaand = await prisma.familieKoppeling.findFirst({
      where: { bewonerId, gebruikerId: gebruiker.id },
    });
    if (!bestaand) {
      await prisma.familieKoppeling.create({
        data: { bewonerId, gebruikerId: gebruiker.id, relatie },
      });
    }
  }

  // ─── Registratietoken aanmaken ───────────────────────────────────────
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 dagen geldig

  await prisma.registratieToken.create({
    data: {
      gebruikerId: gebruiker.id,
      token,
      expiresAt,
    },
  });

  // In development: geef registratie URL terug
  // In productie: verstuur via email (Resend)
  const registratieUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register/${token}`;

  // Revalideer relevante paden
  revalidatePath("/coordinator/gebruikers");
  revalidatePath("/coordinator/bewoners");
  if (bewonerId) revalidatePath(`/coordinator/bewoners/${bewonerId}`);

  // Verstuur de uitnodigingsmail
  const organisatie = await prisma.organisatie.findUnique({
    where: { id: organisatieId },
    select: { naam: true },
  });
  const orgNaam = organisatie?.naam ?? "Welzijnsklik";
  const rolLabel =
    { VRIJWILLIGER: "vrijwilliger", COORDINATOR: "coördinator", FAMILIE: "familie" }[rol] ??
    "gebruiker";

  await sendEmail({
    to: email,
    subject: `Uitnodiging voor Welzijnsklik — ${orgNaam}`,
    html: uitnodigingHtml({
      naam,
      rolLabel,
      organisatie: orgNaam,
      registratieUrl,
    }),
  });

  return { email, registratieUrl };
}

// ─── Registratie voltooien (wachtwoord instellen) ─═════════════════════════

export async function voltooiRegistratie(token: string, wachtwoord: string) {
  if (!token || !wachtwoord) throw new Error("Token en wachtwoord zijn verplicht");
  if (wachtwoord.length < 6) throw new Error("Wachtwoord moet minimaal 6 tekens zijn");

  const registratieToken = await prisma.registratieToken.findUnique({
    where: { token },
    include: { gebruiker: true },
  });

  if (!registratieToken) throw new Error("Ongeldige registratietoken");
  if (registratieToken.expiresAt < new Date()) throw new Error("Token is verlopen");

  // Haal het User record op
  const userId = registratieToken.gebruiker.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Gebruiker niet gevonden");

  // Hash het wachtwoord en sla op
  const hashedPassword = await (await import("bcryptjs")).hash(wachtwoord, 12);

  // Markeer email als geverifieerd en sla wachtwoord op
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date(), password: hashedPassword },
  });

  // Verwijder token (eenmalig gebruik)
  await prisma.registratieToken.delete({ where: { id: registratieToken.id } });

  return { email: user.email };
}

// ─── Familielid gegevens bijwerken ───────────────────────────────────────────

export async function updateFamilielid(formData: FormData) {
  const session = await auth();
  if (!session?.user?.organisatieId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  const gebruikerId = formData.get("gebruikerId") as string;
  const bewonerId = formData.get("bewonerId") as string;
  const naam = (formData.get("naam") as string | null)?.trim() ?? "";
  const telefoon = (formData.get("telefoon") as string | null)?.trim() || null;
  const relatie = (formData.get("relatie") as string | null)?.trim() ?? "";

  if (!naam) throw new Error("Naam is verplicht");

  const gebruiker = await prisma.gebruiker.findFirst({
    where: { id: gebruikerId, organisatieId: session.user.organisatieId },
  });
  if (!gebruiker) throw new Error("Gebruiker niet gevonden");

  await prisma.gebruiker.update({
    where: { id: gebruikerId },
    data: { naam, telefoon },
  });

  if (relatie) {
    await prisma.familieKoppeling.updateMany({
      where: { bewonerId, gebruikerId },
      data: { relatie },
    });
  }

  revalidatePath(`/coordinator/bewoners/${bewonerId}`);
}

// ─── Gebruiker naam bijwerken ─────────────────────────────────────────────────

export async function updateGebruikerNaam(formData: FormData) {
  const session = await auth();
  if (!session?.user?.organisatieId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  const gebruikerId = formData.get("gebruikerId") as string;
  const naam = (formData.get("naam") as string | null)?.trim() ?? "";

  if (!naam) throw new Error("Naam is verplicht");

  const gebruiker = await prisma.gebruiker.findFirst({
    where: { id: gebruikerId, organisatieId: session.user.organisatieId },
  });
  if (!gebruiker) throw new Error("Gebruiker niet gevonden");

  await prisma.gebruiker.update({
    where: { id: gebruikerId },
    data: { naam },
  });

  revalidatePath(`/coordinator/gebruikers/${gebruikerId}`);
}

// ─── Vrijwilliger dossier bijwerken ──────────────────────────────────────────

export async function updateVrijwilligerProfiel(formData: FormData) {
  const session = await auth();
  if (!session?.user?.organisatieId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  const gebruikerId = formData.get("gebruikerId") as string;
  const telefoon = (formData.get("telefoon") as string | null)?.trim() || null;
  const interneNotities = (formData.get("interneNotities") as string | null)?.trim() || null;
  const voorkeurRaw = formData.getAll("voorkeurActiviteiten") as string[];
  const voorkeurActiviteiten = voorkeurRaw.filter(Boolean);

  // Intake velden
  const beschikbaarheid = (formData.get("beschikbaarheid") as string | null)?.trim() || null;
  const vogStatus = (formData.get("vogStatus") as string | null)?.trim() || null;
  const ervaring = (formData.get("ervaring") as string | null)?.trim() || null;
  const motivatie = (formData.get("motivatie") as string | null)?.trim() || null;

  const gebruiker = await prisma.gebruiker.findFirst({
    where: { id: gebruikerId, organisatieId: session.user.organisatieId },
  });
  if (!gebruiker) throw new Error("Gebruiker niet gevonden");

  await prisma.gebruiker.update({
    where: { id: gebruikerId },
    data: { telefoon, interneNotities, voorkeurActiviteiten, beschikbaarheid, vogStatus, ervaring, motivatie },
  });

  revalidatePath(`/coordinator/gebruikers/${gebruikerId}`);
  revalidatePath("/coordinator/gebruikers");
}