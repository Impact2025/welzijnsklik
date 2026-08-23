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

// Hulpvraag-sjablonen (titel, type-activiteit, duurMinuten, aantalNodig)
const HULPVRAAG_TEMPLATES = [
  { titel: "Wandeling in het park", type: "Wandelen", duur: 60, nodig: 2,
    oms: "Een bewoner wil graag een keer per week een rustige wandeling maken in het park. Er is begeleiding met een rollator nodig." },
  { titel: "Samen koffiedrinken", type: "Koffiedrinken", duur: 45, nodig: 1,
    oms: "Gezellige koffiemiddag op de afdeling. Vrijwilliger die een praatje maakt en koffie inschenkt is welkom." },
  { titel: "Voorlezen uit de krant", type: "Lezen", duur: 30, nodig: 1,
    oms: "Een bewoner met slechte ogen wil graag dat iemand voorleest uit de lokale krant of een tijdschrift." },
  { titel: "Muziekochtend organiseren", type: "Muziek", duur: 90, nodig: 2,
    oms: "We zoeken vrijwilligers die een muziekochtend willen begeleiden: liedjes draaien, meezingen en instrumenten uitdelen." },
  { titel: "Boodschappen begeleiden", type: "Boodschappen", duur: 60, nodig: 1,
    oms: "Begeleiding bij een bezoek aan de supermarkt om kleine boodschappen te doen. Rolstoeltoegankelijk." },
  { titel: "Gezelschap bij het avondeten", type: "Gezelschap", duur: 60, nodig: 2,
    oms: "Een eenzame bewoner zou graag gezelschap hebben tijdens het avondeten, gewoon even praten over de dag." },
  { titel: "Schaak- en spelletjesmiddag", type: "Spelletjes", duur: 120, nodig: 3,
    oms: "We organiseren een spelletjesmiddag met schaken, Rummikub en Mens erger je niet. Extra handen zijn welkom." },
  { titel: "Tuinonderhoud samen doen", type: "Anders", duur: 90, nodig: 2,
    oms: "In de binnentuin onkruid wieden en planten verzorgen, samen met een bewoner die van tuinieren houdt." },
  { titel: "Fietstocht met duofiets", type: "Wandelen", duur: 60, nodig: 2,
    oms: "Een bewoner wil graag een rondje op de duofiets. Twee vrijwilligers voor stabiliteit en gezelligheid." },
  { titel: "Knutselworkshop", type: "Anders", duur: 90, nodig: 2,
    oms: "Wekelijkse knutselworkshop (kaarten, bloemen van papier). Vrijwilliger die handig is met materialen gevraagd." },
  { titel: "Kamergesprekje voor een stille bewoner", type: "Gezelschap", duur: 30, nodig: 1,
    oms: "Een bewoner die weinig praat zoekt toch af en toe een rustig moment met iemand die er gewoon is." },
  { titel: "Kerkbezoek begeleiden", type: "Wandelen", duur: 90, nodig: 1,
    oms: "Begeleiding naar de zondagse kerkdienst in het dorp, inclusief rolstoel en terugweg." },
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}
function rnd<T>(arr: T[], seed: number): T {
  return arr[(seed * 7 + 3) % arr.length];
}

async function main() {
  console.log("Seeding extra demo content...");

  const organisatie = await prisma.organisatie.upsert({
    where: { id: "org_meerwende" },
    update: {},
    create: { id: "org_meerwende", naam: "De Meerwende", plaats: "Badhoevedorp" },
  });
  const orgId = organisatie.id;

  // ─── 15 BEWONERS ─────────────────────────────────────────────────────
  const nu = new Date();
  const bewonerIds: string[] = [];
  for (let i = 0; i < 15; i++) {
    const id = `bew_extra_${i + 1}`;
    const naam = `${pick(VOORNAMEN, i * 2)} ${pick(ACHTERNAMEN, i * 3)}`;
    const toestemming = i % 4 !== 0; // ~75% toestemming
    const geb = new Date(1935 + (i * 3) % 40, (i * 5) % 12, (i * 7) % 27 + 1);
    const b = await prisma.bewoner.upsert({
      where: { id },
      update: {},
      create: {
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
    bewonerIds.push(b.id);
  }
  console.log(`Bewoners: ${bewonerIds.length} extra aangemaakt/bijgewerkt`);

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
        naam,
        email,
        rol: "VRIJWILLIGER" as const,
        organisatieId: orgId,
        userId: user.id,
        telefoon: `06-${String(10000000 + i * 123457).slice(0, 8)}`,
        voorkeurActiviteiten: [rnd(ACTIVITEIT_TYPES, i), rnd(ACTIVITEIT_TYPES, i + 5)].filter(
          (v, idx, a) => a.indexOf(v) === idx
        ),
        beschikbaarheid: pick(BESCHIKBAARHEID, i),
        ervaring: pick(ERVARING, i),
        motivatie: pick(MOTIVATIES, i),
        vogStatus: i % 5 === 0 ? "aanvraag_lopen" : "heeft",
      },
    });
    vrijwilligerIds.push(g.id);
  }
  console.log(`Vrijwilligers: ${vrijwilligerIds.length} extra aangemaakt/bijgewerkt`);

  // ─── 10 ACTIVITEITEN (verspreid over bewoners & vrijwilligers) ──────
  const activiteitTypes = [
    "Wandelen", "Koffiedrinken", "Gezelschap", "Spelletjes",
    "Lezen", "Muziek", "Boodschappen", "Wandelen", "Knutselen", "Muziek",
  ];
  const notitieTemplates: Record<string, string> = {
    Wandelen: "Een heerlijk rondje gemaakt, de bewoner genoot van de frisse lucht en de bloemen onderweg.",
    Koffiedrinken: "Gezellig bijgekletst bij een kop koffie en een koekje. Veel gelachen om verhalen uit het verleden.",
    Gezelschap: "Samen fotoalbums bekeken en herinneringen gedeeld. Een rustig, waardevol uurtje.",
    Spelletjes: "Rummikub gespeeld. De bewoner was scherp en won met een mooie combinatie.",
    Lezen: "Voor gelezen uit de krant. De bewoner vond het sportkatern het leukst.",
    Muziek: "Liedjes uit vroeger jaren gezongen. De bewoner kende alle teksten nog uit het hoofd.",
    Boodschappen: "Samen kleine boodschappen gedaan in de buurtwinkel. Gezellig en praktisch tegelijk.",
    Knutselen: "Kerstkaarten geknutseld van papier. De bewoner was creatief en trots op het resultaat.",
  };
  let aangemaakt = 0;
  for (let i = 0; i < 10; i++) {
    const type = activiteitTypes[i];
    const bewonerId = pick(bewonerIds, i);
    const vrijwilligerId = pick(vrijwilligerIds, i * 2);
    const dagenGeleden = (i * 3) % 30;
    const createdAt = new Date(nu.getTime() - dagenGeleden * 24 * 60 * 60 * 1000);
    // Foto alleen als de bewoner toestemming heeft én het een foto-vriendelijk type is
    const bewoner = await prisma.bewoner.findUnique({
      where: { id: bewonerId },
      select: { toestemmingFotos: true },
    });
    const fotoUrl =
      bewoner?.toestemmingFotos && ["Wandelen", "Koffiedrinken", "Knutselen", "Gezelschap"].includes(type)
        ? pick(FOTO_POOL, i)
        : null;
    await prisma.activiteit.upsert({
      where: { id: `act_extra_${i + 1}` },
      update: {},
      create: {
        id: `act_extra_${i + 1}`,
        bewonerId,
        vrijwilligerId,
        type,
        duurMinuten: rnd([30, 45, 60, 90], i),
        notities: notitieTemplates[type] ?? "Gezellige activiteit met de bewoner.",
        fotoUrl,
        createdAt,
      },
    });
    aangemaakt++;
  }
  console.log(`Activiteiten: ${aangemaakt} extra aangemaakt`);

  // ─── 12 HULPVRAGEN ──────────────────────────────────────────────────
  const coordinator = await prisma.gebruiker.findFirst({
    where: { rol: "COORDINATOR", organisatieId: orgId },
  });
  const aangemaaktDoor = coordinator?.id ?? orgId;
  let hulpAangemaakt = 0;
  for (let i = 0; i < HULPVRAAG_TEMPLATES.length; i++) {
    const t = HULPVRAAG_TEMPLATES[i];
    const dagenVanafNu = i % 2 === 0 ? i + 1 : -(i % 7) - 1; // mix van toekomst en recent verleden
    const datum = new Date(nu.getTime() + dagenVanafNu * 24 * 60 * 60 * 1000);
    const status = i % 6 === 0 ? "gesloten" : i % 4 === 0 ? "in_behandeling" : "open";
    await prisma.hulpGevraagd.upsert({
      where: { id: `hulp_extra_${i + 1}` },
      update: {},
      create: {
        id: `hulp_extra_${i + 1}`,
        organisatieId: orgId,
        titel: t.titel,
        omschrijving: t.oms,
        datum,
        duurMinuten: t.duur,
        aantalNodig: t.nodig,
        fotoUrl: i % 3 === 0 ? pick(FOTO_POOL, i) : null,
        status,
        aangemaaktDoor,
      },
    });
    hulpAangemaakt++;
  }
  console.log(`Hulpvragen: ${hulpAangemaakt} extra aangemaakt`);

  // ─── Samenvatting ────────────────────────────────────────────────────
  const [tBew, tVrij, tAct, tHulp] = await Promise.all([
    prisma.bewoner.count({ where: { organisatieId: orgId } }),
    prisma.gebruiker.count({ where: { organisatieId: orgId, rol: "VRIJWILLIGER" } }),
    prisma.activiteit.count(),
    prisma.hulpGevraagd.count({ where: { organisatieId: orgId } }),
  ]);
  console.log(
    `\nTotaal in De Meerwende → Bewoners: ${tBew}, Vrijwilligers: ${tVrij}, Activiteiten: ${tAct}, Hulpvragen: ${tHulp}`
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
