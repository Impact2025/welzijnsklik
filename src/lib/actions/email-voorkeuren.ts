"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Werk de emailvoorkeuren van de ingelogde gebruiker bij.
 */
export async function updateEmailVoorkeuren(
  activiteiten: boolean,
  wekelijkseDigest: boolean
) {
  const session = await auth();
  if (!session?.user?.gebruikerId) throw new Error("Niet geautoriseerd");

  await prisma.emailVoorkeur.upsert({
    where: { gebruikerId: session.user.gebruikerId },
    update: { activiteiten, wekelijkseDigest },
    create: {
      gebruikerId: session.user.gebruikerId,
      activiteiten,
      wekelijkseDigest,
    },
  });

  revalidatePath("/account");
}

/**
 * Haal de emailvoorkeuren op voor de ingelogde gebruiker.
 */
export async function getEmailVoorkeuren() {
  const session = await auth();
  if (!session?.user?.gebruikerId) {
    return { activiteiten: true, wekelijkseDigest: true };
  }

  const voorkeur = await prisma.emailVoorkeur.findUnique({
    where: { gebruikerId: session.user.gebruikerId },
  });

  return {
    activiteiten: voorkeur?.activiteiten ?? true,
    wekelijkseDigest: voorkeur?.wekelijkseDigest ?? true,
  };
}
