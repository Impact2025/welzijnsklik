import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

  const weekGeleden = new Date();
  weekGeleden.setDate(weekGeleden.getDate() - 7);
  const gebruikerId = session.user.gebruikerId;

  const [openHulpVragen, ongelezeBerichten, nieuweReacties] = await Promise.all([
    getOpenHulpVragenCount(),
    getOngelezeBerichten(),
    gebruikerId
      ? prisma.reactie
          .count({
            where: {
              activiteit: { vrijwilligerId: gebruikerId },
              createdAt: { gte: weekGeleden },
            },
          })
          .catch(() => 0)
      : Promise.resolve(0),
  ]);

  return (
    <AppShell
      rol="VRIJWILLIGER"
      naam={session.user.naam ?? session.user.name ?? undefined}
      profielFoto={session.user.profielFoto}
      notificatieBadge={nieuweReacties}
      openHulpVragen={openHulpVragen}
      ongelezeBerichten={ongelezeBerichten}
    >
      {children}
    </AppShell>
  );
}
