import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Demo fotos — twee images uit downloads folder
const DEMO_FOTOS = [
  "/gebeurtenissen/demo-bewoner-rollator.png",  // oude man in rolstoel
  "/gebeurtenissen/demo-vrijwilliger-knutselen.png", // vrijwilliger knutselen
  "https://images.unsplash.com/photo-1552083974-9732d1e8e1a7?w=400&q=80",   // bos/wandeling
  "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&q=80", // koffie/thee
  "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&q=80", // puzzel/spel
];

async function main() {
  console.log("Seeding database...");

  const organisatie = await prisma.organisatie.upsert({
    where: { id: "org_meerwende" },
    update: {},
    create: { id: "org_meerwende", naam: "De Meerwende", plaats: "Badhoevedorp" },
  });
  console.log(`Organisatie: ${organisatie.naam}`);

  const testGebruikers = [
    { email: "coordinator@demeerwende.nl", naam: "Virginia van Munster", rol: "COORDINATOR" as const },
    { email: "vrijwilliger@demeerwende.nl", naam: "Roderik Smits", rol: "VRIJWILLIGER" as const },
    { email: "familie@example.nl", naam: "Jolanda Kamoschinski", rol: "FAMILIE" as const },
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

  // Drie bewoners met demo foto's
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

  // Familie koppeling: Maria (dochter) → Annie
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

  // Activiteiten — verspreid over de afgelopen weken, met foto's waar toestemming is
  // MET de twee demo images
  const vrijwilligerId = gemaakteGebruikers["VRIJWILLIGER"];
  const nu = new Date();
  const dagenGeleden = (n: number) => new Date(nu.getTime() - n * 24 * 60 * 60 * 1000);
  const urenGeleden = (h: number) => new Date(nu.getTime() - h * 60 * 60 * 1000);

  const activiteitenData = [
    // Annie (toestemming: ja) — MET demo rollator image
    { bewonerId: bewoners[0].id, type: "Wandelen", duurMinuten: 45, notities: "Heerlijk weer, langs het park gewandeld. Annie was erg blij. Deze foto toont hoe Roderik haar zorgvuldig naar buiten duwt - ze lachte alsof ze 20 was.", fotoUrl: DEMO_FOTOS[0], createdAt: urenGeleden(5) },
    { bewonerId: bewoners[0].id, type: "Knutselen", duurMinuten: 90, notities: "Kerstkaartjes maken. Annie was creatief als altijd en maakte een prachtige griffel uit katoenen velletjes. We genoten samen met koffie.", fotoUrl: DEMO_FOTOS[1], createdAt: dagenGeleden(1) },
    { bewonerId: bewoners[0].id, type: "Koffiedrinken", duurMinuten: 30, notities: "Gezellig bijgekletst over vroeger. Annie haar bakrecepten gedeeld.", createdAt: dagenGeleden(3) },
    { bewonerId: bewoners[0].id, type: "Spelletjes", duurMinuten: 60, notities: "Scrabble gespeeld. Annie won met grote voorsprong! Ze heeft een verrassend grote woordenschat.", createdAt: dagenGeleden(6) },
    { bewonerId: bewoners[0].id, type: "Muziek", duurMinuten: 45, notities: "Samen naar André Hazes geluisterd. Annie zong uit volle borst mee.", createdAt: dagenGeleden(10) },
    { bewonerId: bewoners[0].id, type: "Wandelen", duurMinuten: 50, notities: "Rondje door het dorp, even bij de kerk langs geweest.", createdAt: dagenGeleden(14) },

    // Henk (toestemming: nee) — geen foto's
    { bewonerId: bewoners[1].id, type: "Spelletjes", duurMinuten: 60, notities: "Mens erger je niet. Henk won elke ronde en lachte er vrolijk bij.", createdAt: urenGeleden(24) },
    { bewonerId: bewoners[1].id, type: "Lezen", duurMinuten: 45, notities: "Voorgelezen uit de krant. Henk vond het sportnieuws het interessantst.", createdAt: dagenGeleden(5) },
    { bewonerId: bewoners[1].id, type: "Koffiedrinken", duurMinuten: 30, notities: "Dropkes gegeten bij de koffie. Henk vertelde over zijn tijd bij de marine.", createdAt: dagenGeleden(9) },
    { bewonerId: bewoners[1].id, type: "Gezelschap", duurMinuten: 90, notities: "Samen oude fotoalbums bekeken. Henk wees al zijn familieleden aan.", createdAt: dagenGeleden(15) },

    // Corrie (toestemming: ja)
    { bewonerId: bewoners[2].id, type: "Wandelen", duurMinuten: 30, notities: "Kort rondje door de tuin. Corrie had veel zin en genoot van de bloemen.", createdAt: urenGeleden(48) },
    { bewonerId: bewoners[2].id, type: "Muziek", duurMinuten: 45, notities: "Liedjes uit de jaren 60 gezongen. Corrie kende alle teksten nog uit haar hoofd.", createdAt: dagenGeleden(4) },
    { bewonerId: bewoners[2].id, type: "Gezelschap", duurMinuten: 60, notities: "Fotoalbums doorgekeken en verhalen gedeeld over de kinderen.", createdAt: dagenGeleden(8) },
    { bewonerId: bewoners[2].id, type: "Spelletjes", duurMinuten: 45, notities: "Rummikub gespeeld. Corrie was scherp en won twee rondes.", createdAt: dagenGeleden(12) },
    { bewonerId: bewoners[2].id, type: "Koffiedrinken", duurMinuten: 30, notities: "Lekker gebak gegeten bij de koffie. Corrie vertelde over vroeger.", createdAt: dagenGeleden(16) },
  ];

  // Verwijder bestaande activiteiten + reacties
  await prisma.reactie.deleteMany({
    where: { activiteit: { vrijwilligerId } },
  });
  await prisma.activiteit.deleteMany({
    where: { vrijwilligerId },
  });

  const aangemaakteActiviteiten: { id: string; type: string; bewonerNaam: string }[] = [];

  for (const a of activiteitenData) {
    const act = await prisma.activiteit.create({
      data: {
        bewonerId: a.bewonerId,
        vrijwilligerId,
        type: a.type,
        duurMinuten: a.duurMinuten,
        notities: a.notities,
        fotoUrl: a.fotoUrl ?? null,
        createdAt: a.createdAt,
      },
      select: { id: true, type: true, bewoner: { select: { naam: true } } },
    });
    aangemaakteActiviteiten.push({ id: act.id, type: act.type, bewonerNaam: act.bewoner.naam });
  }
  console.log(`${activiteitenData.length} activiteiten aangemaakt`);

  // ─── Reacties (emoji + berichten) van Maria (familie) ────────────
  const familieId = gemaakteGebruikers["FAMILIE"];

  // Zoek de activiteiten die bij Annie horen (bew_annie)
  const annieActiviteiten = aangemaakteActiviteiten.filter(
    (a) => a.bewonerNaam === "Annie Smits"
  );

  if (annieActiviteiten.length >= 5) {
    // Reacties op de wandel-activiteit (vandaag) met rollator foto
    await prisma.reactie.create({
      data: {
        activiteitId: annieActiviteiten[0].id,
        gebruikerId: familieId,
        emoji: "❤️",
        bericht: "Wat fijn dat jullie zo'n mooie wandeling hadden! Deze foto toont papa zo levendig. Ik herinner me nog hoe hij altijd zo enthousiast was over bloemen in het park.",
        createdAt: urenGeleden(3),
      },
    });
    await prisma.reactie.create({
      data: {
        activiteitId: annieActiviteiten[0].id,
        gebruikerId: familieId,
        emoji: "😊",
        createdAt: urenGeleden(3),
      },
    });
    console.log(`  Reacties op "${annieActiviteiten[0].type}" (Annie)`);

    // Reacties op knutselen
    await prisma.reactie.create({
      data: {
        activiteitId: annieActiviteiten[1].id,
        gebruikerId: familieId,
        emoji: "❤️",
        bericht: "Mama stuipen naar creatieve activiteiten! Zij maakte zo vroeger ook altijd knutselwerkjes voor het koffiehuis.",
        createdAt: dagenGeleden(1),
      },
    });
    await prisma.reactie.create({
      data: {
        activiteitId: annieActiviteiten[1].id,
        gebruikerId: familieId,
        emoji: "👍",
        createdAt: dagenGeleden(1),
      },
    });
    console.log(`  Reacties op "${annieActiviteiten[1].type}" (Annie)`);

    // Reacties op koffiedrinken
    await prisma.reactie.create({
      data: {
        activiteitId: annieActiviteiten[2].id,
        gebruikerId: familieId,
        emoji: "❤️",
        createdAt: dagenGeleden(2),
      },
    });
    await prisma.reactie.create({
      data: {
        activiteitId: annieActiviteiten[2].id,
        gebruikerId: familieId,
        emoji: "👍",
        createdAt: dagenGeleden(2),
      },
    });
    console.log(`  Reacties op "${annieActiviteiten[2].type}" (Annie)`);

    // Reacties op spelletjes
    await prisma.reactie.create({
      data: {
        activiteitId: annieActiviteiten[3].id,
        gebruikerId: familieId,
        emoji: "🎉",
        bericht: "Haha Scrabble, dat was altijd haar favoriet! Ze liet er vroeger ook niets van heel bij ons. Trots op haar!",
        createdAt: dagenGeleden(5),
      },
    });
    await prisma.reactie.create({
      data: {
        activiteitId: annieActiviteiten[3].id,
        gebruikerId: familieId,
        emoji: "🔥",
        createdAt: dagenGeleden(5),
      },
    });
    console.log(`  Reacties op "${annieActiviteiten[3].type}" (Annie)`);

    // Simpele emoji op muziek
    await prisma.reactie.create({
      data: {
        activiteitId: annieActiviteiten[4].id,
        gebruikerId: familieId,
        emoji: "❤️",
        createdAt: dagenGeleden(9),
      },
    });
    console.log(`  Reactie op "${annieActiviteiten[4].type}" (Annie)`);
  }

  // Wervingsinteresse van Jolanda om te helpen
  await prisma.wervingsinteresse.upsert({
    where: { id: "werving_maria" },
    update: {},
    create: {
      id: "werving_maria",
      gebruikerId: familieId,
      bericht: "Ik zou graag af en toe willen helpen met wandelen met mijn moeder of andere bewoners. Ik ben overdag meestal beschikbaar.",
      status: "nieuw",
    },
  });
  console.log("  Wervingsinteresse van Jolanda aangemaakt");

  console.log("\nSeed voltooid! Testaccounts:");
  console.log("  Coordinator:  coordinator@demeerwende.nl");
  console.log("  Vrijwilliger: vrijwilliger@demeerwende.nl");
  console.log("  Familie:      familie@example.nl");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
