"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail, toestemmingHtml, welkomHtml } from "@/lib/email";

export async function updateToestemming(
  bewonerId: string,
  toestemmingFotos: boolean,
  toestemmingDoor: string
) {
  const session = await auth();
  if (!session?.user?.organisatieId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  const bewoner = await prisma.bewoner.findFirst({
    where: { id: bewonerId, organisatieId: session.user.organisatieId },
  });
  if (!bewoner) throw new Error("Bewoner niet gevonden");

  await prisma.$transaction([
    prisma.bewoner.update({
      where: { id: bewonerId },
      data: {
        toestemmingFotos,
        toestemmingDoor: toestemmingFotos ? toestemmingDoor : null,
        toestemmingDatum: toestemmingFotos ? new Date() : null,
      },
    }),
    prisma.toestemmingLog.create({
      data: {
        bewonerId,
        actie: toestemmingFotos ? "AAN" : "UIT",
        door: toestemmingDoor || session.user.naam || session.user.email || "Onbekend",
        uitgevoerdDoor: session.user.gebruikerId!,
      },
    }),
  ]);

  // ─── Notificatie naar familieleden ─────────────────────────────────
  const organisatie = await prisma.organisatie.findUnique({
    where: { id: session.user.organisatieId },
    select: { naam: true },
  });

  const familieleden = await prisma.familieKoppeling.findMany({
    where: { bewonerId },
    include: {
      gebruiker: { select: { email: true } },
    },
  });

  for (const fk of familieleden) {
    if (fk.gebruiker.email) {
      const html = toestemmingHtml(
        bewoner.naam,
        toestemmingFotos ? "AAN" : "UIT",
        toestemmingDoor || "Onbekend",
        session.user.naam ?? session.user.email ?? "Onbekend",
        organisatie?.naam ?? "Welzijnsklik"
      );
      await sendEmail({
        to: fk.gebruiker.email,
        subject: `Toestemming ${toestemmingFotos ? "aangezet" : "uitgezet"} voor ${bewoner.naam}`,
        html,
      });
    }
  }

  revalidatePath(`/coordinator/bewoners/${bewonerId}`);
  revalidatePath("/coordinator");
}

export async function maakBewoner(formData: FormData) {
  const session = await auth();
  if (!session?.user?.organisatieId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  const naam = (formData.get("naam") as string | null)?.trim() ?? "";
  const kamer = (formData.get("kamer") as string | null)?.trim() || null;
  const geboortedatumRaw = (formData.get("geboortedatum") as string | null)?.trim();
  const notities = (formData.get("notities") as string | null)?.trim() || null;

  if (!naam) throw new Error("Naam is verplicht");

  const geboortedatum = geboortedatumRaw ? new Date(geboortedatumRaw) : null;

  const bewoner = await prisma.bewoner.create({
    data: {
      naam,
      kamer,
      geboortedatum,
      notities,
      organisatieId: session.user.organisatieId,
    },
  });

  revalidatePath("/coordinator/bewoners");
  revalidatePath("/coordinator");

  return bewoner.id;
}

export async function getBewonersVoorOrganisatie() {
  const session = await auth();
  if (!session?.user?.organisatieId) throw new Error("Niet geautoriseerd");

  return prisma.bewoner.findMany({
    where: { organisatieId: session.user.organisatieId },
    orderBy: { naam: "asc" },
  });
}

/**
 * Stuur een welkom-mail naar een nieuwe gebruiker.
 * Wordt aangeroepen nadat een coordinator een gebruiker heeft toegevoegd.
 */
export async function stuurWelkomMail(userId: string) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  const gebruiker = await prisma.gebruiker.findUnique({
    where: { userId },
    include: { organisatie: { select: { naam: true } } },
  });

  if (!gebruiker?.email) throw new Error("Gebruiker of e-mail niet gevonden");

  const html = welkomHtml(gebruiker.naam, gebruiker.rol, gebruiker.organisatie.naam);
  return sendEmail({
    to: gebruiker.email,
    subject: `Welkom bij Welzijnsklik, ${gebruiker.naam}!`,
    html,
    throwOnError: true,
  });
}
