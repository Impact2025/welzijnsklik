import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getNieuweAanmeldingenCount } from "@/lib/actions/notificaties";
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

  const nieuweAanmeldingen = await getNieuweAanmeldingenCount();

  return (
    <AppShell
      rol="COORDINATOR"
      naam={session.user.naam ?? session.user.name ?? undefined}
      nieuweAanmeldingen={nieuweAanmeldingen}
    >
      {children}
    </AppShell>
  );
}
