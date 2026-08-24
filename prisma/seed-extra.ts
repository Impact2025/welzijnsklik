import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Hulpdata ────────────────────────────────────────────────────────────
const VOORNAMEN = [
  "Anna", "Pieter", "Maria", "Johan", "Sofie", "Theo", "Betsie", "Klaas",
  "Helena", "Wim", "Grietje", "Bram", "Lena", "Dirk", "Tiny", "Frans",
  "Mies", "Gerrit", "Nellie", "Bert", "Sara", "Henri", "Ria", "Jan",
  "Truus", "Anton", "Bep", "Leo", "Ada", "Coen",
];
const ACHTERNAMEN = [
  "de Vries", "Jansen", "Bakker", "Visser", "Smit", "Meijer", "Mulder",
  "de Boer", "Dijkstra", "Bos", "Vos", "Hendriks", "Willems", "Maas",
  "van der Berg", "Kok", "Brouwer", "de Groot", "Schouten", "Dekker",
];
const ACTIVITEIT_TYPES = [
  "Wandelen", "Koffiedrinken", "Gezelschap", "Spelletjes",
  "Lezen", "Muziek", "Boodschappen", "Anders",
];
const FOTO_POOL = [
  "https://images.unsplash.com/photo-1552083974-9732d1e8e1a7?w=400&q=80",
  "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&q=80",
  "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&q=80",
];
const KAMERS = ["A101", "A102", "B201", "B202", "B203", "C301", "C302", "C303", "D401", "D402", "E501", "E502"];
const BESCHIKBAARHEID = [
  "Weekdagen overdag", "Weekenden", "Doordeweeks avonden",
  "Maandag & donderdag", "Flexibel overdag", "Woensdagochtend",
];
const MOTIVATIES = [
  "Ik vind het fijn om iets terug te doen voor de buurt en luister graag naar verhalen van vroeger.",
  "Mijn eigen ouders hebben ook in een woonzorgcentrum gewoond; ik weet hoe waardevol een praatje is.",
  "Ik heb tijd over sinds mijn pensioen en wil die zinvol besteden.",
  "Samen activiteiten doen geeft mij net zoveel energie als de bewoners.",
  "Ik studeer zorg en wil graag ervaring opdoen buiten de stage.",
];
const ERVARING = [
  "Eerder vrijwilliger geweest bij een buurthuis; veel ervaring met spelletjes en voorlezen.",
  "Geen formele zorgervaring, wel jarenlang mantelzorger voor mijn partner.",
  "Werkzaam geweest in de thuiszorg, bekend met rollators en rolstoelen.",
  "Actief bij een bridgeclub; kan goed Rummikub en Mens erger je niet uitleggen.",
  "",
];

// Hulpvraag-sjablonen (titel, type-activiteit, duurMinuten, aantalNodig, status)
type Hv = { titel: string; type: string; duur: number; nodig: number; oms: string; status: "open" | "in_behandeling" | "gesloten" };
const HULPVRAAG_TEMPLATES: Hv[] = [
  { titel: "Wandeling in het park", type: "Wandelen", duur: 60, nodig: 2, status: "open",
    oms: "Een bewoner wil graag een keer per week een rustige wandeling maken in het park. Er is begeleiding met een rollator nodig." },
  { titel: "Samen koffiedrinken", type: "Koffiedrinken", duur: 45, nodig: 1, status: "open",
    oms: "Gezellige koffiemiddag op de afdeling. Vrijwilliger die een praatje maakt en koffie inschenkt is welkom." },
  { titel: "Voorlezen uit de krant", type: "Lezen", duur: 30, nodig: 1, status: "in_behandeling",
    oms: "Een bewoner met slechte ogen wil graag dat iemand voorleest uit de lokale krant of een tijdschrift." },
  { titel: "Muziekochtend organiseren", type: "Muziek", duur: 90, nodig: 2, status: "open",
    oms: "We zoeken vrijwilligers die een muziekochtend willen begeleiden: liedjes draaien, meezingen en instrumenten uitdelen." },
  { titel: "Boodschappen begeleiden", type: "Boodschappen", duur: 60, nodig: 1, status: "open",
    oms: "Begeleiding bij een bezoek aan de supermarkt om kleine boodschappen te doen. Rolstoeltoegankelijk." },
  { titel: "Gezelschap bij het avondeten", type: "Gezelschap", duur: 60, nodig: 2, status: "open",
    oms: "Een eenzame bewoner zou graag gezelschap hebben tijdens het avondeten, gewoon even praten over de dag." },
  { titel: "Schaak- en spelletjesmiddag", type: "Spelletjes", duur: 120, nodig: 3, status: "in_behandeling",
    oms: "We organiseren een spelletjesmiddag met schaken, Rummikub en Mens erger je niet. Extra handen zijn welkom." },
  { titel: "Tuinonderhoud samen doen", type: "Anders", duur: 90, nodig: 2, status: "open",
    oms: "In de binnentuin onkruid wieden en planten verzorgen, samen met een bewoner die van tuinieren houdt." },
  { titel: "Fietstocht met duofiets", type: "Wandelen", duur: 60, nodig: 2, status: "open",
    oms: "Een bewoner wil graag een rondje op de duofiets. Twee vrijwilligers voor stabiliteit en gezelligheid." },
  { titel: "Knutselworkshop", type: "Anders", duur: 90, nodig: 2, status: "open",
    oms: "Wekelijkse knutselworkshop (kaarten, bloemen van papier). Vrijwilliger die handig is met materialen gevraagd." },
  { titel: "Kamergesprekje voor een stille bewoner", type: "Gezelschap", duur: 30, nodig: 1, status: "open",
    oms: "Een bewoner die weinig praat zoekt toch af en toe een rustig moment met iemand die er gewoon is." },
  { titel: "Kerkbezoek begeleiden", type: "Wandelen", duur: 90, nodig: 1, status: "open",
    oms: "Begeleiding naar de zondagse kerkdienst in het dorp, inclusief rolstoel en terugweg." },
  { titel: "Gezamenlijke filmavond", type: "Gezelschap", duur: 120, nodig: 2, status: "open",
    oms: "Een filmavond in de huiskamer. Iemand die de beamer bedient en koffie/thee rondbrengt is welkom." },
  { titel: "Breien en haken", type: "Anders", duur: 60, nodig: 1, status: "in_behandeling",
    oms: "Een bewoner wil graag weer leren breien. Een geduldige vrijwilliger die het voordoet is gevraagd." },
  { titel: "Bezoek aan het museum", type: "Wandelen", duur: 120, nodig: 2, status: "open",
    oms: "Uitstapje naar het lokale museum. Twee begeleiders voor rolstoel en gezelligheid." },
  { titel: "Taart bakken met bewoners", type: "Koffiedrinken", duur: 90, nodig: 2, status: "open",
    oms: "Samen appeltaart bakken in de gemeenschappelijke keuken. Lekker en gezellig, inclusief opruimen." },
  { titel: "Brieven schrijven naar familie", type: "Lezen", duur: 45, nodig: 1, status: "open",
    oms: "Een bewoner wil graag brieven aan kleinkinderen dicteren. Vrijwilliger noteert en plakt de postzegel." },
  { titel: "Yoga voor ouderen", type: "Anders", duur: 45, nodig: 1, status: "gesloten",
    oms: "Zachte stoelyoga op de afdeling. Een vrijwilliger met ervaring in ontspanningsoefeningen gezocht." },
];

const NOTITIE: Record<string, string> = {
  Wandelen: "Een heerlijk rondje gemaakt, de bewoner genoot van de frisse lucht en de bloemen onderweg.",
  Koffiedrinken: "Gezellig bijgekletst bij een kop koffie en een koekje. Veel gelachen om verhalen uit het verleden.",
  Gezelschap: "Samen fotoalbums bekeken en herinneringen gedeeld. Een rustig, waardevol uurtje.",
  Spelletjes: "Rummikub gespeeld. De bewoner was scherp en won met een mooie combinatie.",
  Lezen: "Voor gelezen uit de krant. De bewoner vond het sportkatern het leukst.",
  Muziek: "Liedjes uit vroeger jaren gezongen. De bewoner kende alle teksten nog uit het hoofd.",
  Boodschappen: "Samen kleine boodschappen gedaan in de buurtwinkel. Gezellig en praktisch tegelijk.",
  Anders: "Gezellige activiteit met de bewoner, afgestemd op diens interesses.",
};

function pick<T>(arr: T[], i: number): T {
  return arr[((i % arr.length) + arr.length) % arr.length];
}

async function main() {
  console.log("Seeding extra demo content (reset + nieuw)...");

  const organisatie = await prisma.organisatie.upsert({
    where: { id: "org_meerwende" },
    update: {},
    create: { id: "org_meerwende", naam: "De Meerwende", plaats: "Badhoevedorp" },
  });
  const orgId = organisatie.id;

  // Coordinator voor aangemaaktDoor
  const coordinator = await prisma.gebruiker.findFirst({
    where: { rol: "COORDINATOR", organisatieId: orgId },
  });
  const aangemaaktDoor = coordinator?.id ?? orgId;

  const nu = new Date();
  const startMaand = new Date(nu.getFullYear(), nu.getMonth(), 1);
  const dagVanMaand = (offset: number) =>
    new Date(startMaand.getFullYear(), startMaand.getMonth(), offset);

  // ─── Reset eerdere demo-rows (idempotent opnieuw vullen) ─────────────
  console.log("  Oude demo-rows verwijderen...");
  await prisma.activiteit.deleteMany({
    where: { id: { startsWith: "act_extra_" } },
  });
  await prisma.activiteit.deleteMany({
    where: { id: { startsWith: "act_aandacht_" } },
  });
  await prisma.hulpGevraagd.deleteMany({
    where: { id: { startsWith: "hulp_extra_" } },
  });
  await prisma.gebruiker.deleteMany({
    where: { email: { endsWith: "@demo.nl" } },
  });
  await prisma.user.deleteMany({
    where: { email: { endsWith: "@demo.nl" } },
  });
  await prisma.bewoner.deleteMany({
    where: { id: { startsWith: "bew_extra_" }, organisatieId: orgId },
  });
  // ─── Ook de "aandacht nodig" demo-bewoners resetten ─────────────────────
  await prisma.activiteit.deleteMany({
    where: { bewoner: { organisatieId: orgId, id: { startsWith: "bew_aandacht_" } } },
  });
  await prisma.aandachtOppak.deleteMany({
    where: { organisatieId: orgId, bewoner: { id: { startsWith: "bew_aandacht_" } } },
  });
  await prisma.bewoner.deleteMany({
    where: { id: { startsWith: "bew_aandacht_" }, organisatieId: orgId },
  });

  // ─── 15 BEWONERS ─────────────────────────────────────────────────────
  const bewonerIds: string[] = [];
  for (let i = 0; i < 15; i++) {
    const id = `bew_extra_${i + 1}`;
    const naam = `${pick(VOORNAMEN, i * 2)} ${pick(ACHTERNAMEN, i * 3)}`;
    const toestemming = i % 4 !== 0; // ~75% toestemming
    const geb = new Date(1935 + (i * 3) % 40, (i * 5) % 12, (i * 7) % 27 + 1);
    await prisma.bewoner.create({
      data: {
        id,
        naam,
        organisatieId: orgId,
        kamer: pick(KAMERS, i),
        geboortedatum: geb,
        notities: `Demo bewoner ${i + 1}. Woont op kamer ${pick(KAMERS, i)}. ${toestemming ? "Staat foto's toe." : "Geen toestemming voor foto's."}`,
        toestemmingFotos: toestemming,
        toestemmingDoor: toestemming ? `${pick(VOORNAMEN, i * 2 + 1)} (familie)` : null,
        toestemmingDatum: toestemming ? new Date(2025, (i * 4) % 12, (i * 3) % 27 + 1) : null,
      },
    });
    bewonerIds.push(id);
  }
  console.log(`Bewoners: ${bewonerIds.length} aangemaakt`);

  // ─── 20 VRIJWILLIGERS ────────────────────────────────────────────────
  const vrijwilligerIds: string[] = [];
  for (let i = 0; i < 20; i++) {
    const email = `vrijwilliger${i + 1}@demo.nl`;
    const naam = `${pick(VOORNAMEN, i * 3 + 1)} ${pick(ACHTERNAMEN, i * 2 + 1)}`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: naam, emailVerified: new Date() },
    });
    const g = await prisma.gebruiker.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        id: `geb_extra_${i + 1}`,
        naam,
        email,
        rol: "VRIJWILLIGER" as const,
        organisatieId: orgId,
        userId: user.id,
        telefoon: `06-${String(10000000 + i * 123457).slice(0, 8)}`,
        voorkeurActiviteiten: Array.from(
          new Set([pick(ACTIVITEIT_TYPES, i), pick(ACTIVITEIT_TYPES, i + 5)])
        ),
        beschikbaarheid: pick(BESCHIKBAARHEID, i),
        ervaring: pick(ERVARING, i),
        motivatie: pick(MOTIVATIES, i),
        vogStatus: i % 5 === 0 ? "aanvraag_lopen" : "heeft",
      },
    });
    vrijwilligerIds.push(g.id);
  }
  console.log(`Vrijwilligers: ${vrijwilligerIds.length} aangemaakt`);

  // ─── 3 BEWONERS MET "AANDACHT NODIG" (rood) ─────────────────────────────
  // Deze bewoners hebben genoeg baseline-activiteiten (eigen ritme ~2x/week)
  // maar GEEN activiteiten in de recente 14 dagen, en hun laatste activiteit
  // is 15+ dagen geleden. → status "rood" (Aandacht nodig) in /coordinator/aandacht.
  const aandachtBewoners = [
    { id: "bew_aandacht_1", naam: "Willem de Vries",  kamer: "A102" },
    { id: "bew_aandacht_2", naam: "Hendrika Bos",     kamer: "B201" },
    { id: "bew_aandacht_3", naam: "Jan van Driel",    kamer: "B202" },
  ];

  for (const b of aandachtBewoners) {
    const bew = await prisma.bewoner.upsert({
      where: { id: b.id },
      update: { naam: b.naam, kamer: b.kamer },
      create: {
        id: b.id,
        naam: b.naam,
        organisatieId: orgId,
        kamer: b.kamer,
        notities: `${b.naam} woont op kamer ${b.kamer}. De laatste tijd weinig activiteiten — aandacht nodig!`,
        toestemmingFotos: false,
      },
    });
    // Baseline-activiteiten: 8 activiteiten verdeeld over 4 weken (~2x/week)
    // ALLEMAAL 16-30 dagen geleden, zodat de recente 14-dagen-periode leeg is.
    for (let i = 0; i < 8; i++) {
      const dagGeleden = 16 + i * 2; // 16, 18, 20, 22, 24, 26, 28, 30 dagen geleden
      const createdAt = new Date(nu.getTime() - dagGeleden * 24 * 60 * 60 * 1000);
      const type = ["Wandelen", "Koffiedrinken", "Gezelschap", "Spelletjes", "Lezen"][i % 5];
      const vrijId = pick(vrijwilligerIds, i * 3);
      await prisma.activiteit.create({
        data: {
          id: `act_aandacht_${b.id}_${i + 1}`,
          bewonerId: bew.id,
          vrijwilligerId: vrijId,
          type,
          duurMinuten: pick([30, 45, 60, 90], i),
          notities: NOTITIE[type] ?? NOTITIE.Anders,
          createdAt,
        },
      });
    }
  }
  console.log(`  Aandacht-nodig bewoners: ${aandachtBewoners.length} aangemaakt (8 activiteiten in baseline-periode, 0 de laatste 14 dagen)`);

  // ─── 1 BEWONER "OPGEPAKT" (rood, gemarkeerd door vrijwilliger) ────────────
  // Identiek patroon als de rood-bewoners hierboven, maar met een aandachtOppak-record
  // zodat de UI-status "opgepakt" (blauw) toont in plaats van "aandacht nodig" (rood).
  const opgepaktBewoner = await prisma.bewoner.upsert({
    where: { id: "bew_aandacht_opgepakt" },
    update: { naam: "Piet Jansen", kamer: "C303" },
    create: {
      id: "bew_aandacht_opgepakt",
      naam: "Piet Jansen",
      organisatieId: orgId,
      kamer: "C303",
      notities: "Piet heeft een week niet gehad. Roderik heeft het opgepakt.",
      toestemmingFotos: false,
    },
  });
  for (let i = 0; i < 8; i++) {
    const dagGeleden = 16 + i * 2;
    const createdAt = new Date(nu.getTime() - dagGeleden * 24 * 60 * 60 * 1000);
    const type = ["Wandelen", "Koffiedrinken", "Gezelschap", "Spelletjes", "Lezen"][i % 5];
    await prisma.activiteit.create({
      data: {
        id: `act_aandacht_opgepakt_${i + 1}`,
        bewonerId: opgepaktBewoner.id,
        vrijwilligerId: pick(vrijwilligerIds, (i + 1) * 3),
        type,
        duurMinuten: pick([30, 45, 60, 90], i),
        notities: NOTITIE[type] ?? NOTITIE.Anders,
        createdAt,
      },
    });
  }
  // Markeer als opgepakt door de demo-vrijwilliger (Roderik Smits, user id 2)
  const opgepaktVrijwilliger = await prisma.gebruiker.findFirst({
    where: { email: "vrijwilliger@demeerwende.nl", organisatieId: orgId },
  });
  if (opgepaktVrijwilliger) {
    await prisma.aandachtOppak.create({
      data: {
        organisatieId: orgId,
        bewonerId: opgepaktBewoner.id,
        gebruikerId: opgepaktVrijwilliger.id,
        notitie: "Aangesteld om deze week een wandeling te maken samen.",
      },
    });
  }
  console.log(`  Opgepakte bewoner: Piet Jansen (C303) aangemaakt`);

  // ─── 1 BEWONER "NIEUW" (minder dan minActiviteiten → status "nieuw") ─────
  const nieuwBewoner = await prisma.bewoner.upsert({
    where: { id: "bew_aandacht_nieuw" },
    update: { naam: "Lotte van Driel", kamer: "D402" },
    create: {
      id: "bew_aandacht_nieuw",
      naam: "Lotte van Driel",
      organisatieId: orgId,
      kamer: "D402",
      notities: "Nieuwe bewoner, net binnen. Nog geen vast ritme.",
      toestemmingFotos: true,
    },
  });
  // Slechts 2 activiteiten — onder het minActiviteiten-drempel (3) → "nieuw"
  for (let i = 0; i < 2; i++) {
    const dagGeleden = 5 + i * 3; // 5 en 8 dagen geleden (binnen recente 14 dagen)
    const createdAt = new Date(nu.getTime() - dagGeleden * 24 * 60 * 60 * 1000);
    const type = ["Koffiedrinken", "Gezelschap"][i];
    await prisma.activiteit.create({
      data: {
        id: `act_aandacht_nieuw_${i + 1}`,
        bewonerId: nieuwBewoner.id,
        vrijwilligerId: pick(vrijwilligerIds, (i + 5) * 3),
        type,
        duurMinuten: 45,
        notities: NOTITIE[type] ?? NOTITIE.Anders,
        createdAt,
      },
    });
  }
  console.log(`  Nieuwe bewoner: Lotte van Driel (D402) aangemaakt (2 activiteiten → status "nieuw")`);

  // ─── ~55 ACTIVITEITEN verspreid over de hele maand ───────────────────
  const typeSeq = ["Wandelen", "Koffiedrinken", "Gezelschap", "Spelletjes", "Lezen", "Muziek", "Boodschappen", "Anders"];
  const activiteitenPerDag: number[] = [1, 0, 1, 0, 2, 1, 2, 0, 1, 2, 1, 0, 2, 1, 1, 2, 0, 1, 2, 1, 1, 0, 2, 1, 1, 2, 0, 1, 2, 1, 1, 2, 2, 1, 0, 2, 1, 1, 2, 0, 1, 2, 1, 1, 2, 0, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1];
  let actNr = 0;
  for (let dag = 1; dag <= activiteitenPerDag.length; dag++) {
    const aantal = activiteitenPerDag[dag - 1];
    for (let k = 0; k < aantal; k++) {
      actNr++;
      const type = typeSeq[actNr % typeSeq.length];
      const bewonerId = pick(bewonerIds, actNr);
      const vrijwilligerId = pick(vrijwilligerIds, actNr * 2);
      const bewoner = await prisma.bewoner.findUnique({
        where: { id: bewonerId },
        select: { toestemmingFotos: true },
      });
      const fotoUrl =
        bewoner?.toestemmingFotos && ["Wandelen", "Koffiedrinken", "Anders", "Gezelschap"].includes(type)
          ? pick(FOTO_POOL, actNr)
          : null;
      // Spreid over de dag: ochtend/middag/avond
      const uur = 9 + ((actNr * 3) % 9);
      const createdAt = new Date(dagVanMaand(dag).getTime() + uur * 60 * 60 * 1000);
      await prisma.activiteit.create({
        data: {
          id: `act_extra_${actNr}`,
          bewonerId,
          vrijwilligerId,
          type,
          duurMinuten: pick([30, 45, 60, 90], actNr),
          notities: NOTITIE[type] ?? NOTITIE.Anders,
          fotoUrl,
          createdAt,
        },
      });
    }
  }
  console.log(`Activiteiten: ${actNr} aangemaakt (verspreid over ${activiteitenPerDag.length} dagen)`);

  // ─── 18 HULPVRAGEN (14 open, 3 in_behandeling, 1 gesloten) ───────────
  let hulpNr = 0;
  for (let i = 0; i < HULPVRAAG_TEMPLATES.length; i++) {
    const t = HULPVRAAG_TEMPLATES[i];
    hulpNr++;
    const dagenVanafNu = (i % 10) + 1; // komende 1..10 dagen
    const datum = new Date(nu.getTime() + dagenVanafNu * 24 * 60 * 60 * 1000);
    await prisma.hulpGevraagd.create({
      data: {
        id: `hulp_extra_${hulpNr}`,
        organisatieId: orgId,
        titel: t.titel,
        omschrijving: t.oms,
        datum,
        duurMinuten: t.duur,
        aantalNodig: t.nodig,
        fotoUrl: i % 3 === 0 ? pick(FOTO_POOL, i) : null,
        status: t.status,
        aangemaaktDoor,
      },
    });
  }
  console.log(`Hulpvragen: ${hulpNr} aangemaakt`);

  // ─── Samenvatting ────────────────────────────────────────────────────
  const [tBew, tVrij, tAct, tHulp, tOpen] = await Promise.all([
    prisma.bewoner.count({ where: { organisatieId: orgId } }),
    prisma.gebruiker.count({ where: { organisatieId: orgId, rol: "VRIJWILLIGER" } }),
    prisma.activiteit.count(),
    prisma.hulpGevraagd.count({ where: { organisatieId: orgId } }),
    prisma.hulpGevraagd.count({ where: { organisatieId: orgId, status: "open" } }),
  ]);
  console.log(
    `\nTotaal in De Meerwende → Bewoners: ${tBew}, Vrijwilligers: ${tVrij}, Activiteiten: ${tAct}, Hulpvragen: ${tHulp} (${tOpen} open)`
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
