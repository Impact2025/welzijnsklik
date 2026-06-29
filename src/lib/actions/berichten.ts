"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function stuurBericht(aanId: string, inhoud: string) {
  const session = await auth();
  if (!session?.user?.gebruikerId) throw new Error("Niet geautoriseerd");

  const rol = session.user.rol;
  if (rol !== "COORDINATOR" && rol !== "VRIJWILLIGER") throw new Error("Niet geautoriseerd");

  const inhoudTrimmed = inhoud.trim();
  if (!inhoudTrimmed || inhoudTrimmed.length > 2000) throw new Error("Ongeldig bericht");

  // Controleer dat ontvanger in dezelfde organisatie zit
  const ontvanger = await prisma.gebruiker.findFirst({
    where: { id: aanId, organisatieId: session.user.organisatieId },
  });
  if (!ontvanger) throw new Error("Ontvanger niet gevonden");

  await prisma.bericht.create({
    data: {
      organisatieId: session.user.organisatieId!,
      vanId: session.user.gebruikerId,
      aanId,
      inhoud: inhoudTrimmed,
    },
  });

  const vanRol = rol === "COORDINATOR" ? "coordinator" : "vrijwilliger";
  const aanRol = ontvanger.rol === "COORDINATOR" ? "coordinator" : "vrijwilliger";

  revalidatePath(`/${vanRol}/berichten/${aanId}`);
  revalidatePath(`/${aanRol}/berichten/${session.user.gebruikerId}`);
  revalidatePath(`/${vanRol}/berichten`);
  revalidatePath(`/${aanRol}/berichten`);
}

export async function markeerGelezen(vanId: string) {
  const session = await auth();
  if (!session?.user?.gebruikerId) return;

  await prisma.bericht.updateMany({
    where: {
      vanId,
      aanId: session.user.gebruikerId,
      gelezen: false,
    },
    data: { gelezen: true },
  });
}

export async function getOngelezeBerichten(): Promise<number> {
  const session = await auth();
  if (!session?.user?.gebruikerId) return 0;
  if (session.user.rol !== "COORDINATOR" && session.user.rol !== "VRIJWILLIGER") return 0;

  try {
    return prisma.bericht.count({
      where: { aanId: session.user.gebruikerId, gelezen: false },
    });
  } catch {
    return 0;
  }
}
