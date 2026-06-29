"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateToestemming(
  bewonerId: string,
  toestemmingFotos: boolean,
  toestemmingDoor: string
) {
  const session = await auth();
  if (!session?.user?.organisatieId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  // Controleer dat bewoner tot dezelfde organisatie behoort
  const bewoner = await prisma.bewoner.findFirst({
    where: {
      id: bewonerId,
      organisatieId: session.user.organisatieId,
    },
  });

  if (!bewoner) throw new Error("Bewoner niet gevonden");

  await prisma.$transaction([
    prisma.bewoner.update({
      where: { id: bewonerId },
      data: {
        toestemmingFotos,
        toestemmingDoor: toestemmingFotos ? toestemmingDoor : null,
        toestemmingDatum: toestemmingFotos ? new Date() : null,
      },
    }),
    // AVG: bewaar elke toestemmingswijziging in het logboek
    prisma.toestemmingLog.create({
      data: {
        bewonerId,
        actie: toestemmingFotos ? "AAN" : "UIT",
        door: toestemmingDoor || session.user.naam || session.user.email || "Onbekend",
        uitgevoerdDoor: session.user.gebruikerId!,
      },
    }),
  ]);

  revalidatePath(`/coordinator/bewoners/${bewonerId}`);
  revalidatePath("/coordinator");
}

export async function getBewonersVoorOrganisatie() {
  const session = await auth();
  if (!session?.user?.organisatieId) throw new Error("Niet geautoriseerd");

  return prisma.bewoner.findMany({
    where: { organisatieId: session.user.organisatieId },
    orderBy: { naam: "asc" },
  });
}
