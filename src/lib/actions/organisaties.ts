"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Vind of maak een organisatie op basis van e-maildomein.
 * Als het domein nog niet bestaat, wordt null teruggegeven (wacht-modus).
 */
export async function vindOfMaakOrganisatie(email: string) {
  const domein = email.split("@").at(1)?.toLowerCase();
  if (!domein) return null;

  // Zoek organisatie op (deel van) domein
  const bestaand = await prisma.organisatie.findFirst({
    where: { naam: { contains: domein.split(".")[0]!, mode: "insensitive" } },
  });
  if (bestaand) return bestaand;

  return null;
}

/**
 * Koppel een Auth.js User aan een bestaande organisatie met een rol.
 * Gemaakt voor coördinatoren die nieuwe gebruikers toevoegen.
 */
export async function koppelGebruikerAanOrganisatie(
  userId: string,
  organisatieId: string,
  rol: "COORDINATOR" | "VRIJWILLIGER" | "FAMILIE",
  naam: string
) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    throw new Error("Alleen coördinatoren kunnen gebruikers koppelen");
  }

  // Haal de Auth.js user op
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user?.email) throw new Error("User niet gevonden");

  // Check dat de organisatie bestaat
  const org = await prisma.organisatie.findUnique({
    where: { id: organisatieId },
  });
  if (!org) throw new Error("Organisatie niet gevonden");

  // Maak Gebruiker record
  const gebruiker = await prisma.gebruiker.upsert({
    where: { userId },
    update: { rol, organisatieId, naam },
    create: {
      naam,
      email: user.email,
      rol,
      organisatieId,
      userId,
    },
  });

  return gebruiker;
}
