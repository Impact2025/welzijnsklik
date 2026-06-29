"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Uitnodigen (pre-aanmaken User + Gebruiker) ──────────────────────────────

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

  if (!naam || !email || !rol) throw new Error("Naam, e-mail en rol zijn verplicht");

  // Pre-aanmaken Auth.js User record (PrismaAdapter doet dit anders pas bij login)
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name: naam },
    update: {},
  });

  // Gebruiker record aanmaken of updaten
  const gebruiker = await prisma.gebruiker.upsert({
    where: { userId: user.id },
    create: { naam, email, rol, telefoon, organisatieId, userId: user.id, voorkeurActiviteiten: [] },
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

  revalidatePath("/coordinator/gebruikers");
  revalidatePath("/coordinator/bewoners");
  if (bewonerId) revalidatePath(`/coordinator/bewoners/${bewonerId}`);

  return { email };
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

  const gebruiker = await prisma.gebruiker.findFirst({
    where: { id: gebruikerId, organisatieId: session.user.organisatieId },
  });
  if (!gebruiker) throw new Error("Gebruiker niet gevonden");

  await prisma.gebruiker.update({
    where: { id: gebruikerId },
    data: { telefoon, interneNotities, voorkeurActiviteiten },
  });

  revalidatePath(`/coordinator/gebruikers/${gebruikerId}`);
  revalidatePath("/coordinator/gebruikers");
}
