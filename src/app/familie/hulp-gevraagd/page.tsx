import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, Clock, Users, Megaphone, HandHeart } from "lucide-react";
import { EmptyState } from "@/components/ui";
import AanmeldKnop from "@/app/vrijwilliger/hulp-gevraagd/AanmeldKnop";
import { getFotoUrl } from "@/lib/foto";

const STATUS_CFG: Record<string, { label: string; bg: string; kleur: string }> = {
  open: { label: "Open", bg: "bg-emerald-100", kleur: "text-emerald-700" },
  vol: { label: "Vol", bg: "bg-amber-100", kleur: "text-amber-700" },
  gesloten: { label: "Gesloten", bg: "bg-neutral-100", kleur: "text-neutral-500" },
};

function formatDatum(datum: Date) {
  return datum.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
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

export default async function FamilieHulpGevraagdPage() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  const gebruikerId = session!.user.gebruikerId!;

  const items = await prisma.hulpGevraagd.findMany({
    where: { organisatieId, status: { in: ["open", "vol"] }, datum: { gte: new Date() }, geplandeActiviteit: null },
    include: {
      _count: { select: { reacties: { where: { status: { not: { in: ["afgewezen", "geweigerd"] } } } } } },
      reacties: { where: { gebruikerId }, select: { id: true, bericht: true, status: true } },
    },
    orderBy: { datum: "asc" },
  });

  const mijnaanmeldingen = await prisma.hulpReactie.findMany({
    where: { gebruikerId, hulpGevraagd: { datum: { lt: new Date() }, organisatieId } },
    include: { hulpGevraagd: { select: { titel: true, datum: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Hulp gevraagd</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {items.length > 0 ? `${items.length} oproep${items.length !== 1 ? "en" : ""} beschikbaar` : "Geen oproepen op dit moment"}
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Geen oproepen beschikbaar"
          description="De coördinator plaatst hier oproepen als er hulp nodig is. Kom later nog eens kijken!"
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const cfg = STATUS_CFG[item.status] ?? STATUS_CFG.open;
            const eigenReactie = item.reacties[0];
            const bezet = item._count.reacties;
            const vrij = item.aantalNodig - bezet;
            const isOpen = item.status === "open";
            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                {item.fotoUrl && (
                  <div className="w-full h-40 bg-neutral-100 overflow-hidden">
                    <img src={getFotoUrl(item.fotoUrl, item.id, "hulp") ?? ""} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-gray-900 leading-snug">{item.titel}</h2>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.kleur}`}>{cfg.label}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Calendar size={14} className="text-amber-500 flex-shrink-0" />
                      <span>{formatDatum(new Date(item.datum))}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Clock size={14} className="text-amber-500 flex-shrink-0" />
                      <span>{formatTijd(new Date(item.datum))} · {formatDuur(item.duurMinuten)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Users size={14} className="text-amber-500 flex-shrink-0" />
                      <span>{isOpen && vrij > 0 ? `Nog ${vrij} plek${vrij !== 1 ? "ken" : ""} beschikbaar` : `${item.aantalNodig} helper${item.aantalNodig !== 1 ? "s" : ""} nodig`}</span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.omschrijving}</p>
                  <AanmeldKnop
                    hulpId={item.id}
                    heeftGereageerd={!!eigenReactie}
                    reactieBericht={eigenReactie?.bericht}
                    reactieStatus={eigenReactie?.status}
                    isOpen={isOpen}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mijnaanmeldingen.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-neutral-400 text-[13px] uppercase tracking-wider">Eerder meegedaan</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 divide-y divide-neutral-50">
            {mijnaanmeldingen.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <HandHeart size={15} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{r.hulpGevraagd.titel}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {new Date(r.hulpGevraagd.datum).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${r.status === "bevestigd" ? "bg-emerald-100 text-emerald-700" : r.status === "afgewezen" ? "bg-neutral-100 text-neutral-500" : "bg-sky-100 text-sky-700"}`}>
                  {r.status === "bevestigd" ? "Bevestigd" : r.status === "afgewezen" ? "Afgewezen" : "Aangemeld"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
