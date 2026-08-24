import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CalendarDays, HandHeart } from "lucide-react";
import { ACTIVITEIT_ICON, formatDuur, formatDatum, groepeerPerPeriode } from "@/lib/activiteit";
import AanmeldKnop from "@/app/vrijwilliger/hulp-gevraagd/AanmeldKnop";

function formatTijd(d: Date) {
  return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

export default async function VrijwilligerAgendaPage() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  const gebruikerId = session!.user.gebruikerId!;

  const activiteiten = await prisma.geplandeActiviteit.findMany({
    where: { organisatieId, datum: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    include: {
      hulpGevraagd: {
        include: {
          _count: { select: { reacties: { where: { status: { not: { in: ["afgewezen", "geweigerd"] } } } } } },
          reacties: { where: { gebruikerId }, select: { id: true, bericht: true, status: true } },
        },
      },
    },
    orderBy: { datum: "asc" },
  });

  const activiteitenPerPeriode = groepeerPerPeriode(activiteiten, (a) => new Date(a.datum));

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Agenda</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Geplande activiteiten</p>
      </div>

      {/* Activiteiten */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-900 text-[15px] flex items-center gap-1.5">
          <CalendarDays size={15} className="text-emerald-500" />
          Activiteiten
        </h2>
        {activiteiten.length === 0 ? (
          <p className="text-sm text-neutral-400 bg-white rounded-2xl border border-neutral-100 px-4 py-6 text-center">
            Nog geen activiteiten gepland.
          </p>
        ) : (
          activiteitenPerPeriode.map((periode) => (
            <div key={periode.label} className="space-y-3">
              <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-0.5">
                {periode.label}
              </h3>
              {periode.items.map((a) => {
                const cfg = a.type ? ACTIVITEIT_ICON[a.type] ?? ACTIVITEIT_ICON.Anders : ACTIVITEIT_ICON.Anders;
                const Icon = cfg.icon;
                return (
                  <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon size={16} className={cfg.kleur} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{a.titel}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {formatDatum(new Date(a.datum), { weekday: "short", day: "numeric", month: "short" })} · {formatTijd(new Date(a.datum))} · {formatDuur(a.duurMinuten)}
                          {a.locatie ? ` · ${a.locatie}` : ""}
                        </p>
                      </div>
                    </div>
                    {a.hulpGevraagd && (
                      <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                          <HandHeart size={13} />
                          {a.hulpGevraagd.titel}
                        </p>
                        <AanmeldKnop
                          hulpId={a.hulpGevraagd.id}
                          heeftGereageerd={a.hulpGevraagd.reacties.length > 0}
                          reactieBericht={a.hulpGevraagd.reacties[0]?.bericht}
                          reactieStatus={a.hulpGevraagd.reacties[0]?.status}
                          isOpen={a.hulpGevraagd.status === "open"}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
