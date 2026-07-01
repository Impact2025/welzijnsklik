"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

async function requireCoordinator() {
  const session = await auth();
  if (!session?.user || session.user.rol !== "COORDINATOR") {
    throw new Error("Geen toegang");
  }
  return session;
}

// ─── Bewoners ────────────────────────────────────────────

export async function createBewoner(formData: FormData) {
  const session = await requireCoordinator();
  const naam = formData.get("naam") as string;
  const kamer = (formData.get("kamer") as string) || null;
  const notities = (formData.get("notities") as string) || null;
  const toestemmingFotos = formData.get("toestemmingFotos") === "on";
  const geboortedatumStr = formData.get("geboortedatum") as string;

  await prisma.bewoner.create({
    data: {
      naam,
      kamer,
      notities,
      toestemmingFotos,
      geboortedatum: geboortedatumStr ? new Date(geboortedatumStr) : null,
      toestemmingDoor: toestemmingFotos ? (session.user.naam ?? "coordinator") : null,
      toestemmingDatum: toestemmingFotos ? new Date() : null,
      organisatieId: session.user.organisatieId!,
    },
  });
  revalidatePath("/admin/crm/bewoners");
  redirect("/admin/crm/bewoners");
}

export async function updateBewoner(id: string, formData: FormData) {
  const session = await requireCoordinator();
  const naam = formData.get("naam") as string;
  const kamer = (formData.get("kamer") as string) || null;
  const notities = (formData.get("notities") as string) || null;
  const toestemmingFotos = formData.get("toestemmingFotos") === "on";
  const geboortedatumStr = formData.get("geboortedatum") as string;

  await prisma.bewoner.update({
    where: { id, organisatieId: session.user.organisatieId! },
    data: {
      naam,
      kamer,
      notities,
      toestemmingFotos,
      geboortedatum: geboortedatumStr ? new Date(geboortedatumStr) : null,
    },
  });
  revalidatePath("/admin/crm/bewoners");
  revalidatePath(`/admin/crm/bewoners/${id}`);
  redirect("/admin/crm/bewoners");
}

export async function deleteBewoner(id: string) {
  const session = await requireCoordinator();
  await prisma.bewoner.delete({
    where: { id, organisatieId: session.user.organisatieId! },
  });
  revalidatePath("/admin/crm/bewoners");
  redirect("/admin/crm/bewoners");
}

// ─── Vrijwilligers ────────────────────────────────────────

export async function inviteVrijwilliger(formData: FormData) {
  const session = await requireCoordinator();
  const naam = formData.get("naam") as string;
  const email = formData.get("email") as string;
  const telefoon = (formData.get("telefoon") as string) || null;
  const voorkeurStr = (formData.get("voorkeur") as string) || "";
  const voorkeurActiviteiten = voorkeurStr
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  // Intake velden
  const beschikbaarheid = (formData.get("beschikbaarheid") as string) || null;
  const vogStatus = (formData.get("vogStatus") as string) || null;
  const ervaring = (formData.get("ervaring") as string) || null;
  const motivatie = (formData.get("motivatie") as string) || null;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Er bestaat al een account met dit e-mailadres.");

  await prisma.user.create({
    data: {
      email,
      name: naam,
      gebruiker: {
        create: {
          naam,
          email,
          rol: "VRIJWILLIGER",
          telefoon,
          voorkeurActiviteiten,
          organisatieId: session.user.organisatieId!,
          beschikbaarheid,
          vogStatus,
          ervaring,
          motivatie,
        },
      },
    },
  });

  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  await sendEmail({
    to: email,
    subject: "Uitnodiging voor Welzijnsklik",
    html: `<p>Hallo ${naam},</p>
<p>Je bent uitgenodigd om mee te werken als vrijwilliger op Welzijnsklik. Klik hieronder om in te loggen:</p>
<p><a href="${appUrl}/login" style="background:#005e9f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Log in op Welzijnsklik</a></p>
<p>Na het inloggen heb je direct toegang tot je vrijwilligersdashboard.</p>
<p>Met vriendelijke groet,<br>Team Welzijnsklik</p>`,
  });

  revalidatePath("/admin/crm/vrijwilligers");
  redirect("/admin/crm/vrijwilligers");
}

export async function updateVrijwilliger(id: string, formData: FormData) {
  const session = await requireCoordinator();
  const naam = formData.get("naam") as string;
  const telefoon = (formData.get("telefoon") as string) || null;
  const interneNotities = (formData.get("interneNotities") as string) || null;
  const voorkeurStr = (formData.get("voorkeur") as string) || "";
  const voorkeurActiviteiten = voorkeurStr
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  // Intake velden
  const beschikbaarheid = (formData.get("beschikbaarheid") as string) || null;
  const vogStatus = (formData.get("vogStatus") as string) || null;
  const ervaring = (formData.get("ervaring") as string) || null;
  const motivatie = (formData.get("motivatie") as string) || null;

  await prisma.gebruiker.update({
    where: { id, organisatieId: session.user.organisatieId! },
    data: { naam, telefoon, interneNotities, voorkeurActiviteiten, beschikbaarheid, vogStatus, ervaring, motivatie },
  });
  revalidatePath("/admin/crm/vrijwilligers");
  revalidatePath(`/admin/crm/vrijwilligers/${id}`);
  redirect("/admin/crm/vrijwilligers");
}

// ─── Blog ────────────────────────────────────────────────

export async function updateBlogPost(id: string, formData: FormData) {
  const session = await requireCoordinator();
  const titel = formData.get("titel") as string;
  const slug = formData.get("slug") as string;
  const inhoud = formData.get("inhoud") as string;
  const samenvatting = (formData.get("samenvatting") as string) || null;
  const focusKeyword = (formData.get("focusKeyword") as string) || null;
  const seoTitle = (formData.get("seoTitle") as string) || null;
  const seoDescription = (formData.get("seoDescription") as string) || null;
  const publish = formData.get("publish") === "true";

  await prisma.blogPost.update({
    where: { id, organisatieId: session.user.organisatieId! },
    data: {
      titel,
      slug,
      inhoud,
      samenvatting,
      focusKeyword,
      seoTitle,
      seoDescription,
      status: publish ? "GEPUBLICEERD" : "CONCEPT",
      gepubliceerdOp: publish ? new Date() : null,
      updatedBy: session.user.naam ?? session.user.email ?? "onbekend",
    },
  });
  revalidatePath("/admin/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/admin/blog");
}

export async function deleteBlogPost(id: string) {
  const session = await requireCoordinator();
  await prisma.blogPost.delete({
    where: { id, organisatieId: session.user.organisatieId! },
  });
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

// ─── Nieuwsbrieven ───────────────────────────────────────

export async function updateNieuwsbrief(id: string, formData: FormData) {
  const session = await requireCoordinator();
  const onderwerp = formData.get("onderwerp") as string;
  const titel = formData.get("titel") as string;
  const inhoud = formData.get("inhoud") as string;
  const doelgroep = formData.get("doelgroep") as string;
  const type = (formData.get("type") as string) || "nieuwsbrief";

  await prisma.nieuwsbrief.update({
    where: { id, organisatieId: session.user.organisatieId! },
    data: { onderwerp, titel, inhoud, doelgroep, type },
  });
  revalidatePath("/admin/nieuwsbrieven");
  revalidatePath(`/admin/nieuwsbrieven/${id}/edit`);
  redirect("/admin/nieuwsbrieven");
}

export async function sendNieuwsbrief(id: string) {
  const session = await requireCoordinator();
  const nieuwsbrief = await prisma.nieuwsbrief.findUnique({
    where: { id, organisatieId: session.user.organisatieId! },
  });
  if (!nieuwsbrief) throw new Error("Nieuwsbrief niet gevonden");
  if (nieuwsbrief.status === "VERZONDEN") throw new Error("Deze nieuwsbrief is al verzonden.");

  const rollen =
    nieuwsbrief.doelgroep === "alle"
      ? (["VRIJWILLIGER", "FAMILIE"] as const)
      : nieuwsbrief.doelgroep === "vrijwilligers"
      ? (["VRIJWILLIGER"] as const)
      : (["FAMILIE"] as const);

  const ontvangers = await prisma.gebruiker.findMany({
    where: { organisatieId: session.user.organisatieId!, rol: { in: [...rollen] } },
    select: { email: true, naam: true },
  });

  let verstuurt = 0;
  for (const g of ontvangers) {
    const ok = await sendEmail({
      to: g.email,
      subject: nieuwsbrief.onderwerp,
      html: nieuwsbrief.inhoud,
    });
    if (ok) verstuurt++;
  }

  await prisma.nieuwsbrief.update({
    where: { id },
    data: { status: "VERZONDEN", verzondenOp: new Date(), verstuurtAantal: verstuurt },
  });
  revalidatePath("/admin/nieuwsbrieven");
  redirect("/admin/nieuwsbrieven");
}

// ─── Instellingen ─────────────────────────────────────────

export async function updateInstellingen(formData: FormData) {
  const session = await requireCoordinator();
  const orgNaam = formData.get("orgNaam") as string;
  const orgPlaats = (formData.get("orgPlaats") as string) || "";
  const nieuwsbriefFrom = (formData.get("nieuwsbriefFrom") as string) || null;
  const nieuwsbriefEnabled = formData.get("nieuwsbriefEnabled") === "on";

  await Promise.all([
    prisma.organisatie.update({
      where: { id: session.user.organisatieId! },
      data: { naam: orgNaam, plaats: orgPlaats },
    }),
    prisma.adminInstellingen.upsert({
      where: { organisatieId: session.user.organisatieId! },
      update: { nieuwsbriefFrom, nieuwsbriefEnabled },
      create: {
        organisatieId: session.user.organisatieId!,
        nieuwsbriefFrom,
        nieuwsbriefEnabled,
      },
    }),
  ]);

  revalidatePath("/admin/instellingen");
}