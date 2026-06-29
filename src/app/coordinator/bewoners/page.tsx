import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Camera, ChevronRight, Activity } from "lucide-react";

export default async function BewonersOverzicht() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const bewoners = await prisma.bewoner.findMany({
    where: { organisatieId },
    orderBy: { naam: "asc" },
    include: {
      _count: { select: { activiteiten: true } },
    },
  });

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Bewoners</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{bewoners.length} bewoners in De Meerwende</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        {bewoners.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Users size={24} className="text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm">Geen bewoners gevonden.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {bewoners.map((b) => (
              <Link
                key={b.id}
                href={`/coordinator/bewoners/${b.id}`}
                className="flex items-center gap-4 px-4 py-4 hover:bg-neutral-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 font-bold text-sm">
                    {b.naam.split(" ")[0][0]}{b.naam.split(" ").at(-1)?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{b.naam}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Activity size={11} />
                      {b._count.activiteiten} activiteiten
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${b.toestemmingFotos ? "text-emerald-600" : "text-neutral-400"}`}>
                      <Camera size={11} />
                      {b.toestemmingFotos ? "Foto OK" : "Geen foto"}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-neutral-300 group-hover:text-neutral-400 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
