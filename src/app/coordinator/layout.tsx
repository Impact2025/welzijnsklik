import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getNieuweAanmeldingenCount } from "@/lib/actions/notificaties";
import { getNieuweHulpReactiesCount } from "@/lib/actions/hulp-gevraagd";
import { getOngelezeBerichten } from "@/lib/actions/berichten";
import AppShell from "@/components/AppShell";

export default async function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "COORDINATOR") {
    redirect("/geen-toegang");
  }

  const [nieuweAanmeldingen, nieuweHulpReacties, ongelezeBerichten] = await Promise.all([
    getNieuweAanmeldingenCount(),
    getNieuweHulpReactiesCount(),
    getOngelezeBerichten(),
  ]);

  return (
    <AppShell
      rol="COORDINATOR"
      naam={session.user.naam ?? session.user.name ?? undefined}
      profielFoto={session.user.profielFoto}
      notificatieHref="/coordinator/meldingen"
      notificatieBadge={nieuweAanmeldingen}
      nieuweHulpReacties={nieuweHulpReacties}
      ongelezeBerichten={ongelezeBerichten}
    >
      {children}
    </AppShell>
  );
}
