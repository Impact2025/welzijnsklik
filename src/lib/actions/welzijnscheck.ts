"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isVrijwilligerRol } from "@/lib/rollen";
import { scoreNaarStemming, AANDACHTSPUNTEN } from "@/lib/welzijnscheck";
import type { WelzijnscheckStemming } from "@/generated/prisma/client";

export interface WelzijnscheckInput {
  score: number;
  notitie?: string;
  aandachtspunten?: string[];
  anoniem?: boolean;
}

export async function vulWelzijnscheckIn(input: WelzijnscheckInput) {
  const session = await auth();
  if (!session?.user?.gebruikerId || !session.user.organisatieId) {
    throw new Error("Niet geautoriseerd");
  }
  // Alleen vrijwilliger/welzijnsmedewerker mag een check invullen
  if (!isVrijwilligerRol(session.user.rol)) {
    throw new Error("Alleen vrijwilligers kunnen een welzijnscheck invullen");
  }

  const score = Math.min(5, Math.max(1, Math.round(input.score)));
  if (!Number.isFinite(score)) throw new Error("Ongeldige score");

  const aandachtspunten = (input.aandachtspunten ?? []).filter((a) =>
    (AANDACHTSPUNTEN as readonly string[]).includes(a)
  );
  const notitie = input.notitie?.trim() || null;
  if (notitie && notitie.length > 1000) throw new Error("Notitie te lang");

  await prisma.welzijnscheck.create({
    data: {
      organisatieId: session.user.organisatieId,
      vrijwilligerId: session.user.gebruikerId,
      score,
      stemming: scoreNaarStemming(score) as WelzijnscheckStemming,
      notitie,
      aandachtspunten,
      anoniem: input.anoniem ?? false,
    },
  });

  revalidatePath("/vrijwilliger/welzijnscheck");
  revalidatePath("/coordinator/welzijnscheck");
  revalidatePath("/coordinator");
  return { ok: true as const };
}

export async function vulWelzijnscheckNamensIn(
  vrijwilligerId: string,
  input: WelzijnscheckInput
) {
  const session = await auth();
  // Alleen coördinator mag namens een ander invullen
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }
  const organisatieId = session.user.organisatieId;

  // Controleer dat de vrijwilliger in dezelfde organisatie zit
  const doel = await prisma.gebruiker.findFirst({
    where: {
      id: vrijwilligerId,
      organisatieId,
      rol: { in: ["VRIJWILLIGER", "WELZIJNSMEDEWERKER"] },
    },
    select: { id: true },
  });
  if (!doel) throw new Error("Vrijwilliger niet gevonden in je organisatie");

  const score = Math.min(5, Math.max(1, Math.round(input.score)));
  if (!Number.isFinite(score)) throw new Error("Ongeldige score");

  const aandachtspunten = (input.aandachtspunten ?? []).filter((a) =>
    (AANDACHTSPUNTEN as readonly string[]).includes(a)
  );
  const notitie = input.notitie?.trim() || null;
  if (notitie && notitie.length > 1000) throw new Error("Notitie te lang");

  await prisma.welzijnscheck.create({
    data: {
      organisatieId: organisatieId!,
      vrijwilligerId,
      score,
      stemming: scoreNaarStemming(score) as WelzijnscheckStemming,
      notitie,
      aandachtspunten,
      anoniem: false,
    },
  });

  revalidatePath("/coordinator/welzijnscheck");
  revalidatePath("/coordinator");
  return { ok: true as const };
}

export interface WelzijnscheckRij {
  vrijwilligerId: string;
  naam: string;
  laatsteScore: number | null;
  laatsteStemming: WelzijnscheckStemming | null;
  laatsteCheck: Date | null;
  aandachtspunten: string[];
  anoniem: boolean;
  totaalChecks: number;
  eersteScore: number | null;
}

// Laatste check per vrijwilliger + aggregatie voor de coördinator.
export async function getWelzijnscheckOverzicht(
  organisatieId: string
): Promise<{
  rijen: WelzijnscheckRij[];
  samenvatting: {
    totaal: number;
    metCheck: number;
    zonderCheck: number;
    gemiddeld: number | null;
    aandacht: number;
    kritiek: number;
    neutraal: number;
  };
}> {
  // Haal alle vrijwilligers/welzijnsmedewerkers van de organisatie
  const vrijwilligers = await prisma.gebruiker.findMany({
    where: {
      organisatieId,
      rol: { in: ["VRIJWILLIGER", "WELZIJNSMEDEWERKER"] },
    },
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });

  const checks = await prisma.welzijnscheck.findMany({
    where: { organisatieId },
    select: {
      vrijwilligerId: true,
      score: true,
      stemming: true,
      aandachtspunten: true,
      anoniem: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const byVrijwilliger = new Map<
    string,
    { scores: number[]; laatste: (typeof checks)[number] | null }
  >();
  for (const v of vrijwilligers) byVrijwilliger.set(v.id, { scores: [], laatste: null });

  for (const c of checks) {
    const entry = byVrijwilliger.get(c.vrijwilligerId);
    if (!entry) continue; // vrijwilliger met andere rol nu — negeer
    entry.scores.push(c.score);
    entry.laatste = c;
  }

  const rijen: WelzijnscheckRij[] = vrijwilligers.map((v) => {
    const entry = byVrijwilliger.get(v.id)!;
    return {
      vrijwilligerId: v.id,
      naam: v.naam,
      laatsteScore: entry.laatste ? entry.laatste.score : null,
      laatsteStemming: entry.laatste ? entry.laatste.stemming : null,
      laatsteCheck: entry.laatste ? entry.laatste.createdAt : null,
      aandachtspunten: entry.laatste?.aandachtspunten ?? [],
      anoniem: entry.laatste?.anoniem ?? false,
      totaalChecks: entry.scores.length,
      eersteScore: entry.scores.length ? entry.scores[0] : null,
    };
  });

  // Sorteer: laagste score eerst (aandacht bovenaan), zonder check onderaan
  rijen.sort((a, b) => {
    const sa = a.laatsteScore ?? 99;
    const sb = b.laatsteScore ?? 99;
    return sa - sb;
  });

  const metCheck = rijen.filter((r) => r.laatsteScore !== null);
  const gemiddeld =
    metCheck.length > 0
      ? Math.round(
          (metCheck.reduce((s, r) => s + (r.laatsteScore ?? 0), 0) / metCheck.length) * 10
        ) / 10
      : null;

  const samenvatting = {
    totaal: rijen.length,
    metCheck: metCheck.length,
    zonderCheck: rijen.length - metCheck.length,
    gemiddeld,
    aandacht: metCheck.filter((r) => (r.laatsteScore ?? 5) <= 2).length,
    kritiek: metCheck.filter((r) => (r.laatsteScore ?? 5) <= 1).length,
    neutraal: metCheck.filter((r) => (r.laatsteScore ?? 0) === 3).length,
  };

  return { rijen, samenvatting };
}
