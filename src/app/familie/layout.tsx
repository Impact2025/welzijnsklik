import { auth } from "@/auth";
import { redirect } from "next/navigation";
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

  return (
    <AppShell rol="FAMILIE" naam={session.user.naam ?? session.user.name ?? undefined}>
      {children}
    </AppShell>
  );
}
