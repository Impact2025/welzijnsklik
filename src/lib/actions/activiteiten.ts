"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail, activiteitHtml } from "@/lib/email";

export async function logActiviteit(formData: FormData) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "VRIJWILLIGER") {
    throw new Error("Niet geautoriseerd");
  }

  const bewonerId = formData.get("bewonerId") as string;
  const type = formData.get("type") as string;
  const duurMinuten = parseInt(formData.get("duurMinuten") as string, 10);
  const notities = formData.get("notities") as string | null;
  const fotoUrl = formData.get("fotoUrl") as string | null;

  // Controleer dat bewoner tot dezelfde organisatie behoort
  const bewoner = await prisma.bewoner.findFirst({
    where: {
      id: bewonerId,
      organisatieId: session.user.organisatieId,
    },
  });

  if (!bewoner) {
    throw new Error("Bewoner niet gevonden");
  }

  // Afdwingen: foto alleen toegestaan als toestemming is gegeven
  if (fotoUrl && !bewoner.toestemmingFotos) {
    throw new Error("Geen toestemming voor foto's voor deze bewoner");
  }

  await prisma.activiteit.create({
    data: {
      bewonerId,
      vrijwilligerId: session.user.gebruikerId,
      type,
      duurMinuten,
      notities: notities || null,
      fotoUrl: fotoUrl || null,
    },
  });

  // ─── Notificatie naar familieleden ────────────────────────────────
  const vrijwilliger = await prisma.gebruiker.findUnique({
    where: { id: session.user.gebruikerId },
    select: { naam: true, organisatie: { select: { naam: true } } },
  });

  const familieleden = await prisma.familieKoppeling.findMany({
    where: { bewonerId },
    include: {
      gebruiker: {
        select: { email: true, naam: true },
        include: { emailVoorkeur: { select: { activiteiten: true } } },
      },
    },
  });

  for (const koppeling of familieleden) {
    const magNotificatie = koppeling.gebruiker.emailVoorkeur?.activiteiten !== false;
    if (magNotificatie && koppeling.gebruiker.email) {
      const html = activiteitHtml(
        bewoner.naam,
        vrijwilliger?.naam ?? "Onbekend",
        type,
        duurMinuten,
        notities,
        koppeling.relatie,
        vrijwilliger?.organisatie.naam ?? "Welzijnsklik"
      );
      await sendEmail({
        to: koppeling.gebruiker.email,
        subject: `${vrijwilliger?.naam ?? "Iemand"} was ${type.toLowerCase()} bij ${bewoner.naam}`,
        html,
      });
    }
  }

  revalidatePath("/coordinator");
  revalidatePath("/vrijwilliger");
  revalidatePath("/familie");
}

export async function getActiviteitenVoorOrganisatie() {
  const session = await auth();
  if (!session?.user?.organisatieId || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }

  return prisma.activiteit.findMany({
    where: {
      bewoner: { organisatieId: session.user.organisatieId },
    },
    include: {
      bewoner: { select: { naam: true } },
      vrijwilliger: { select: { naam: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
