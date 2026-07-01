import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminAppShell from "@/components/AdminAppShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "COORDINATOR") {
    redirect("/geen-toegang");
  }

  const naam = session.user.naam ?? session.user.name ?? "Admin";

  return (
    <AdminAppShell
      naam={naam}
      profielFoto={session.user.profielFoto}
    >
      {children}
    </AdminAppShell>
  );
}
