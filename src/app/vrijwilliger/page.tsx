import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Heart, Users, Activity } from "lucide-react";
import { ACTIVITEIT_ICON, formatDatum, formatDuur } from "@/lib/activiteit";
import { getFotoUrl } from "@/lib/foto";

export default async function VrijwilligerDashboard() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  const gebruikerId = session!.user.gebruikerId!;
  const naam = session!.user.naam ?? session!.user.name ?? "Vrijwilliger";
  const voornaam = naam.split(" ")[0];

  const nu = new Date();
  const weekGeleden = new Date(nu.getTime() - 7 * 24 * 60 * 60 * 1000);
  const firstDay = new Date(nu.getFullYear(), nu.getMonth(), 1);

  const [activiteiten, bewoners] = await Promise.all([
    prisma.activiteit.findMany({
      where: { vrijwilligerId: gebruikerId },
      include: {
        bewoner: { select: { naam: true, toestemmingFotos: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.bewoner.findMany({
      where: { organisatieId },
      select: { id: true, naam: true },
      orderBy: { naam: "asc" },
    }),
  ]);

  // Stats
  const dezeWeek = activiteiten.filter((a) => new Date(a.createdAt) >= weekGeleden);
  const totaleUren = dezeWeek.reduce((s, a) => s + a.duurMinuten, 0);
  const uniekeBewoners = new Set(activiteiten.map((a) => a.bewoner.naam)).size;

  // Laatste activiteit met foto
  const laatsteMetFoto = activiteiten.find(
    (a) => a.fotoUrl && a.bewoner.toestemmingFotos
  );
  const laatsteCfg = laatsteMetFoto
    ? ACTIVITEIT_ICON[laatsteMetFoto.type] ?? ACTIVITEIT_ICON.Anders
    : null;
  const LaatsteIcon = laatsteCfg?.icon;

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Goeiedag, {voornaam}</h1>
          <p className="text-sm text-warm-500 mt-0.5">Jouw bijdrage deze week</p>
        </div>
        <Link
          href="/vrijwilliger/nieuw"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-5 rounded-2xl text-sm transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nieuwe activiteit
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 text-center">
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{dezeWeek.length}</p>
          <p className="text-[11px] text-warm-500 mt-0.5 font-medium">Activiteiten</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 text-center">
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{Math.floor(totaleUren / 60)}u</p>
          <p className="text-[11px] text-warm-500 mt-0.5 font-medium">Tijd besteed</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 text-center">
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{uniekeBewoners}</p>
          <p className="text-[11px] text-warm-500 mt-0.5 font-medium">Bewoners</p>
        </div>
      </div>

      {/* Laatste foto — hero */}
      {laatsteMetFoto && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="relative w-full aspect-[16/9] bg-warm-100 overflow-hidden">
            <img
              src={getFotoUrl(laatsteMetFoto.fotoUrl, laatsteMetFoto.bewonerId) ?? ""}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow-sm">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${laatsteCfg!.bg}`}>
                {LaatsteIcon && <LaatsteIcon size={12} className={laatsteCfg!.kleur} />}
              </div>
              <span className="text-xs font-bold text-gray-800">{laatsteMetFoto.type}</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white font-bold text-sm drop-shadow-sm">
                bij {laatsteMetFoto.bewoner.naam}
              </p>
              <p className="text-white/80 text-xs mt-0.5 drop-shadow-sm">
                {formatDuur(laatsteMetFoto.duurMinuten)}
                <span className="opacity-50 mx-1">·</span>
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
          {laatsteMetFoto.notities && (
            <div className="p-4">
              <div className="bg-warm-50 rounded-xl p-3.5 border border-warm-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-1 h-full min-h-[20px] bg-brand-500 rounded-full flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-relaxed">{laatsteMetFoto.notities}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Laatste activiteiten */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 text-[15px]">Laatste activiteiten</h2>
          <Link
            href="/vrijwilliger/mijn-activiteiten"
            className="text-brand-600 text-xs font-semibold flex items-center gap-0.5"
          >
            Alles
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
        </div>
        <div className="space-y-2">
          {activiteiten.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 text-center">
              <Heart size={24} className="text-neutral-300 mx-auto mb-2" />
              <p className="text-warm-400 text-sm">Nog geen activiteiten vastgelegd.</p>
              <Link
                href="/vrijwilliger/nieuw"
                className="inline-flex items-center gap-1.5 text-brand-600 font-semibold text-sm mt-3"
              >
                <Plus size={14} />
                Eerste activiteit registreren
              </Link>
            </div>
          ) : (
            activiteiten.slice(0, 5).map((a) => {
              const cfg = ACTIVITEIT_ICON[a.type] ?? ACTIVITEIT_ICON.Anders;
              const Icon = cfg.icon;
              return (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-3.5 flex items-center gap-3"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon size={16} className={cfg.kleur} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {a.type}
                      <span className="text-warm-400 font-normal"> bij </span>
                      {a.bewoner.naam}
                    </p>
                    <p className="text-xs text-warm-400 mt-0.5">
                      {formatDuur(a.duurMinuten)}
                      <span className="mx-1">·</span>
                      {formatDatum(new Date(a.createdAt))}
                    </p>
                  </div>
                  {a.fotoUrl && a.bewoner.toestemmingFotos && (
                    <img
                      src={getFotoUrl(a.fotoUrl, a.bewonerId) ?? ""}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Totaal overzicht */}
      {activiteiten.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-warm-600">
              <strong className="text-gray-900">{activiteiten.length}</strong> activiteiten in totaal
            </span>
            <span className="text-warm-600">
              <strong className="text-gray-900">{Math.floor(activiteiten.reduce((s, a) => s + a.duurMinuten, 0) / 60)}</strong> uur in totaal
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
