import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Demo welzijnschecks ───────────────────────────────────────────────────
// De welzijnscheck is maandelijks. Voor een realistisch dashboard (trends,
// geluksmomenten per maand/kwartaal) zaaien we 3 maanden geschiedenis: deze
// maand, vorige maand en de maand daarvoor. Realistische verdeling: de
// meeste vrijwilligers zitten op 4-5, een paar op 2-3 (aandacht), één op 1
// (kritiek). Enkele vrijwilligers missen hun check van DEZE maand → test de
// "geen check in 14 dagen" staat in de coördinator-view.

const SCORE_POOL = [
  5, 5, 4, 5, 4, 3, 5, 4, 2, 5, // 1-10
  4, 3, 5, 4, 1, 5, 4, 2, 5, 4, // 11-20
];

const AANDACHT_PER_SCORE: Record<number, string[]> = {
  1: ["Werkdruk / te weinig tijd", "Mijn motivatie daalt"],
  2: ["Weinig contact met bewoners", "Onduidelijkheid over taken"],
  3: ["Behoefte aan een praatje"],
};

const NOTITIE_PER_SCORE: Record<number, string> = {
  5: "Heerlijke week gehad, energie zat en fijne gesprekken met bewoners.",
  4: "Loopt lekker, beetje druk maar wel naar tevredenheid.",
  3: "Gaat wel. Niks bijzonders, wel even behoefte aan een kletsmomentje.",
  2: "Het voelt drukker dan fijn is. Even kijken hoe ik dit volhoud.",
  1: "Ik merk dat ik vastloop — graag even overleggen over mijn taken.",
};

function dagenGeleden(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

// Datum in een eerdere maand (monthOffset=0 → deze maand, 1 → vorige, 2 →
// twee maanden terug), rond het begin van de maand — checks komen binnen
// na de maandelijkse herinnering op de 1e.
function maandDatum(monthOffset: number, dag: number): Date {
  const nu = new Date();
  return new Date(nu.getFullYear(), nu.getMonth() - monthOffset, dag);
}

function clamp(score: number): number {
  return Math.min(5, Math.max(1, score));
}

function stemmingVoorScore(score: number): "ZEER_LAAG" | "LAAG" | "NEUTRAAL" | "GOED" | "UITSTEKEND" {
  return score === 1 ? "ZEER_LAAG"
    : score === 2 ? "LAAG"
    : score === 3 ? "NEUTRAAL"
    : score === 4 ? "GOED"
    : "UITSTEKEND";
}

async function main() {
  console.log("Seeding demo welzijnschecks...");

  const organisatie = await prisma.organisatie.upsert({
    where: { id: "org_meerwende" },
    update: {},
    create: { id: "org_meerwende", naam: "De Meerwende", plaats: "Badhoevedorp" },
  });
  const orgId = organisatie.id;

  // Verwijder eerdere demo-checks (idempotent)
  await prisma.welzijnscheck.deleteMany({
    where: { id: { startsWith: "wc_demo_" } },
  });

  const vrijwilligers = await prisma.gebruiker.findMany({
    where: {
      organisatieId: orgId,
      rol: { in: ["VRIJWILLIGER", "WELZIJNSMEDEWERKER"] },
    },
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });

  if (vrijwilligers.length === 0) {
    console.log("  Geen vrijwilligers gevonden — run eerst `npm run db:seed` (seed + seed-extra).");
    return;
  }

  let gemaakt = 0;
  // Sla de laatste ~5 vrijwilligers over voor DEZE maand, zodat er "geen
  // check" rijen ontstaan (hun geschiedenis van de 2 maanden ervoor blijft
  // wel bestaan, voor de trend).
  const zonderCheck = Math.min(5, Math.floor(vrijwilligers.length / 4));
  const MAANDEN_TERUG = [2, 1, 0]; // oud → nieuw, zodat logs chronologisch zijn

  for (let i = 0; i < vrijwilligers.length; i++) {
    const v = vrijwilligers[i];
    const mist = i >= vrijwilligers.length - zonderCheck;
    const scoreLog: string[] = [];

    for (const monthOffset of MAANDEN_TERUG) {
      if (monthOffset === 0 && mist) continue; // mist alleen de check van deze maand

      // Lichte drift per maand, zodat er een zichtbare trend ontstaat.
      const drift = ((i + monthOffset) % 3) - 1; // -1, 0 of +1
      const score = clamp(SCORE_POOL[i % SCORE_POOL.length] + drift);
      const id = `wc_demo_${i + 1}_${monthOffset}`;
      const createdAt =
        monthOffset === 0
          ? dagenGeleden(i % 13) // deze maand: verspreid over de laatste ~2 weken
          : maandDatum(monthOffset, 2 + (i % 7)); // eerdere maanden: begin van de maand

      await prisma.welzijnscheck.create({
        data: {
          id,
          organisatieId: orgId,
          vrijwilligerId: v.id,
          score,
          stemming: stemmingVoorScore(score),
          notitie: NOTITIE_PER_SCORE[score],
          aandachtspunten: AANDACHT_PER_SCORE[score] ?? [],
          anoniem: false,
          createdAt,
        },
      });
      gemaakt++;
      scoreLog.push(`${score}/5`);
    }

    console.log(
      `  ${v.naam}: ${scoreLog.join(" → ") || "(geen checks)"}${mist ? " — mist check deze maand" : ""}`
    );
  }

  console.log(`\n${gemaakt} welzijnschecks aangemaakt over 3 maanden (${zonderCheck} vrijwilligers zonder check deze maand).`);
  console.log("Bekijk ze op /coordinator/welzijnscheck en /coordinator (geluksmomenten)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
