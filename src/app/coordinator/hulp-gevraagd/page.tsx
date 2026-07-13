import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Calendar, Clock, Users, ChevronRight, Megaphone } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { getFotoUrl } from "@/lib/foto";

const STATUS_CFG: Record<string, { label: string; bg: string; kleur: string; dot: string }> = {
  open: { label: "Open", bg: "bg-emerald-100", kleur: "text-emerald-700", dot: "bg-emerald-500" },
  vol: { label: "Vol", bg: "bg-amber-100", kleur: "text-amber-700", dot: "bg-amber-500" },
  gesloten: { label: "Gesloten", bg: "bg-neutral-100", kleur: "text-neutral-500", dot: "bg-neutral-300" },
};

function formatDatum(datum: Date) {
  return datum.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
}

function formatDuur(min: number) {
  if (min < 60) return `${min} min`;
  const u = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${u}u ${m}min` : `${u} uur`;
}

export default async function HulpGevraagdOverzicht() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const items = await prisma.hulpGevraagd.findMany({
    where: { organisatieId },
    include: {
      _count: { select: { reacties: true } },
      reacties: { where: { status: "aangemeld" }, select: { id: true } },
    },
    orderBy: { datum: "asc" },
  });

  const open = items.filter((i) => i.status !== "gesloten");
  const gesloten = items.filter((i) => i.status === "gesloten");
  const totaalNieuw = items.reduce((s, i) => s + i.reacties.length, 0);

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hulp gevraagd</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {open.length > 0 ? `${open.length} open oproep${open.length !== 1 ? "en" : ""}` : "Geen open oproepen"}
            {totaalNieuw > 0 && ` · ${totaalNieuw} nieuwe reactie${totaalNieuw !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/coordinator/hulp-gevraagd/nieuw"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-2xl text-sm transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nieuw
        </Link>
      </div>

      {/* Open items */}
      {open.length === 0 && gesloten.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Nog geen oproepen geplaatst"
          description="Maak een oproep aan en vrijwilligers kunnen direct reageren."
          action={
            <Link
              href="/coordinator/hulp-gevraagd/nieuw"
              className="inline-flex items-center gap-2 bg-amber-500 text-white font-semibold text-sm py-2.5 px-5 rounded-xl hover:bg-amber-600 transition-colors"
            >
              <Plus size={15} />
              Eerste oproep plaatsen
            </Link>
          }
        />
      ) : (
        <>
          {open.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-900 text-[15px]">Open oproepen</h2>
              {open.map((item) => {
                const cfg = STATUS_CFG[item.status] ?? STATUS_CFG.open;
                const nieuweReacties = item.reacties.length;
                return (
                  <Link
                    key={item.id}
                    href={`/coordinator/hulp-gevraagd/${item.id}`}
                    className="block bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    {item.fotoUrl && (
                      <div className="w-full h-32 bg-neutral-100 overflow-hidden">
                        <img
                          src={getFotoUrl(item.fotoUrl, item.id, "hulp") ?? ""}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug">{item.titel}</h3>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {nieuweReacties > 0 && (
                            <span className="w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              {nieuweReacties > 9 ? "9+" : nieuweReacties}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.kleur}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-amber-500" />
                          {formatDatum(new Date(item.datum))} · {new Date(item.datum).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatDuur(item.duurMinuten)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {item._count.reacties}/{item.aantalNodig}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Gesloten items */}
          {gesloten.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-neutral-400 text-[13px] uppercase tracking-wider">Gesloten</h2>
              {gesloten.map((item) => (
                <Link
                  key={item.id}
                  href={`/coordinator/hulp-gevraagd/${item.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 hover:shadow-md transition-shadow opacity-70"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <Megaphone size={16} className="text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{item.titel}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {formatDatum(new Date(item.datum))} · {item._count.reacties} reactie{item._count.reacties !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronRight size={15} className="text-neutral-300" />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
