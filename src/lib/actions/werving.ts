"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, wervingHtml } from "@/lib/email";

export async function meldWervingsinteresse(
  beschikbaarheid: string,
  ervaring: string | null,
  motivatie: string | null,
  vogStatus: string,
  bericht: string | null
) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "FAMILIE") {
    throw new Error("Niet geautoriseerd");
  }

  // Haal organisatienaam op
  const gebruiker = await prisma.gebruiker.findUnique({
    where: { id: session.user.gebruikerId },
    select: {
      organisatie: { select: { naam: true } },
      naam: true,
      email: true,
    },
  });

  const interesse = await prisma.wervingsinteresse.create({
    data: {
      gebruikerId: session.user.gebruikerId,
      beschikbaarheid: beschikbaarheid || null,
      ervaring: ervaring || null,
      motivatie: motivatie || null,
      vogStatus: vogStatus || null,
      bericht: bericht || null,
    },
  });

  // Stuur prachtige notificatie naar alle coördinatoren
  const coordinatoren = await prisma.gebruiker.findMany({
    where: {
      organisatieId: session.user.organisatieId,
      rol: "COORDINATOR",
    },
    select: { email: true, naam: true },
  });

  if (coordinatoren.length > 0 && gebruiker) {
    const html = wervingHtml(
      gebruiker.naam ?? session.user.naam ?? "Onbekend",
      gebruiker.email ?? session.user.email ?? "",
      beschikbaarheid,
      ervaring,
      motivatie,
      vogStatus,
      bericht,
      gebruiker.organisatie.naam
    );

    await sendEmail({
      to: coordinatoren.map((c) => c.email),
      subject: `Nieuwe aanmelding: ${gebruiker.naam ?? "Iemand"} wil helpen`,
      html,
    });
  }

  return interesse;
}