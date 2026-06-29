import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

export default async function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "COORDINATOR") {
    redirect("/geen-toegang");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-amber-700 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg">Welzijnsklik</span>
          <Link href="/coordinator" className="text-amber-100 hover:text-white text-sm">
            Dashboard
          </Link>
          <Link href="/coordinator/bewoners" className="text-amber-100 hover:text-white text-sm">
            Bewoners
          </Link>
          <Link href="/coordinator/briefjes" className="text-amber-100 hover:text-white text-sm">
            Briefjes
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-amber-200">{session.user.naam ?? session.user.email}</span>
          <SignOutButton />
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
