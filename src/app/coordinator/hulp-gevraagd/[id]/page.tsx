import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, Clock, Calendar, MessageSquare, UserCheck, Pencil } from "lucide-react";
import { ReactieKnopjes, StatusKnop } from "./ReactieActies";

const STATUS_CFG: Record<string, { label: string; bg: string; kleur: string }> = {
  open: { label: "Open", bg: "bg-emerald-100", kleur: "text-emerald-700" },
  vol: { label: "Vol", bg: "bg-amber-100", kleur: "text-amber-700" },
  gesloten: { label: "Gesloten", bg: "bg-neutral-100", kleur: "text-neutral-500" },
};

const REACTIE_CFG: Record<string, { label: string; bg: string; kleur: string }> = {
  aangemeld: { label: "Aangemeld", bg: "bg-sky-100", kleur: "text-sky-700" },
  bevestigd: { label: "Bevestigd", bg: "bg-emerald-100", kleur: "text-emerald-700" },
  afgewezen: { label: "Afgewezen", bg: "bg-neutral-100", kleur: "text-neutral-500" },
};

function formatDatum(datum: Date) {
  return datum.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuur(min: number) {
  if (min < 60) return `${min} min`;
  const u = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${u}u ${m}min` : `${u} uur`;
}

export default async function HulpGevraagdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const hulp = await prisma.hulpGevraagd.findFirst({
    where: { id, organisatieId },
    include: {
      reacties: {
        include: { vrijwilliger: { select: { naam: true, email: true, telefoon: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!hulp) notFound();

  const statusCfg = STATUS_CFG[hulp.status] ?? STATUS_CFG.open;
  const bevestigd = hulp.reacties.filter((r) => r.status === "bevestigd");
  const aangemeld = hulp.reacties.filter((r) => r.status === "aangemeld");
  const afgewezen = hulp.reacties.filter((r) => r.status === "afgewezen");

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Back + bewerken */}
      <div className="flex items-center justify-between">
        <Link
          href="/coordinator/hulp-gevraagd"
          className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-600 text-sm transition-colors"
        >
          <ChevronLeft size={15} />
          Hulp gevraagd
        </Link>
        <Link
          href={`/coordinator/hulp-gevraagd/${hulp.id}/bewerken`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
        >
          <Pencil size={14} />
          Bewerken
        </Link>
      </div>

      {/* Hero foto */}
      {hulp.fotoUrl && (
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100">
          <img src={hulp.fotoUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-bold text-gray-900 leading-tight">{hulp.titel}</h1>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${statusCfg.bg} ${statusCfg.kleur}`}>
            {statusCfg.label}
          </span>
        </div>

        <p className="text-sm text-neutral-600 leading-relaxed">{hulp.omschrijving}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Calendar size={14} className="text-amber-500" />
            <span className="font-medium text-gray-700">
              {new Date(hulp.datum).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Clock size={14} className="text-amber-500" />
            <span className="font-medium text-gray-700">
              {new Date(hulp.datum).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
              {" · "}{formatDuur(hulp.duurMinuten)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Users size={14} className="text-amber-500" />
            <span className="font-medium text-gray-700">
              {bevestigd.length + aangemeld.length} / {hulp.aantalNodig} aangemeld
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <UserCheck size={14} className="text-emerald-500" />
            <span className="font-medium text-gray-700">{bevestigd.length} bevestigd</span>
          </div>
        </div>

        {/* Voortgangsbalk */}
        <div className="space-y-1">
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min((bevestigd.length / hulp.aantalNodig) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-neutral-400">
            {bevestigd.length} van {hulp.aantalNodig} bevestigd
          </p>
        </div>

        <StatusKnop hulpId={hulp.id} huidigStatus={hulp.status} />
      </div>

      {/* Reacties */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-900 text-[15px]">
          Aanmeldingen ({hulp.reacties.length})
        </h2>

        {hulp.reacties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 px-4 py-10 text-center">
            <Users size={24} className="text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm">Nog niemand aangemeld.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...aangemeld, ...bevestigd, ...afgewezen].map((r) => {
              const cfg = REACTIE_CFG[r.status] ?? REACTIE_CFG.aangemeld;
              return (
                <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{r.vrijwilliger.naam}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {r.vrijwilliger.email}
                        {r.vrijwilliger.telefoon && ` · ${r.vrijwilliger.telefoon}`}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.kleur}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {r.bericht && (
                    <div className="bg-neutral-50 rounded-xl px-3.5 py-3 flex items-start gap-2">
                      <MessageSquare size={12} className="text-neutral-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-neutral-600 leading-relaxed">{r.bericht}</p>
                    </div>
                  )}

                  <ReactieKnopjes reactieId={r.id} huidigStatus={r.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
