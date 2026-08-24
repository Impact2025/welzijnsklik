"use server";

import { prisma } from "@/lib/prisma";
import {
  type RAGVerdeling,
  scoreNaarRAG,
  berekenGeluksmomenten,
  voorspelGeluksmomenten,
  ragPercentages,
} from "@/lib/geluksmomenten";

export type GeluksmomentenPeriode = "week" | "maand" | "kwartaal";

export interface GeluksmomentenOverzicht {
  periode: GeluksmomentenPeriode;
  periodeStart: Date;
  periodeEind: Date;
  totalUren: number;
  verdeling: RAGVerdeling;
  percentages: { groen: number; oranje: number; rood: number };
  bereikt: number;
  voorspeld: number;
}

export interface GeluksmomentenPersoonlijk {
  periode: GeluksmomentenPeriode;
  periodeStart: Date;
  periodeEind: Date;
  totalUren: number;
  bereikt: number;
  totaalAllerTijden: number;
}

function periodeGrenzen(periode: GeluksmomentenPeriode, peildatum: Date): { start: Date; eind: Date } {
  if (periode === "week") {
    // ISO-week: maandag t/m zondag.
    const dagVanWeek = (peildatum.getDay() + 6) % 7; // 0 = maandag
    const start = new Date(peildatum.getFullYear(), peildatum.getMonth(), peildatum.getDate() - dagVanWeek);
    const eind = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
    return { start, eind };
  }
  if (periode === "maand") {
    const start = new Date(peildatum.getFullYear(), peildatum.getMonth(), 1);
    const eind = new Date(peildatum.getFullYear(), peildatum.getMonth() + 1, 1);
    return { start, eind };
  }
  const kwartaal = Math.floor(peildatum.getMonth() / 3);
  const start = new Date(peildatum.getFullYear(), kwartaal * 3, 1);
  const eind = new Date(peildatum.getFullYear(), kwartaal * 3 + 3, 1);
  return { start, eind };
}

// Organisatiebreed overzicht — voor het coördinator-dashboard.
export async function getGeluksmomentenOverzicht(
  organisatieId: string,
  periode: GeluksmomentenPeriode = "week"
): Promise<GeluksmomentenOverzicht> {
  const peildatum = new Date();
  const { start, eind } = periodeGrenzen(periode, peildatum);

  const [checks, activiteiten] = await Promise.all([
    prisma.welzijnscheck.findMany({
      where: { organisatieId, createdAt: { gte: start, lt: eind } },
      select: { score: true },
    }),
    prisma.activiteit.findMany({
      where: {
        vrijwilliger: { organisatieId },
        createdAt: { gte: start, lt: eind },
      },
      select: { duurMinuten: true },
    }),
  ]);

  const verdeling: RAGVerdeling = { groen: 0, oranje: 0, rood: 0 };
  for (const c of checks) {
    verdeling[scoreNaarRAG(c.score)]++;
  }

  const totalUren = activiteiten.reduce((s, a) => s + a.duurMinuten, 0) / 60;

  const bereikt = berekenGeluksmomenten(totalUren, verdeling);
  const eindVanPeriode = eind < peildatum ? eind : peildatum;
  const voorspeld =
    eind <= peildatum
      ? bereikt
      : voorspelGeluksmomenten(totalUren, verdeling, start, eind, eindVanPeriode);

  return {
    periode,
    periodeStart: start,
    periodeEind: eind,
    totalUren,
    verdeling,
    percentages: ragPercentages(verdeling),
    bereikt,
    voorspeld,
  };
}

// Persoonlijk overzicht voor één vrijwilliger — voor het vrijwilliger-dashboard.
// Gebruikt de eigen uren + eigen welzijnscheck-uitkomsten binnen de periode,
// plus een all-time totaal om de bijdrage tot nu toe te laten zien.
export async function getGeluksmomentenPersoonlijk(
  vrijwilligerId: string,
  periode: GeluksmomentenPeriode = "maand"
): Promise<GeluksmomentenPersoonlijk> {
  const peildatum = new Date();
  const { start, eind } = periodeGrenzen(periode, peildatum);

  const [checks, activiteiten, alleChecks, alleActiviteiten] = await Promise.all([
    prisma.welzijnscheck.findMany({
      where: { vrijwilligerId, createdAt: { gte: start, lt: eind } },
      select: { score: true },
    }),
    prisma.activiteit.findMany({
      where: { vrijwilligerId, createdAt: { gte: start, lt: eind } },
      select: { duurMinuten: true },
    }),
    prisma.welzijnscheck.findMany({
      where: { vrijwilligerId },
      select: { score: true },
    }),
    prisma.activiteit.findMany({
      where: { vrijwilligerId },
      select: { duurMinuten: true },
    }),
  ]);

  const verdeling: RAGVerdeling = { groen: 0, oranje: 0, rood: 0 };
  for (const c of checks) {
    verdeling[scoreNaarRAG(c.score)]++;
  }
  const totalUren = activiteiten.reduce((s, a) => s + a.duurMinuten, 0) / 60;
  const bereikt = berekenGeluksmomenten(totalUren, verdeling);

  const alleVerdeling: RAGVerdeling = { groen: 0, oranje: 0, rood: 0 };
  for (const c of alleChecks) {
    alleVerdeling[scoreNaarRAG(c.score)]++;
  }
  const alleUren = alleActiviteiten.reduce((s, a) => s + a.duurMinuten, 0) / 60;
  const totaalAllerTijden = berekenGeluksmomenten(alleUren, alleVerdeling);

  return {
    periode,
    periodeStart: start,
    periodeEind: eind,
    totalUren,
    bereikt,
    totaalAllerTijden,
  };
}
