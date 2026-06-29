import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

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
    <div className="min-h-screen bg-amber-50">
      <nav className="bg-amber-700 text-white px-4 py-3 flex items-center justify-between">
        <span className="font-bold">Welzijnsklik</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-amber-200">{session.user.naam ?? session.user.email}</span>
          <SignOutButton />
        </div>
      </nav>
      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
