"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Plaats of verwijder een emoji-reactie (toggle).
 */
export async function toggleReactie(activiteitId: string, emoji: string) {
  const session = await auth();
  if (!session?.user?.gebruikerId) throw new Error("Niet geautoriseerd");

  const bestaand = await prisma.reactie.findUnique({
    where: {
      activiteitId_gebruikerId_emoji: { activiteitId, gebruikerId: session.user.gebruikerId, emoji },
    },
  });

  if (bestaand) {
    await prisma.reactie.delete({ where: { id: bestaand.id } });
  } else {
    await prisma.reactie.create({
      data: {
        activiteitId,
        gebruikerId: session.user.gebruikerId,
        emoji,
      },
    });
  }

  revalidatePath("/familie");
}

/**
 * Plaats een tekstbericht bij een activiteit.
 */
export async function plaatsBericht(activiteitId: string, bericht: string) {
  const session = await auth();
  if (!session?.user?.gebruikerId) throw new Error("Niet geautoriseerd");
  if (!bericht.trim()) throw new Error("Bericht mag niet leeg zijn");

  await prisma.reactie.create({
    data: {
      activiteitId,
      gebruikerId: session.user.gebruikerId,
      emoji: "💬", // berichten krijgen een vast icoon
      bericht: bericht.trim(),
    },
  });

  revalidatePath("/familie");
}

/**
 * Verwijder een eigen bericht.
 */
export async function verwijderReactie(reactieId: string) {
  const session = await auth();
  if (!session?.user?.gebruikerId) throw new Error("Niet geautoriseerd");

  const reactie = await prisma.reactie.findUnique({ where: { id: reactieId } });
  if (!reactie || reactie.gebruikerId !== session.user.gebruikerId) {
    throw new Error("Niet geautoriseerd");
  }

  await prisma.reactie.delete({ where: { id: reactieId } });
  revalidatePath("/familie");
}
