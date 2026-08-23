"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Rol } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendEmail, nieuwsbriefHtml } from "@/lib/email";
import { maakPubliekeFotoKopie } from "@/lib/foto-public";
import { markdownNaarHtml } from "@/lib/markdown";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

/** Alleen coördinatoren mogen locatie-nieuwsbrieven beheren. */
async function requireCoordinator() {
  const session = await auth();
  if (!session?.user?.gebruikerId) throw new Error("Niet geautoriseerd");
  if (session.user.rol !== "COORDINATOR") throw new Error("Alleen coördinatoren");
  if (!session.user.organisatieId) throw new Error("Geen organisatie");
  return session;
}

const DOELGROEPEN = ["FAMILIE", "VRIJWILLIGER"] as const;
type Doelgroep = (typeof DOELGROEPEN)[number];

function geldigDoelgroep(g: string): g is Doelgroep {
  return (DOELGROEPEN as readonly string[]).includes(g);
}

// ─── Lijst + selectie-data ────────────────────────────────────────

export async function getCoordinatorNieuwsbrieven() {
  const session = await requireCoordinator();
  return prisma.nieuwsbriefDraft.findMany({
    where: { organisatieId: session.user.organisatieId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { blokken: true } } },
  });
}

export async function getRecenteActiviteitenMetFoto() {
  const session = await requireCoordinator();
  return prisma.activiteit.findMany({
    where: {
      bewoner: { organisatieId: session.user.organisatieId, toestemmingFotos: true },
      fotoUrl: { not: null },
    },
    include: {
      bewoner: { select: { naam: true, toestemmingFotos: true } },
      vrijwilliger: { select: { naam: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
}

export async function getMogelijkeOntvangers(doelgroep: string[]) {
  const session = await requireCoordinator();
  const groepen = doelgroep.filter(geldigDoelgroep);

  const [familie, vrijwilligers] = await Promise.all([
    prisma.gebruiker.count({
      where: {
        organisatieId: session.user.organisatieId,
        rol: "FAMILIE",
        email: { not: "" },
      },
    }),
    prisma.gebruiker.count({
      where: {
        organisatieId: session.user.organisatieId,
        rol: { in: ["VRIJWILLIGER", "WELZIJNSMEDEWERKER"] },
        email: { not: "" },
      },
    }),
  ]);

  return {
    FAMILIE: familie,
    VRIJWILLIGER: vrijwilligers,
    totaal: groepen.reduce((s, g) => s + (g === "FAMILIE" ? familie : vrijwilligers), 0),
  };
}

// ─── CRUD draft ───────────────────────────────────────────────────

export async function createNieuwsbriefDraft(formData: FormData) {
  const session = await requireCoordinator();
  const titel = (formData.get("titel") as string)?.trim() || "Nieuwe nieuwsbrief";

  const draft = await prisma.nieuwsbriefDraft.create({
    data: {
      organisatieId: session.user.organisatieId!,
      titel,
      gemaaktDoor: session.user.naam ?? session.user.email ?? "onbekend",
      status: "concept",
    },
  });

  redirect(`/coordinator/nieuwsbrieven/${draft.id}/edit`);
}

export async function saveNieuwsbriefDraft(formData: FormData) {
  const session = await requireCoordinator();
  const id = formData.get("id") as string;
  if (!id) throw new Error("Ontbrekend id");

  const draft = await prisma.nieuwsbriefDraft.findFirst({
    where: { id, organisatieId: session.user.organisatieId },
  });
  if (!draft) throw new Error("Nieuwsbrief niet gevonden");
  if (draft.status === "verzonden") throw new Error("Al verzonden");

  const titel = (formData.get("titel") as string)?.trim() || draft.titel;
  const intro = (formData.get("intro") as string) || null;
  const doelgroepRaw = formData.getAll("doelgroep").map(String).filter(geldigDoelgroep);
  const doelgroep = doelgroepRaw.length > 0 ? doelgroepRaw : ["FAMILIE", "VRIJWILLIGER"];

  await prisma.nieuwsbriefDraft.update({
    where: { id },
    data: { titel, intro, doelgroep },
  });

  revalidatePath(`/coordinator/nieuwsbrieven/${id}/edit`);
  revalidatePath("/coordinator/nieuwsbrieven");
}

export async function verwijderNieuwsbriefDraft(id: string) {
  const session = await requireCoordinator();
  const draft = await prisma.nieuwsbriefDraft.findFirst({
    where: { id, organisatieId: session.user.organisatieId },
  });
  if (!draft) throw new Error("Niet gevonden");
  await prisma.nieuwsbriefDraft.delete({ where: { id } });
  revalidatePath("/coordinator/nieuwsbrieven");
  redirect("/coordinator/nieuwsbrieven");
}

// ─── Blokken curatie ──────────────────────────────────────────────

async function getDraftVoorEdit(id: string, organisatieId: string) {
  const draft = await prisma.nieuwsbriefDraft.findFirst({
    where: { id, organisatieId },
    include: { blokken: { orderBy: { volgorde: "asc" } } },
  });
  if (!draft) throw new Error("Nieuwsbrief niet gevonden");
  return draft;
}

export async function addActiviteitBlok(draftId: string, activiteitId: string) {
  const session = await requireCoordinator();
  const draft = await getDraftVoorEdit(draftId, session.user.organisatieId!);
  if (draft.status === "verzonden") throw new Error("Al verzonden");

  // Voorkom dubbele toevoeging van dezelfde activiteit
  const bestaat = draft.blokken.find(
    (b) => b.type === "activiteit" && b.bronActiviteitId === activiteitId
  );
  if (bestaat) return;

  const activiteit = await prisma.activiteit.findFirst({
    where: {
      id: activiteitId,
      bewoner: { organisatieId: session.user.organisatieId },
    },
    include: {
      bewoner: { select: { naam: true } },
      vrijwilliger: { select: { naam: true } },
    },
  });
  if (!activiteit) throw new Error("Activiteit niet gevonden");

  const volgorde = draft.blokken.length;
  await prisma.nieuwsbriefBlok.create({
    data: {
      draftId,
      type: "activiteit",
      bronActiviteitId: activiteit.id,
      tekst: activiteit.notities ?? null,
      volgorde,
      activiteitType: activiteit.type,
      vrijwilligerNaam: activiteit.vrijwilliger.naam,
      bewonerNaam: activiteit.bewoner.naam,
      fotoUrl: activiteit.fotoUrl,
    },
  });

  revalidatePath(`/coordinator/nieuwsbrieven/${draftId}/edit`);
}

export async function addTekstBlok(draftId: string) {
  const session = await requireCoordinator();
  const draft = await getDraftVoorEdit(draftId, session.user.organisatieId!);
  if (draft.status === "verzonden") throw new Error("Al verzonden");

  await prisma.nieuwsbriefBlok.create({
    data: {
      draftId,
      type: "tekst",
      kop: "Nieuw bericht",
      tekst: "",
      volgorde: draft.blokken.length,
    },
  });

  revalidatePath(`/coordinator/nieuwsbrieven/${draftId}/edit`);
}

export async function updateBlok(blokId: string, formData: FormData) {
  const session = await requireCoordinator();
  const kop = (formData.get("kop") as string) || null;
  const tekst = (formData.get("tekst") as string) || null;

  const blok = await prisma.nieuwsbriefBlok.findFirst({
    where: { id: blokId, draft: { organisatieId: session.user.organisatieId } },
    include: { draft: { select: { status: true } } },
  });
  if (!blok) throw new Error("Blok niet gevonden");
  if (blok.draft.status === "verzonden") throw new Error("Al verzonden");

  await prisma.nieuwsbriefBlok.update({
    where: { id: blokId },
    data: { kop, tekst },
  });

  revalidatePath(`/coordinator/nieuwsbrieven/${blok.draftId}/edit`);
}

export async function removeBlok(blokId: string) {
  const session = await requireCoordinator();
  const blok = await prisma.nieuwsbriefBlok.findFirst({
    where: { id: blokId, draft: { organisatieId: session.user.organisatieId } },
    include: { draft: { select: { status: true, id: true } } },
  });
  if (!blok) throw new Error("Blok niet gevonden");
  if (blok.draft.status === "verzonden") throw new Error("Al verzonden");

  await prisma.nieuwsbriefBlok.delete({ where: { id: blokId } });

  // Herstel volgorde
  const rest = await prisma.nieuwsbriefBlok.findMany({
    where: { draftId: blok.draftId },
    orderBy: { volgorde: "asc" },
  });
  await Promise.all(
    rest.map((b, i) =>
      prisma.nieuwsbriefBlok.update({ where: { id: b.id }, data: { volgorde: i } })
    )
  );

  revalidatePath(`/coordinator/nieuwsbrieven/${blok.draftId}/edit`);
}

export async function reorderBlok(blokId: string, richting: "omhoog" | "omlaag") {
  const session = await requireCoordinator();
  const blok = await prisma.nieuwsbriefBlok.findFirst({
    where: { id: blokId, draft: { organisatieId: session.user.organisatieId } },
    include: { draft: { select: { status: true, id: true } } },
  });
  if (!blok) throw new Error("Blok niet gevonden");
  if (blok.draft.status === "verzonden") throw new Error("Al verzonden");

  const siblings = await prisma.nieuwsbriefBlok.findMany({
    where: { draftId: blok.draftId },
    orderBy: { volgorde: "asc" },
  });
  const idx = siblings.findIndex((b) => b.id === blokId);
  const swapMet = richting === "omhoog" ? idx - 1 : idx + 1;
  if (swapMet < 0 || swapMet >= siblings.length) return;

  const a = siblings[idx];
  const b = siblings[swapMet];
  await prisma.$transaction([
    prisma.nieuwsbriefBlok.update({ where: { id: a.id }, data: { volgorde: b.volgorde } }),
    prisma.nieuwsbriefBlok.update({ where: { id: b.id }, data: { volgorde: a.volgorde } }),
  ]);

  revalidatePath(`/coordinator/nieuwsbrieven/${blok.draftId}/edit`);
}

// ─── Verzenden ────────────────────────────────────────────────────

export async function verstuurNieuwsbrief(id: string) {
  const session = await requireCoordinator();
  const organisatieId = session.user.organisatieId!;

  const draft = await prisma.nieuwsbriefDraft.findFirst({
    where: { id, organisatieId },
    include: {
      blokken: { orderBy: { volgorde: "asc" } },
      organisatie: { select: { naam: true } },
    },
  });
  if (!draft) throw new Error("Nieuwsbrief niet gevonden");
  if (draft.status === "verzonden") throw new Error("Al verzonden");
  if (draft.blokken.length === 0) throw new Error("Voeg eerst blokken toe");

  const groepen = draft.doelgroep.filter(geldigDoelgroep);
  if (groepen.length === 0) throw new Error("Kies minstens één doelgroep");

  // Haal ontvangers op (unieke e-mailadressen per geselecteerde rol)
  const rolFilter: string[] = [];
  if (groepen.includes("FAMILIE")) rolFilter.push("FAMILIE");
  if (groepen.includes("VRIJWILLIGER")) rolFilter.push("VRIJWILLIGER", "WELZIJNSMEDEWERKER");

  const ontvangers = await prisma.gebruiker.findMany({
    where: {
      organisatieId,
      email: { not: "" },
      rol: { in: rolFilter as Rol[] },
    },
    select: { id: true, email: true, naam: true },
  });

  if (ontvangers.length === 0) {
    throw new Error("Geen ontvangers voor de gekozen doelgroep(en)");
  }

  // Maak publieke foto-kopieën (AVG-safe) voor activiteit-blokken
  const publicFotoUrls: string[] = [];
  const blokkenHtml = await Promise.all(
    draft.blokken.map(async (b) => {
      if (b.type === "activiteit" && b.fotoUrl) {
        const pub = await maakPubliekeFotoKopie(b.fotoUrl, organisatieId);
        if (pub) publicFotoUrls.push(pub);
        return {
          type: "activiteit" as const,
          kop: b.kop,
          tekst: b.tekst,
          fotoUrl: pub,
          vrijwilligerNaam: b.vrijwilligerNaam,
          bewonerNaam: b.bewonerNaam,
        };
      }
      return {
        type: b.type as "tekst" | "activiteit",
        kop: b.kop,
        tekst: b.tekst,
        fotoUrl: null,
        vrijwilligerNaam: b.vrijwilligerNaam,
        bewonerNaam: b.bewonerNaam,
      };
    })
  );

  const doelgroepLabels = groepen
    .map((g) => (g === "FAMILIE" ? "familie" : "vrijwilligers"))
    .join(" en ");
  const html = nieuwsbriefHtml({
    titel: draft.titel,
    organisatie: draft.organisatie.naam,
    intro: draft.intro,
    blokken: blokkenHtml,
    doelgroepLabel: doelgroepLabels,
  });

  let verstuurt = 0;
  for (const o of ontvangers) {
    const ok = await sendEmail({
      to: o.email!,
      subject: draft.titel,
      html,
    });
    if (ok) {
      verstuurt++;
      await prisma.nieuwsbriefAbonnement.create({
        data: {
          nieuwsbriefId: id,
          gebruikerId: o.id,
          email: o.email!,
          naam: o.naam,
          status: "verzonden",
        },
      });
    }
  }

  await prisma.nieuwsbriefDraft.update({
    where: { id },
    data: {
      status: "verzonden",
      verzondenOp: new Date(),
      verstuurtAantal: verstuurt,
    },
  });

  revalidatePath("/coordinator/nieuwsbrieven");
  redirect("/coordinator/nieuwsbrieven");
}


// ─── Test-verzending (pro workflow) ─────────────────────────────
// Stuurt de nieuwsbrief alleen naar de ingelogde coördinator om de
// opmaak/afbeeldingen te controleren vóór de echte broadcast.

export async function verstuurTestNieuwsbrief(id: string) {
  const session = await requireCoordinator();
  const organisatieId = session.user.organisatieId!;

  const draft = await prisma.nieuwsbriefDraft.findFirst({
    where: { id, organisatieId },
    include: {
      blokken: { orderBy: { volgorde: "asc" } },
      organisatie: { select: { naam: true } },
    },
  });
  if (!draft) throw new Error("Nieuwsbrief niet gevonden");
  if (draft.blokken.length === 0) throw new Error("Voeg eerst blokken toe");

  const ontvangerEmail = session.user.email;
  if (!ontvangerEmail) throw new Error("Coördinator heeft geen e-mailadres");

  const blokkenHtml = await Promise.all(
    draft.blokken.map(async (b) => {
      if (b.type === "activiteit" && b.fotoUrl) {
        const pub = await maakPubliekeFotoKopie(b.fotoUrl, organisatieId);
        return {
          type: "activiteit" as const,
          kop: b.kop,
          tekst: b.tekst,
          fotoUrl: pub,
          vrijwilligerNaam: b.vrijwilligerNaam,
          bewonerNaam: b.bewonerNaam,
        };
      }
      return {
        type: b.type as "tekst" | "activiteit",
        kop: b.kop,
        tekst: b.type === "tekst" && b.tekst ? markdownNaarHtml(b.tekst) : b.tekst,
        fotoUrl: null,
        vrijwilligerNaam: b.vrijwilligerNaam,
        bewonerNaam: b.bewonerNaam,
      };
    })
  );

  const html = nieuwsbriefHtml({
    titel: `[TEST] ${draft.titel}`,
    organisatie: draft.organisatie.naam,
    intro: draft.intro,
    blokken: blokkenHtml,
    doelgroepLabel: draft.doelgroep
      .map((g) => (g === "FAMILIE" ? "familie" : "vrijwilligers"))
      .join(" + "),
    ontvangerNaam: session.user.naam ?? "coördinator",
    afmeldUrl: `${APP_URL}/afmelden/nieuwsbrief/test`,
    openPixelUrl: null,
  });

  const ok = await sendEmail({
    to: ontvangerEmail,
    subject: `[TEST] ${draft.titel}`,
    html,
  });

  if (!ok) throw new Error("Test-e-mail kon niet worden verzonden (check RESEND_API_KEY)");
  return { ok: true, naar: ontvangerEmail };
}
