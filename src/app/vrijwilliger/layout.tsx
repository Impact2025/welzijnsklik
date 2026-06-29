import { auth } from "@/auth";
import { redirect } from "next/navigation";
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

  return (
    <AppShell rol="VRIJWILLIGER" naam={session.user.naam ?? session.user.name ?? undefined}>
      {children}
    </AppShell>
  );
}
