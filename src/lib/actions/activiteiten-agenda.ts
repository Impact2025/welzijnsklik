"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function maakGeplandeActiviteit(formData: FormData) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  const titel = (formData.get("titel") as string)?.trim();
  const type = (formData.get("type") as string)?.trim() || null;
  const beschrijving = (formData.get("beschrijving") as string)?.trim() || null;
  const locatie = (formData.get("locatie") as string)?.trim() || null;
  const datumStr = formData.get("datum") as string;
  const tijdStr = formData.get("tijd") as string;
  const eindtijdStr = formData.get("eindtijd") as string;
  const duurRaw = formData.get("duurMinuten") as string;
  const hulpGevraagdId = (formData.get("hulpGevraagdId") as string)?.trim() || null;

  if (!titel || !datumStr || !tijdStr) {
    throw new Error("Titel, datum en starttijd zijn verplicht");
  }

  let duurMinuten = parseInt(duurRaw, 10);
  if (isNaN(duurMinuten) || duurMinuten <= 0) {
    if (eindtijdStr) {
      const [sU, sM] = tijdStr.split(":").map(Number);
      const [eU, eM] = eindtijdStr.split(":").map(Number);
      duurMinuten = eU * 60 + eM - (sU * 60 + sM);
    }
    if (!duurMinuten || duurMinuten <= 0) duurMinuten = 60;
  }

  const datum = new Date(`${datumStr}T${tijdStr}`);
  if (isNaN(datum.getTime())) throw new Error("Ongeldige datum of tijd");

  // Als er een hulp wordt gekoppeld, controleer dat die bestaat en nog niet gekoppeld is
  if (hulpGevraagdId) {
    const bestaand = await prisma.hulpGevraagd.findFirst({
      where: { id: hulpGevraagdId, organisatieId: session.user.organisatieId },
    });
    if (!bestaand) throw new Error("Gekoppelde hulpvraag niet gevonden");
    const alGekoppeld = await prisma.geplandeActiviteit.findFirst({
      where: { hulpGevraagdId, organisatieId: session.user.organisatieId },
    });
    if (alGekoppeld) {
      throw new Error("Deze hulpvraag is al gekoppeld aan een andere activiteit");
    }
  }

  await prisma.geplandeActiviteit.create({
    data: {
      organisatieId: session.user.organisatieId!,
      titel,
      type,
      beschrijving,
      locatie,
      datum,
      duurMinuten,
      aangemaaktDoor: session.user.naam ?? session.user.name ?? "Coordinator",
      hulpGevraagdId: hulpGevraagdId || null,
    },
  });

  revalidatePath("/coordinator/agenda");
  revalidatePath("/coordinator/activiteiten");
}

export async function bewerkGeplandeActiviteit(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  const titel = (formData.get("titel") as string)?.trim();
  const type = (formData.get("type") as string)?.trim() || null;
  const beschrijving = (formData.get("beschrijving") as string)?.trim() || null;
  const locatie = (formData.get("locatie") as string)?.trim() || null;
  const datumStr = formData.get("datum") as string;
  const tijdStr = formData.get("tijd") as string;
  const eindtijdStr = formData.get("eindtijd") as string;
  const duurRaw = formData.get("duurMinuten") as string;
  const hulpGevraagdId = (formData.get("hulpGevraagdId") as string)?.trim() || null;

  if (!titel || !datumStr || !tijdStr) {
    throw new Error("Titel, datum en starttijd zijn verplicht");
  }

  let duurMinuten = parseInt(duurRaw, 10);
  if (isNaN(duurMinuten) || duurMinuten <= 0) {
    if (eindtijdStr) {
      const [sU, sM] = tijdStr.split(":").map(Number);
      const [eU, eM] = eindtijdStr.split(":").map(Number);
      duurMinuten = eU * 60 + eM - (sU * 60 + sM);
    }
    if (!duurMinuten || duurMinuten <= 0) duurMinuten = 60;
  }

  const datum = new Date(`${datumStr}T${tijdStr}`);
  if (isNaN(datum.getTime())) throw new Error("Ongeldige datum of tijd");

  if (hulpGevraagdId) {
    const alGekoppeld = await prisma.geplandeActiviteit.findFirst({
      where: { hulpGevraagdId, organisatieId: session.user.organisatieId, NOT: { id } },
    });
    if (alGekoppeld) {
      throw new Error("Deze hulpvraag is al gekoppeld aan een andere activiteit");
    }
  }

  await prisma.geplandeActiviteit.updateMany({
    where: { id, organisatieId: session.user.organisatieId! },
    data: {
      titel,
      type,
      beschrijving,
      locatie,
      datum,
      duurMinuten,
      hulpGevraagdId: hulpGevraagdId || null,
    },
  });

  revalidatePath("/coordinator/agenda");
  revalidatePath("/coordinator/activiteiten");
  revalidatePath(`/coordinator/activiteiten/${id}`);
}

export async function verwijderGeplandeActiviteit(id: string) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  await prisma.geplandeActiviteit.deleteMany({
    where: { id, organisatieId: session.user.organisatieId! },
  });

  revalidatePath("/coordinator/agenda");
  revalidatePath("/coordinator/activiteiten");
}
