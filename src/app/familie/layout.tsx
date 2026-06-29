import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

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
    <div className="min-h-screen bg-amber-50">
      <nav className="bg-amber-700 text-white px-4 py-3 flex items-center justify-between">
        <span className="font-bold">Welzijnsklik</span>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/familie" className="text-amber-100 hover:text-white">
            Tijdlijn
          </Link>
          <Link href="/familie/help-mee" className="text-amber-100 hover:text-white">
            Help mee
          </Link>
          <SignOutButton />
        </div>
      </nav>
      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
