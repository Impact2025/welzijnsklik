import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, CalendarDays, Clock, MapPin, Megaphone, Users } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { ACTIVITEIT_ICON } from "@/lib/activiteit";

function formatDatum(datum: Date) {
  return datum.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
}
function formatTijd(datum: Date) {
  return datum.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}
function formatDuur(min: number) {
  if (min < 60) return `${min} min`;
  const u = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${u}u ${m}min` : `${u} uur`;
}

export default async function ActiviteitenOverzicht() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const activiteiten = await prisma.geplandeActiviteit.findMany({
    where: { organisatieId },
    include: {
      hulpGevraagd: {
        select: {
          id: true,
          titel: true,
          status: true,
          aantalNodig: true,
          _count: { select: { reacties: { where: { status: { not: { in: ["afgewezen", "geweigerd"] } } } } } },
        },
      },
    },
    orderBy: { datum: "asc" },
  });

  const open = activiteiten.filter((a) => new Date(a.datum) >= new Date(new Date().setHours(0, 0, 0, 0)));
  const verleden = activiteiten.filter((a) => new Date(a.datum) < new Date(new Date().setHours(0, 0, 0, 0)));

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Activiteiten</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {activiteiten.length} gepland{activiteiten.length !== 1 ? "e" : ""}
          </p>
        </div>
        <Link
          href="/coordinator/activiteiten/nieuw"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-2xl text-sm transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nieuw
        </Link>
      </div>

      {activiteiten.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nog geen activiteiten gepland"
          description="Plan een activiteit en koppel er eventueel een hulpvraag aan. Vrijwilligers en familieleden zien deze in hun agenda."
          action={
            <Link
              href="/coordinator/activiteiten/nieuw"
              className="inline-flex items-center gap-2 bg-amber-500 text-white font-semibold text-sm py-2.5 px-5 rounded-xl hover:bg-amber-600 transition-colors"
            >
              <Plus size={15} />
              Eerste activiteit plannen
            </Link>
          }
        />
      ) : (
        <>
          {open.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-900 text-[15px]">Komende activiteiten</h2>
              {open.map((a) => {
                const cfg = a.type ? ACTIVITEIT_ICON[a.type] ?? ACTIVITEIT_ICON.Anders : ACTIVITEIT_ICON.Anders;
                const Icon = cfg.icon;
                const gekoppeld = a.hulpGevraagd;
                const vol = gekoppeld ? gekoppeld._count.reacties >= gekoppeld.aantalNodig : false;
                return (
                  <Link
                    key={a.id}
                    href={`/coordinator/activiteiten/${a.id}`}
                    className="block bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                            <Icon size={16} className={cfg.kleur} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{a.titel}</p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {formatDatum(new Date(a.datum))} · {formatTijd(new Date(a.datum))} · {formatDuur(a.duurMinuten)}
                              {a.locatie ? ` · ${a.locatie}` : ""}
                            </p>
                          </div>
                        </div>
                        {gekoppeld && (
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                              vol ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"
                            }`}
                          >
                            Hulp {vol ? "vol" : "open"}
                          </span>
                        )}
                      </div>
                      {gekoppeld && (
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 pl-13">
                          <Megaphone size={12} className="text-amber-500 flex-shrink-0" />
                          <span className="truncate">{gekoppeld.titel}</span>
                          <span className="flex items-center gap-0.5 ml-auto flex-shrink-0">
                            <Users size={11} />
                            {gekoppeld._count.reacties}/{gekoppeld.aantalNodig}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {verleden.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-neutral-400 text-[13px] uppercase tracking-wider">Verleden</h2>
              {verleden.map((a) => {
                const cfg = a.type ? ACTIVITEIT_ICON[a.type] ?? ACTIVITEIT_ICON.Anders : ACTIVITEIT_ICON.Anders;
                const Icon = cfg.icon;
                return (
                  <Link
                    key={a.id}
                    href={`/coordinator/activiteiten/${a.id}`}
                    className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 hover:shadow-md transition-shadow opacity-70"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon size={15} className={cfg.kleur} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{a.titel}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {formatDatum(new Date(a.datum))} · {formatTijd(new Date(a.datum))}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
