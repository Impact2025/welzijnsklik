"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function maakHulpGevraagd(formData: FormData) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  const titel = (formData.get("titel") as string)?.trim();
  const omschrijving = (formData.get("omschrijving") as string)?.trim();
  const datumStr = formData.get("datum") as string;
  const tijdStr = formData.get("tijd") as string;
  const eindtijdStr = formData.get("eindtijd") as string;
  const aantalNodig = parseInt(formData.get("aantalNodig") as string, 10);
  const fotoUrl = (formData.get("fotoUrl") as string) || null;

  if (!titel || !omschrijving || !datumStr || !tijdStr || !eindtijdStr || isNaN(aantalNodig)) {
    throw new Error("Niet alle verplichte velden zijn ingevuld");
  }

  const datum = new Date(`${datumStr}T${tijdStr}`);
  if (isNaN(datum.getTime())) throw new Error("Ongeldige datum of tijd");

  const [startU, startM] = tijdStr.split(":").map(Number);
  const [eindU, eindM] = eindtijdStr.split(":").map(Number);
  const duurMinuten = (eindU * 60 + eindM) - (startU * 60 + startM);
  if (duurMinuten <= 0) throw new Error("Eindtijd moet na de starttijd liggen");

  await prisma.hulpGevraagd.create({
    data: {
      organisatieId: session.user.organisatieId!,
      titel,
      omschrijving,
      datum,
      duurMinuten,
      aantalNodig,
      fotoUrl,
      aangemaaktDoor: session.user.naam ?? session.user.name ?? "Coordinator",
    },
  });

  revalidatePath("/coordinator/hulp-gevraagd");
}

export async function reageerOpHulp(hulpGevraagdId: string, bericht: string) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "VRIJWILLIGER") {
    throw new Error("Niet geautoriseerd");
  }

  const hulp = await prisma.hulpGevraagd.findFirst({
    where: { id: hulpGevraagdId, organisatieId: session.user.organisatieId, status: "open" },
    include: { _count: { select: { reacties: { where: { status: { not: "afgewezen" } } } } } },
  });

  if (!hulp) throw new Error("Niet gevonden of niet meer open");

  if (hulp._count.reacties >= hulp.aantalNodig) {
    throw new Error("Er zijn al voldoende aanmeldingen");
  }

  await prisma.hulpReactie.create({
    data: {
      hulpGevraagdId,
      vrijwilligerId: session.user.gebruikerId,
      bericht: bericht?.trim() || null,
    },
  });

  // Auto-sluiten als vol
  const nieuwAantal = hulp._count.reacties + 1;
  if (nieuwAantal >= hulp.aantalNodig) {
    await prisma.hulpGevraagd.update({
      where: { id: hulpGevraagdId },
      data: { status: "vol" },
    });
  }

  revalidatePath("/vrijwilliger/hulp-gevraagd");
  revalidatePath("/coordinator/hulp-gevraagd");
}

export async function trekReactieIn(hulpGevraagdId: string) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "VRIJWILLIGER") {
    throw new Error("Niet geautoriseerd");
  }

  await prisma.hulpReactie.delete({
    where: {
      hulpGevraagdId_vrijwilligerId: {
        hulpGevraagdId,
        vrijwilligerId: session.user.gebruikerId,
      },
    },
  });

  // Heropen als het item "vol" was maar nu weer plek heeft
  const hulp = await prisma.hulpGevraagd.findUnique({
    where: { id: hulpGevraagdId },
    include: { _count: { select: { reacties: { where: { status: { not: "afgewezen" } } } } } },
  });
  if (hulp?.status === "vol" && hulp._count.reacties < hulp.aantalNodig) {
    await prisma.hulpGevraagd.update({ where: { id: hulpGevraagdId }, data: { status: "open" } });
  }

  revalidatePath("/vrijwilliger/hulp-gevraagd");
  revalidatePath("/coordinator/hulp-gevraagd");
}

export async function bewerkHulpGevraagd(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  const titel = (formData.get("titel") as string)?.trim();
  const omschrijving = (formData.get("omschrijving") as string)?.trim();
  const datumStr = formData.get("datum") as string;
  const tijdStr = formData.get("tijd") as string;
  const eindtijdStr = formData.get("eindtijd") as string;
  const aantalNodig = parseInt(formData.get("aantalNodig") as string, 10);
  const fotoUrl = (formData.get("fotoUrl") as string) || null;

  if (!titel || !omschrijving || !datumStr || !tijdStr || !eindtijdStr || isNaN(aantalNodig)) {
    throw new Error("Niet alle verplichte velden zijn ingevuld");
  }

  const datum = new Date(`${datumStr}T${tijdStr}`);
  if (isNaN(datum.getTime())) throw new Error("Ongeldige datum of tijd");

  const [startU, startM] = tijdStr.split(":").map(Number);
  const [eindU, eindM] = eindtijdStr.split(":").map(Number);
  const duurMinuten = eindU * 60 + eindM - (startU * 60 + startM);
  if (duurMinuten <= 0) throw new Error("Eindtijd moet na de starttijd liggen");

  await prisma.hulpGevraagd.updateMany({
    where: { id, organisatieId: session.user.organisatieId! },
    data: { titel, omschrijving, datum, duurMinuten, aantalNodig, fotoUrl },
  });

  revalidatePath("/coordinator/hulp-gevraagd");
  revalidatePath(`/coordinator/hulp-gevraagd/${id}`);
}

export async function verwijderHulpGevraagd(id: string) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  await prisma.hulpGevraagd.deleteMany({
    where: { id, organisatieId: session.user.organisatieId! },
  });

  revalidatePath("/coordinator/hulp-gevraagd");
}

export async function updateHulpStatus(id: string, status: "open" | "vol" | "gesloten") {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  await prisma.hulpGevraagd.updateMany({
    where: { id, organisatieId: session.user.organisatieId },
    data: { status },
  });

  revalidatePath("/coordinator/hulp-gevraagd");
  revalidatePath(`/coordinator/hulp-gevraagd/${id}`);
}

export async function updateHulpReactieStatus(reactieId: string, status: "bevestigd" | "afgewezen") {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  await prisma.hulpReactie.update({
    where: { id: reactieId },
    data: { status },
  });

  revalidatePath("/coordinator/hulp-gevraagd");
}

export async function getOpenHulpVragenCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.gebruikerId || !session.user.organisatieId) return 0;
  if (session.user.rol !== "VRIJWILLIGER") return 0;

  try {
    const count = await prisma.hulpGevraagd.count({
      where: {
        organisatieId: session.user.organisatieId,
        status: "open",
        reacties: { none: { vrijwilligerId: session.user.gebruikerId } },
      },
    });
    return count;
  } catch {
    return 0;
  }
}

export async function getNieuweHulpReactiesCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.gebruikerId || !session.user.organisatieId) return 0;
  if (session.user.rol !== "COORDINATOR") return 0;

  try {
    return prisma.hulpReactie.count({
      where: {
        status: "aangemeld",
        hulpGevraagd: { organisatieId: session.user.organisatieId },
      },
    });
  } catch {
    return 0;
  }
}
