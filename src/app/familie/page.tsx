import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Handshake, Users2, Clock } from "lucide-react";
import { ACTIVITEIT_ICON, formatDatum, formatDuur } from "@/lib/activiteit";
import { getFotoUrl } from "@/lib/foto";
import Reacties from "@/components/Reacties";

export default async function FamilieTijdlijn() {
  const session = await auth();
  const gebruikerId = session!.user.gebruikerId!;

  const koppelingen = await prisma.familieKoppeling.findMany({
    where: { gebruikerId },
    include: {
      bewoner: {
        include: {
          activiteiten: {
            orderBy: { createdAt: "desc" },
            take: 50,
            include: {
              vrijwilliger: { select: { naam: true } },
              reacties: {
                orderBy: { createdAt: "asc" },
                include: { gebruiker: { select: { id: true, naam: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (koppelingen.length === 0) {
    return (
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-2xl">
            <Users2 size={22} className="text-neutral-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Nog niet gekoppeld</p>
            <p className="text-neutral-500 text-sm mt-1">
              Neem contact op met de coordinator om gekoppeld te worden aan een bewoner.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Vind de nieuwste activiteit met foto over al je gekoppelde bewoners
  const alleActiviteiten = koppelingen.flatMap((k) =>
    k.bewoner.activiteiten.map((a) => ({ ...a, bewonerNaam: k.bewoner.naam, toestemmingFotos: k.bewoner.toestemmingFotos }))
  );
  const laatsteMetFoto = alleActiviteiten.find(
    (a) => a.fotoUrl && a.toestemmingFotos
  );
  const laatsteCfg = laatsteMetFoto
    ? ACTIVITEIT_ICON[laatsteMetFoto.type] ?? ACTIVITEIT_ICON.Anders
    : null;
  const LaatsteIcon = laatsteCfg?.icon;

  return (
    <div className="px-4 py-6 space-y-6">

      {/* ─── Laatste foto — groot en pro ─── */}
      {laatsteMetFoto && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="relative w-full aspect-[16/9] bg-warm-100 overflow-hidden">
            <img
              src={getFotoUrl(laatsteMetFoto.fotoUrl, laatsteMetFoto.bewonerId) ?? ""}
              alt=""
              className="w-full h-full object-cover"
            />
            {/* Type badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow-sm">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${laatsteCfg!.bg}`}>
                {LaatsteIcon && <LaatsteIcon size={12} className={laatsteCfg!.kleur} />}
              </div>
              <span className="text-xs font-bold text-gray-800">{laatsteMetFoto.type}</span>
            </div>
            {/* Gradient onderaan */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white font-bold text-sm drop-shadow-sm">
                {laatsteMetFoto.vrijwilliger.naam}
                <span className="font-normal opacity-80"> bij </span>
                {laatsteMetFoto.bewonerNaam}
              </p>
              <p className="text-white/80 text-xs mt-0.5 drop-shadow-sm flex items-center gap-1.5">
                <Clock size={11} />
                {formatDuur(laatsteMetFoto.duurMinuten)}
                <span className="opacity-50">·</span>
                {formatDatum(new Date(laatsteMetFoto.createdAt), {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          {/* Notities */}
          {laatsteMetFoto.notities && (
            <div className="p-4">
              <div className="bg-warm-50 rounded-xl p-3.5 border border-warm-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-1 h-full min-h-[20px] bg-brand-500 rounded-full flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-semibold text-warm-500 uppercase tracking-wider mb-0.5">
                      {laatsteMetFoto.vrijwilliger.naam}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {laatsteMetFoto.notities}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {koppelingen.map(({ bewoner, relatie }) => (
        <div key={bewoner.id} className="space-y-4">
          {/* Bewoner header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-700 font-bold">
                {bewoner.naam.split(" ")[0][0]}{bewoner.naam.split(" ").at(-1)?.[0]}
              </span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-[17px]">{bewoner.naam}</h1>
              <p className="text-xs text-neutral-500 capitalize">{relatie}</p>
            </div>
          </div>

          {/* Activiteiten tijdlijn */}
          {bewoner.activiteiten.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 px-4 py-6 text-center">
              <p className="text-neutral-400 text-sm">Nog geen activiteiten geregistreerd.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {bewoner.activiteiten.map((a) => {
                const cfg = ACTIVITEIT_ICON[a.type] ?? ACTIVITEIT_ICON.Anders;
                const Icon = cfg.icon;
                return (
                  <div
                    key={a.id}
                    className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4"
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon size={16} className={cfg.kleur} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{a.type}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          met {a.vrijwilliger.naam} · {a.duurMinuten} min ·{" "}
                          {formatDatum(new Date(a.createdAt), { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                        {a.notities && (
                          <p className="text-sm text-gray-700 mt-1.5 leading-snug">{a.notities}</p>
                        )}
                      </div>
                      {a.fotoUrl && bewoner.toestemmingFotos && (
                        <img
                          src={getFotoUrl(a.fotoUrl, bewoner.id) ?? ""}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                      )}
                    </div>
                    <Reacties
                      activiteitId={a.id}
                      reacties={a.reacties.map((r) => ({
                        id: r.id,
                        emoji: r.emoji,
                        bericht: r.bericht,
                        createdAt: r.createdAt,
                        gebruiker: { id: r.gebruiker.id, naam: r.gebruiker.naam },
                      }))}
                      gebruikersId={session!.user.gebruikerId!}
                      gebruikersNaam={session!.user.naam ?? session!.user.name ?? "Ik"}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <Link
            href="/familie/help-mee"
            className="flex items-center justify-center gap-2 w-full bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold py-3.5 rounded-2xl text-sm transition-colors border border-amber-200"
          >
            <Handshake size={16} />
            Zelf een keer meehelpen?
          </Link>
        </div>
      ))}
    </div>
  );
}
