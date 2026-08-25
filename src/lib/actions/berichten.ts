"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isVrijwilligerRol } from "@/lib/rollen";
import { sendEmail, coordinatorBerichtHtml } from "@/lib/email";

export async function stuurBericht(aanId: string, inhoud: string) {
  const session = await auth();
  if (!session?.user?.gebruikerId) throw new Error("Niet geautoriseerd");

  const rol = session.user.rol;
  if (rol !== "COORDINATOR" && !isVrijwilligerRol(rol)) throw new Error("Niet geautoriseerd");

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

export async function stuurBerichtAanIedereen(inhoud: string, ookPerEmail = false) {
  const session = await auth();
  if (!session?.user?.gebruikerId) throw new Error("Niet geautoriseerd");
  if (session.user.rol !== "COORDINATOR") throw new Error("Niet geautoriseerd");

  const inhoudTrimmed = inhoud.trim();
  if (!inhoudTrimmed || inhoudTrimmed.length > 2000) throw new Error("Ongeldig bericht");

  const [ontvangers, coordinator, organisatie] = await Promise.all([
    prisma.gebruiker.findMany({
      where: {
        organisatieId: session.user.organisatieId,
        rol: { in: ["VRIJWILLIGER", "WELZIJNSMEDEWERKER"] },
      },
      select: { id: true, naam: true, email: true },
    }),
    prisma.gebruiker.findUnique({ where: { id: session.user.gebruikerId }, select: { naam: true } }),
    prisma.organisatie.findUnique({ where: { id: session.user.organisatieId! }, select: { naam: true } }),
  ]);

  if (ontvangers.length === 0) return;

  await prisma.bericht.createMany({
    data: ontvangers.map((o) => ({
      organisatieId: session.user.organisatieId!,
      vanId: session.user.gebruikerId!,
      aanId: o.id,
      inhoud: inhoudTrimmed,
    })),
  });

  revalidatePath("/coordinator/berichten");
  for (const o of ontvangers) {
    revalidatePath(`/coordinator/berichten/${o.id}`);
    revalidatePath(`/vrijwilliger/berichten/${session.user.gebruikerId}`);
  }
  revalidatePath("/vrijwilliger/berichten");

  if (ookPerEmail) {
    await Promise.all(
      ontvangers.map((o) =>
        sendEmail({
          to: o.email,
          subject: `Bericht van ${coordinator?.naam ?? "je coördinator"}`,
          html: coordinatorBerichtHtml({
            naam: o.naam,
            coordinatorNaam: coordinator?.naam ?? "Je coördinator",
            inhoud: inhoudTrimmed,
            organisatie: organisatie?.naam ?? "Welzijnsklik",
          }),
        })
      )
    );
  }
}

export async function verwijderBericht(berichtId: string) {
  const session = await auth();
  if (!session?.user?.gebruikerId) throw new Error("Niet geautoriseerd");

  const bericht = await prisma.bericht.findFirst({
    where: { id: berichtId, vanId: session.user.gebruikerId },
  });
  if (!bericht) throw new Error("Bericht niet gevonden");

  const ontvanger = await prisma.gebruiker.findUnique({
    where: { id: bericht.aanId },
    select: { rol: true },
  });

  await prisma.bericht.delete({ where: { id: berichtId } });

  const vanRol = session.user.rol === "COORDINATOR" ? "coordinator" : "vrijwilliger";
  const aanRol = ontvanger?.rol === "COORDINATOR" ? "coordinator" : "vrijwilliger";

  revalidatePath(`/${vanRol}/berichten/${bericht.aanId}`);
  revalidatePath(`/${aanRol}/berichten/${bericht.vanId}`);
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
  if (session.user.rol !== "COORDINATOR" && !isVrijwilligerRol(session.user.rol)) return 0;

  try {
    return prisma.bericht.count({
      where: { aanId: session.user.gebruikerId, gelezen: false },
    });
  } catch {
    return 0;
  }
}
