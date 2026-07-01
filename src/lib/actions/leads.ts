"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export async function meldPilotInteresse(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const rl = checkRateLimit(`${ip}:pilot-interesse`, { max: 5, windowSeconds: 60 });
  if (!rl.allowed) {
    throw new Error("Te veel verzoeken. Probeer het over een minuut opnieuw.");
  }

  const naam = (formData.get("naam") as string | null)?.trim() || null;
  const organisatie = (formData.get("organisatie") as string | null)?.trim() || null;
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const telefoon = (formData.get("telefoon") as string | null)?.trim() || null;
  const bericht = (formData.get("bericht") as string | null)?.trim() || null;

  if (!email) throw new Error("E-mailadres is verplicht");

  await prisma.lead.create({
    data: { naam, organisatie, email, telefoon, notitie: bericht, status: "nieuw" },
  });
}

export async function meldDemoInteresse(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const rl = checkRateLimit(`${ip}:demo-interesse`, { max: 5, windowSeconds: 60 });
  if (!rl.allowed) {
    throw new Error("Te veel verzoeken. Probeer het over een minuut opnieuw.");
  }

  const naam = (formData.get("naam") as string | null)?.trim() || null;
  const organisatie = (formData.get("organisatie") as string | null)?.trim() || null;
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const telefoon = (formData.get("telefoon") as string | null)?.trim() || null;
  const bericht = (formData.get("bericht") as string | null)?.trim() || null;

  if (!email) throw new Error("E-mailadres is verplicht");

  await prisma.lead.create({
    data: {
      naam,
      organisatie,
      email,
      telefoon,
      notitie: `[Demo-aanvraag]${bericht ? ` ${bericht}` : ""}`,
      status: "nieuw",
    },
  });
}
