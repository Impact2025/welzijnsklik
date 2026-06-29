"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Haal het aantal nieuwe (ongelezen) wervingsinteresses op voor de ingelogde coordinator.
 */
export async function getNieuweAanmeldingenCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.gebruikerId || !session.user.organisatieId) return 0;

  const rol = session.user.rol;
  if (rol !== "COORDINATOR") return 0;

  try {
    return prisma.wervingsinteresse.count({
      where: {
        status: "nieuw",
        gebruiker: { organisatieId: session.user.organisatieId },
      },
    });
  } catch {
    return 0;
  }
}
