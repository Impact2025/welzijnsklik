"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function meldWervingsinteresse(bericht: string) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "FAMILIE") {
    throw new Error("Niet geautoriseerd");
  }

  const interesse = await prisma.wervingsinteresse.create({
    data: {
      gebruikerId: session.user.gebruikerId,
      bericht: bericht || null,
    },
  });

  // Stuur notificatie naar alle coördinatoren van de organisatie
  const coordinatoren = await prisma.gebruiker.findMany({
    where: {
      organisatieId: session.user.organisatieId,
      rol: "COORDINATOR",
    },
    select: { email: true, naam: true },
  });

  if (coordinatoren.length > 0) {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@welzijnsklik.nl",
      to: coordinatoren.map((c) => c.email),
      subject: "Nieuwe aanmelding samenzorg-vrijwilliger — Welzijnsklik",
      html: `
        <h2>Nieuwe wervingsinteresse</h2>
        <p><strong>${session.user.naam ?? session.user.email}</strong> heeft zich aangemeld als samenzorg-vrijwilliger.</p>
        ${bericht ? `<p><em>Bericht:</em><br>${bericht}</p>` : ""}
        <p>Log in op Welzijnsklik om op te volgen.</p>
      `,
    });
  }

  return interesse;
}
