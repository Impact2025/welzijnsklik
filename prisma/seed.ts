import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Organisatie
  const organisatie = await prisma.organisatie.upsert({
    where: { id: "org_meerwende" },
    update: {},
    create: {
      id: "org_meerwende",
      naam: "De Meerwende",
      plaats: "Badhoevedorp",
    },
  });
  console.log(`Organisatie: ${organisatie.naam}`);

  // Auth Users + Gebruikers
  const testGebruikers = [
    {
      email: "coordinator@demeerwende.nl",
      naam: "Petra van den Berg",
      rol: "COORDINATOR" as const,
    },
    {
      email: "vrijwilliger@demeerwende.nl",
      naam: "Jan de Vries",
      rol: "VRIJWILLIGER" as const,
    },
    {
      email: "familie@example.nl",
      naam: "Maria Jansen",
      rol: "FAMILIE" as const,
    },
  ];

  const gemaakteGebruikers: Record<string, string> = {};

  for (const g of testGebruikers) {
    const user = await prisma.user.upsert({
      where: { email: g.email },
      update: {},
      create: {
        email: g.email,
        name: g.naam,
        emailVerified: new Date(),
      },
    });

    const gebruiker = await prisma.gebruiker.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        naam: g.naam,
        email: g.email,
        rol: g.rol,
        organisatieId: organisatie.id,
        userId: user.id,
      },
    });

    gemaakteGebruikers[g.rol] = gebruiker.id;
    console.log(`  ${g.rol}: ${g.naam} (${g.email})`);
  }

  // Bewoners
  const bewoners = await Promise.all([
    prisma.bewoner.upsert({
      where: { id: "bew_annie" },
      update: {},
      create: {
        id: "bew_annie",
        naam: "Annie Smits",
        organisatieId: organisatie.id,
        toestemmingFotos: true,
        toestemmingDoor: "Kees Smits (zoon)",
        toestemmingDatum: new Date("2025-01-15"),
      },
    }),
    prisma.bewoner.upsert({
      where: { id: "bew_henk" },
      update: {},
      create: {
        id: "bew_henk",
        naam: "Henk Bakker",
        organisatieId: organisatie.id,
        toestemmingFotos: false,
      },
    }),
  ]);
  console.log(`Bewoners: ${bewoners.map((b) => b.naam).join(", ")}`);

  // Familie koppeling
  await prisma.familieKoppeling.upsert({
    where: { id: "kop_maria_annie" },
    update: {},
    create: {
      id: "kop_maria_annie",
      bewonerId: bewoners[0].id,
      gebruikerId: gemaakteGebruikers["FAMILIE"],
      relatie: "dochter",
    },
  });

  // Voorbeeld activiteiten
  const vrijwilligerId = gemaakteGebruikers["VRIJWILLIGER"];
  const activiteiten = [
    {
      bewonerId: bewoners[0].id,
      type: "Wandelen",
      duurMinuten: 45,
      notities: "Heerlijk weer, langs het park gewandeld.",
    },
    {
      bewonerId: bewoners[0].id,
      type: "Koffiedrinken",
      duurMinuten: 30,
      notities: "Gezellig bijgekletst over vroeger.",
    },
    {
      bewonerId: bewoners[1].id,
      type: "Spelletjes",
      duurMinuten: 60,
      notities: "Mens erger je niet, Henk won!",
    },
  ];

  for (const a of activiteiten) {
    await prisma.activiteit.create({
      data: { ...a, vrijwilligerId },
    });
  }
  console.log(`${activiteiten.length} activiteiten aangemaakt`);

  console.log("\nSeed voltooid!");
  console.log("\nTestaccounts (log in via magic link):");
  console.log("  Coördinator: coordinator@demeerwende.nl");
  console.log("  Vrijwilliger: vrijwilliger@demeerwende.nl");
  console.log("  Familie:      familie@example.nl");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
