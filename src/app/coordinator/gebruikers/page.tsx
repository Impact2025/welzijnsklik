import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import { UitnodigForm } from "./UitnodigForm";

const ROL_LABELS: Record<string, string> = {
  COORDINATOR: "Coördinator",
  VRIJWILLIGER: "Vrijwilliger",
  FAMILIE: "Familie",
};

const ROL_KLEUR: Record<string, string> = {
  COORDINATOR: "bg-violet-100 text-violet-700",
  VRIJWILLIGER: "bg-emerald-100 text-emerald-700",
  FAMILIE: "bg-sky-100 text-sky-700",
};

export default async function GebruikersBeheerPage() {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    redirect("/geen-toegang");
  }

  const organisatieId = session.user.organisatieId!;

  const gebruikers = await prisma.gebruiker.findMany({
    where: { organisatieId },
    orderBy: [{ rol: "asc" }, { naam: "asc" }],
    select: {
      id: true,
      naam: true,
      email: true,
      rol: true,
      createdAt: true,
      user: { select: { emailVerified: true } },
    },
  });

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gebruikers</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{gebruikers.length} gebruikers</p>
        </div>
        <UitnodigForm organisatieId={organisatieId} />
      </div>

      {/* Lijst */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        {gebruikers.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Users size={24} className="text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm">Nog geen gebruikers.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {gebruikers.map((g) => (
              <Link
                key={g.id}
                href={`/coordinator/gebruikers/${g.id}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 font-bold text-xs">
                    {g.naam.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{g.naam}</p>
                  <p className="text-xs text-neutral-400 truncate">{g.email}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${ROL_KLEUR[g.rol] ?? "bg-neutral-100 text-neutral-600"}`}>
                  {ROL_LABELS[g.rol] ?? g.rol}
                </span>
                {!g.user.emailVerified && (
                  <span className="text-[10px] text-amber-600 font-semibold flex-shrink-0">Nog niet ingelogd</span>
                )}
                <ChevronRight size={14} className="text-neutral-300 group-hover:text-neutral-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-xs text-amber-800 font-medium">
          Nieuwe gebruikers ontvangen een uitnodigingslink per e-mail. Na het aanmelden kunnen
          ze direct aan de slag met de juiste rol en organisatie.
        </p>
      </div>
    </div>
  );
}
