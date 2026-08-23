import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Demo welzijnschecks ───────────────────────────────────────────────────
// Realistische verdeling: de meeste vrijwilligers zitten op 4-5, een paar
// op 2-3 (aandacht), één op 1 (kritiek). Enkele vrijwilligers hebben nog
// GEEN check → test de "geen check in 14 dagen" staat in de coördinator-view.

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
  // Sla de laatste ~5 vrijwilligers over zodat er "geen check" rijen ontstaan
  const zonderCheck = Math.min(5, Math.floor(vrijwilligers.length / 4));

  for (let i = 0; i < vrijwilligers.length; i++) {
    const v = vrijwilligers[i];
    if (i >= vrijwilligers.length - zonderCheck) {
      console.log(`  ${v.naam}: (geen check — test 'geen check in 14d')`);
      continue;
    }

    const score = SCORE_POOL[i % SCORE_POOL.length];
    const id = `wc_demo_${i + 1}`;
    const createdAt = dagenGeleden(i % 13); // verspreid over ~2 weken

    await prisma.welzijnscheck.create({
      data: {
        id,
        organisatieId: orgId,
        vrijwilligerId: v.id,
        score,
        stemming:
          score === 1 ? "ZEER_LAAG"
          : score === 2 ? "LAAG"
          : score === 3 ? "NEUTRAAL"
          : score === 4 ? "GOED"
          : "UITSTEKEND",
        notitie: NOTITIE_PER_SCORE[score],
        aandachtspunten: AANDACHT_PER_SCORE[score] ?? [],
        anoniem: false,
        createdAt,
      },
    });
    gemaakt++;
    console.log(`  ${v.naam}: ${score}/5 ${score <= 2 ? "⚠ aandacht" : ""}`);
  }

  console.log(`\n${gemaakt} welzijnschecks aangemaakt (${zonderCheck} vrijwilligers zonder check).`);
  console.log("Bekijk ze op /coordinator/welzijnscheck");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
