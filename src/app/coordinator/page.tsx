import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, Activity, UserPlus, Users, UserCheck, Clock } from "lucide-react";
import { ACTIVITEIT_ICON, formatDatum, formatDuur } from "@/lib/activiteit";
import { getFotoUrl } from "@/lib/foto";
import { StatCard, EmptyState } from "@/components/ui";

function ActiviteitIcon({ type }: { type: string }) {
  const cfg = ACTIVITEIT_ICON[type] ?? ACTIVITEIT_ICON.Anders;
  const Icon = cfg.icon;
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
      <Icon size={16} className={cfg.kleur} />
    </div>
  );
}

export default async function CoordinatorDashboard() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  const naam = session!.user.naam ?? session!.user.name ?? "Coordinator";
  const voornaam = naam.split(" ")[0];

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  const [activiteiten, bewoners, vrijwilligers, interesses] = await Promise.all([
    prisma.activiteit.findMany({
      where: { bewoner: { organisatieId } },
      include: {
        bewoner: { select: { naam: true, toestemmingFotos: true } },
        vrijwilliger: { select: { naam: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.bewoner.count({ where: { organisatieId } }),
    prisma.gebruiker.count({ where: { organisatieId, rol: "VRIJWILLIGER" } }),
    prisma.wervingsinteresse.count({ where: { status: "nieuw", gebruiker: { organisatieId } } }),
  ]);

  const laatsteMetFoto = activiteiten.find(
    (a) => a.fotoUrl && a.bewoner.toestemmingFotos
  );

  const activiteitenDezeMaand = activiteiten.filter(
    (a) => new Date(a.createdAt) >= firstDay
  );
  const activiteitPerDag: { dag: string; totaal: number; uren: number }[] = [];
  for (let d = 1; d <= now.getDate(); d++) {
    const dagAct = activiteitenDezeMaand.filter(
      (a) => new Date(a.createdAt).getDate() === d
    );
    activiteitPerDag.push({
      dag: `${d}`,
      totaal: dagAct.length,
      uren: dagAct.reduce((s, a) => s + a.duurMinuten, 0),
    });
  }

  const urenPerVrijwilliger = Object.entries(
    activiteitenDezeMaand.reduce<Record<string, number>>((acc, a) => {
      acc[a.vrijwilliger.naam] = (acc[a.vrijwilliger.naam] ?? 0) + a.duurMinuten;
      return acc;
    }, {})
  )
    .map(([naam, min]) => ({ naam, uren: Math.round((min / 60) * 10) / 10 }))
    .sort((a, b) => b.uren - a.uren);

  const stats = [
    { label: "Bewoners", value: bewoners, icon: Users, href: "/coordinator/bewoners", variant: "info" as const },
    { label: "Vrijwilligers", value: vrijwilligers, icon: UserCheck, href: "/coordinator/gebruikers", variant: "success" as const },
    { label: "Activiteiten", value: activiteiten.length, icon: Activity, href: "/coordinator/tijdlijn", variant: "warning" as const },
    { label: "Aanmeldingen", value: interesses, icon: UserPlus, href: "/coordinator/meldingen", variant: "violet" as const },
  ];

  return (
    <div className="py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Goeiedag, {voornaam}</h1>
        <p className="text-sm lg:text-base text-neutral-500 mt-0.5 lg:mt-1">Hier is een overzicht van vandaag</p>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {laatsteMetFoto && (
            <Link
              href="/coordinator/tijdlijn"
              className="block bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="relative w-full aspect-[16/9] bg-warm-100 overflow-hidden">
                <img
                  src={getFotoUrl(laatsteMetFoto.fotoUrl, laatsteMetFoto.bewonerId) ?? ""}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow-sm">
                  {(() => {
                    const cfg = ACTIVITEIT_ICON[laatsteMetFoto.type] ?? ACTIVITEIT_ICON.Anders;
                    const Icon = cfg.icon;
                    return (
                      <>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                          <Icon size={12} className={cfg.kleur} />
                        </div>
                        <span className="text-xs font-bold text-gray-800">{laatsteMetFoto.type}</span>
                      </>
                    );
                  })()}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold text-sm lg:text-base drop-shadow-sm">
                    {laatsteMetFoto.vrijwilliger.naam}
                    <span className="font-normal opacity-80"> bij </span>
                    {laatsteMetFoto.bewoner.naam}
                  </p>
                  <p className="text-white/80 text-xs lg:text-sm mt-0.5 drop-shadow-sm flex items-center gap-1.5">
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
              {laatsteMetFoto.notities && (
                <div className="p-4 lg:p-5">
                  <div className="bg-warm-50 rounded-xl p-3.5 lg:p-4 border border-warm-100">
                    <div className="flex items-start gap-2.5 lg:gap-3">
                      <div className="w-1 h-full min-h-[20px] bg-brand-500 rounded-full flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] lg:text-xs font-semibold text-warm-500 uppercase tracking-wider mb-0.5">
                          {laatsteMetFoto.vrijwilliger.naam}
                        </p>
                        <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
                          {laatsteMetFoto.notities}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Link>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {activiteitPerDag.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 lg:p-5 space-y-3 lg:space-y-4">
              <h2 className="font-semibold text-gray-900 text-[15px] lg:text-base">Activiteiten deze maand</h2>
              <div className="flex items-end gap-[3px] h-20 lg:h-24">
                {activiteitPerDag.map((d) => {
                  const max = Math.max(...activiteitPerDag.map((x) => x.totaal), 1);
                  const hoogte = (d.totaal / max) * 100;
                  return (
                    <div
                      key={d.dag}
                      className="flex-1 flex flex-col items-center gap-0.5 group relative"
                    >
                      <div
                        className="w-full bg-amber-500 rounded-t-md transition-all hover:bg-amber-600 min-h-[2px]"
                        style={{ height: `${Math.max(hoogte, 2)}%` }}
                      />
                      <span className="text-[8px] lg:text-[10px] text-neutral-400 font-medium">
                        {d.dag}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs lg:text-sm text-neutral-400">
                <span>{activiteitenDezeMaand.length} activiteiten deze maand</span>
                <span>
                  {Math.floor(activiteitenDezeMaand.reduce((s, a) => s + a.duurMinuten, 0) / 60)}u totaal
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:block lg:col-span-1 space-y-6 lg:space-y-8">
          {urenPerVrijwilliger.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 lg:p-5 space-y-3 lg:space-y-4">
              <h2 className="font-semibold text-gray-900 text-[15px] lg:text-base">Uren per vrijwilliger</h2>
              <div className="space-y-2">
                {urenPerVrijwilliger.slice(0, 5).map((v) => {
                  const max = Math.max(...urenPerVrijwilliger.map((x) => x.uren), 1);
                  const breedte = (v.uren / max) * 100;
                  return (
                    <div key={v.naam} className="space-y-1">
                      <div className="flex items-center justify-between text-xs lg:text-sm">
                        <span className="font-medium text-gray-700 truncate">{v.naam}</span>
                        <span className="text-neutral-400 font-medium">{v.uren}u</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${breedte}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="px-4 py-3.5 lg:px-5 lg:py-4 flex items-center justify-between border-b border-neutral-50">
          <h2 className="font-semibold text-gray-900 text-[15px] lg:text-base">Recente activiteiten</h2>
          <Link
            href="/coordinator/tijdlijn"
            className="text-amber-600 text-xs lg:text-sm font-semibold flex items-center gap-0.5"
          >
            Alles <ChevronRight size={13} />
          </Link>
        </div>
        {activiteiten.length === 0 ? (
          <EmptyState icon={Activity} title="Nog geen activiteiten geregistreerd." />
        ) : (
          <div className="divide-y divide-neutral-50">
            {activiteiten.slice(0, 5).map((a) => (
              <div key={a.id} className="px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 lg:gap-4">
                <ActiviteitIcon type={a.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm lg:text-base font-medium text-gray-900 truncate">
                    {a.vrijwilliger.naam}
                    <span className="text-neutral-400 font-normal"> bij </span>
                    {a.bewoner.naam}
                  </p>
                  <p className="text-xs lg:text-sm text-neutral-400 mt-0.5">
                    {a.type} · {a.duurMinuten} min · {formatDatum(new Date(a.createdAt))}
                  </p>
                </div>
                {a.fotoUrl && (
                  <img
                    src={getFotoUrl(a.fotoUrl, a.bewonerId) ?? ""}
                    alt=""
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl object-cover flex-shrink-0"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
