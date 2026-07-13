import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";

export default async function FamilieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "FAMILIE") {
    redirect("/geen-toegang");
  }

  // Nieuwe activiteiten (afgelopen 7 dagen) van gekoppelde bewoners
  const weekGeleden = new Date();
  weekGeleden.setDate(weekGeleden.getDate() - 7);
  const nieuweActiviteiten = await prisma.activiteit.count({
    where: {
      bewoner: {
        familieleden: { some: { gebruikerId: session.user.gebruikerId } },
      },
      createdAt: { gte: weekGeleden },
    },
  }).catch(() => 0);

  return (
    <AppShell
      rol="FAMILIE"
      naam={session.user.naam ?? session.user.name ?? undefined}
      profielFoto={session.user.profielFoto}
      gebruikerId={session.user.gebruikerId}
      notificatieBadge={nieuweActiviteiten}
    >
      {children}
    </AppShell>
  );
}
