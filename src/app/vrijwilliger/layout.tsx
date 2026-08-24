import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getOpenHulpVragenCount, getVrijwilligerMeldingenCount } from "@/lib/actions/hulp-gevraagd";
import { getOngelezeBerichten } from "@/lib/actions/berichten";
import { isVrijwilligerRol } from "@/lib/rollen";
import { getAandachtRoodCount } from "@/lib/aandacht";
import { welzijncheckDezeMaandGedaan } from "@/lib/welzijnscheck";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";

export default async function VrijwilligerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || !isVrijwilligerRol(session.user.rol)) {
    redirect("/geen-toegang");
  }

  const isWelzijnsmedewerker = session.user.rol === "WELZIJNSMEDEWERKER";

  const [openHulpVragen, ongelezeBerichten, meldingenCount, aandachtCount, laatsteCheck] =
    await Promise.all([
      getOpenHulpVragenCount(),
      getOngelezeBerichten(),
      getVrijwilligerMeldingenCount(),
      isWelzijnsmedewerker ? getAandachtRoodCount(session.user.organisatieId!) : Promise.resolve(0),
      prisma.welzijnscheck.findFirst({
        where: { vrijwilligerId: session.user.gebruikerId! },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

  return (
    <AppShell
      rol={isWelzijnsmedewerker ? "WELZIJNSMEDEWERKER" : "VRIJWILLIGER"}
      naam={session.user.naam ?? session.user.name ?? undefined}
      profielFoto={session.user.profielFoto}
      gebruikerId={session.user.gebruikerId}
      notificatieBadge={meldingenCount}
      openHulpVragen={openHulpVragen}
      ongelezeBerichten={ongelezeBerichten}
      aandachtCount={aandachtCount}
      welzijncheckDue={!welzijncheckDezeMaandGedaan(laatsteCheck?.createdAt ?? null)}
    >
      {children}
    </AppShell>
  );
}
