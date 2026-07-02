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

  const organisatieType = (formData.get("organisatieType") as string | null)?.trim() || null;
  const functie = (formData.get("functie") as string | null)?.trim() || null;
  const aantalClienten = (formData.get("aantalClienten") as string | null)?.trim() || null;
  const uitdagingen = formData.getAll("uitdaging").map((v) => String(v).trim()).filter(Boolean);
  const toelichting = (formData.get("toelichting") as string | null)?.trim() || null;
  const gewensteStart = (formData.get("gewensteStart") as string | null)?.trim() || null;
  const demoVoorkeur = (formData.get("demoVoorkeur") as string | null)?.trim() || null;
  const gewenstMoment = (formData.get("gewenstMoment") as string | null)?.trim() || null;

  if (!email) throw new Error("E-mailadres is verplicht");

  const notitieRegels = [
    organisatieType && `Type organisatie: ${organisatieType}`,
    functie && `Functie: ${functie}`,
    aantalClienten && `Aantal bewoners/cliënten: ${aantalClienten}`,
    uitdagingen.length > 0 && `Uitdaging: ${uitdagingen.join(", ")}`,
    toelichting && `Toelichting: ${toelichting}`,
    gewensteStart && `Gewenste start: ${gewensteStart}`,
    demoVoorkeur && `Voorkeur demo: ${demoVoorkeur}`,
    gewenstMoment && `Gewenst moment: ${gewenstMoment}`,
    bericht && `Bericht: ${bericht}`,
  ].filter(Boolean);

  await prisma.lead.create({
    data: {
      naam,
      organisatie,
      email,
      telefoon,
      notitie: `[Demo-aanvraag]${notitieRegels.length ? " " + notitieRegels.join(" · ") : ""}`,
      status: "nieuw",
    },
  });
}
