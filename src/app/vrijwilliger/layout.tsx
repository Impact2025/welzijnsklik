import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getOpenHulpVragenCount } from "@/lib/actions/hulp-gevraagd";
import { getOngelezeBerichten } from "@/lib/actions/berichten";
import AppShell from "@/components/AppShell";

export default async function VrijwilligerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "VRIJWILLIGER") {
    redirect("/geen-toegang");
  }

  const [openHulpVragen, ongelezeBerichten] = await Promise.all([
    getOpenHulpVragenCount(),
    getOngelezeBerichten(),
  ]);

  return (
    <AppShell
      rol="VRIJWILLIGER"
      naam={session.user.naam ?? session.user.name ?? undefined}
      profielFoto={session.user.profielFoto}
      notificatieHref="/vrijwilliger/meldingen"
      notificatieBadge={openHulpVragen}
      openHulpVragen={openHulpVragen}
      ongelezeBerichten={ongelezeBerichten}
    >
      {children}
    </AppShell>
  );
}
