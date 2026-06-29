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

  const organisatie = await prisma.organisatie.upsert({
    where: { id: "org_meerwende" },
    update: {},
    create: { id: "org_meerwende", naam: "De Meerwende", plaats: "Badhoevedorp" },
  });
  console.log(`Organisatie: ${organisatie.naam}`);

  const testGebruikers = [
    { email: "coordinator@demeerwende.nl", naam: "Petra van den Berg", rol: "COORDINATOR" as const },
    { email: "vrijwilliger@demeerwende.nl", naam: "Jan de Vries", rol: "VRIJWILLIGER" as const },
    { email: "familie@example.nl", naam: "Maria Jansen", rol: "FAMILIE" as const },
  ];

  const gemaakteGebruikers: Record<string, string> = {};

  for (const g of testGebruikers) {
    const user = await prisma.user.upsert({
      where: { email: g.email },
      update: {},
      create: { email: g.email, name: g.naam, emailVerified: new Date() },
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

  // Drie bewoners
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
    prisma.bewoner.upsert({
      where: { id: "bew_corrie" },
      update: {},
      create: {
        id: "bew_corrie",
        naam: "Corrie van Dijk",
        organisatieId: organisatie.id,
        toestemmingFotos: true,
        toestemmingDoor: "Ellen van Dijk (dochter)",
        toestemmingDatum: new Date("2025-03-02"),
      },
    }),
  ]);
  console.log(`Bewoners: ${bewoners.map((b) => b.naam).join(", ")}`);

  // Familie koppeling: Maria → Annie
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

  // Activiteiten — verspreid over de afgelopen weken
  const vrijwilligerId = gemaakteGebruikers["VRIJWILLIGER"];
  const nu = new Date();
  const dagenGeleden = (n: number) => new Date(nu.getTime() - n * 24 * 60 * 60 * 1000);

  const activiteiten = [
    { bewonerId: bewoners[0].id, type: "Wandelen",      duurMinuten: 45, notities: "Heerlijk weer, langs het park gewandeld. Annie was erg blij.", createdAt: dagenGeleden(1) },
    { bewonerId: bewoners[0].id, type: "Koffiedrinken", duurMinuten: 30, notities: "Gezellig bijgekletst over vroeger.", createdAt: dagenGeleden(4) },
    { bewonerId: bewoners[0].id, type: "Spelletjes",    duurMinuten: 60, notities: "Scrabble gespeeld, Annie won met grote voorsprong!", createdAt: dagenGeleden(8) },
    { bewonerId: bewoners[1].id, type: "Spelletjes",    duurMinuten: 60, notities: "Mens erger je niet. Henk won elke ronde.", createdAt: dagenGeleden(2) },
    { bewonerId: bewoners[1].id, type: "Lezen",         duurMinuten: 45, notities: "Voorgelezen uit de krant, nieuws besproken.", createdAt: dagenGeleden(6) },
    { bewonerId: bewoners[2].id, type: "Wandelen",      duurMinuten: 30, notities: "Kort rondje door de tuin, Corrie had veel zin.", createdAt: dagenGeleden(3) },
    { bewonerId: bewoners[2].id, type: "Muziek",        duurMinuten: 45, notities: "Liedjes uit de jaren 60 gezongen. Prachtige middag.", createdAt: dagenGeleden(7) },
    { bewonerId: bewoners[2].id, type: "Gezelschap",    duurMinuten: 60, notities: "Fotoalbums doorgekeken en verhalen gedeeld.", createdAt: dagenGeleden(12) },
  ];

  // Verwijder bestaande activiteiten zodat we geen duplicaten krijgen
  await prisma.activiteit.deleteMany({
    where: { vrijwilligerId },
  });

  for (const a of activiteiten) {
    await prisma.activiteit.create({ data: { ...a, vrijwilligerId } });
  }
  console.log(`${activiteiten.length} activiteiten aangemaakt`);

  console.log("\nSeed voltooid! Testaccounts:");
  console.log("  Coördinator:  coordinator@demeerwende.nl");
  console.log("  Vrijwilliger: vrijwilliger@demeerwende.nl");
  console.log("  Familie:      familie@example.nl");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
