import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, Activity, UserPlus, Users, UserCheck } from "lucide-react";
import { ACTIVITEIT_ICON, formatDatum } from "@/lib/activiteit";
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
  const naam = session!.user.naam ?? session!.user.name ?? "Coördinator";
  const voornaam = naam.split(" ")[0];

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  const [activiteiten, bewoners, vrijwilligers, interesses] = await Promise.all([
    prisma.activiteit.findMany({
      where: { bewoner: { organisatieId } },
      include: {
        bewoner: { select: { naam: true } },
        vrijwilliger: { select: { naam: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.bewoner.count({ where: { organisatieId } }),
    prisma.gebruiker.count({ where: { organisatieId, rol: "VRIJWILLIGER" } }),
    prisma.wervingsinteresse.count({ where: { status: "nieuw", gebruiker: { organisatieId } } }),
  ]);

  // Grafiek data: activiteiten per dag (deze maand)
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

  // Uren per vrijwilliger (deze maand)
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
    { label: "Activiteiten", value: activiteiten.length, icon: Activity, href: "/coordinator/briefjes", variant: "warning" as const },
    { label: "Aanmeldingen", value: interesses, icon: UserPlus, href: "/coordinator/meldingen", variant: "violet" as const },
  ];

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Goeiedag, {voornaam} 👋</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Hier is een overzicht van vandaag</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Grafiek: activiteiten per dag */}
      {activiteitPerDag.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 space-y-3">
          <h2 className="font-semibold text-gray-900 text-[15px]">Activiteiten deze maand</h2>
          <div className="flex items-end gap-[3px] h-20">
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
                  <span className="text-[8px] text-neutral-400 font-medium">
                    {d.dag}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>{activiteitenDezeMaand.length} activiteiten deze maand</span>
            <span>
              {Math.floor(activiteitenDezeMaand.reduce((s, a) => s + a.duurMinuten, 0) / 60)}u totaal
            </span>
          </div>
        </div>
      )}

      {/* Grafiek: uren per vrijwilliger */}
      {urenPerVrijwilliger.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 space-y-3">
          <h2 className="font-semibold text-gray-900 text-[15px]">Uren per vrijwilliger</h2>
          <div className="space-y-2">
            {urenPerVrijwilliger.slice(0, 5).map((v) => {
              const max = Math.max(...urenPerVrijwilliger.map((x) => x.uren), 1);
              const breedte = (v.uren / max) * 100;
              return (
                <div key={v.naam} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
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

      {/* Recente activiteiten */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="px-4 py-3.5 flex items-center justify-between border-b border-neutral-50">
          <h2 className="font-semibold text-gray-900 text-[15px]">Recente activiteiten</h2>
          <Link
            href="/coordinator/briefjes"
            className="text-amber-600 text-xs font-semibold flex items-center gap-0.5"
          >
            Alles <ChevronRight size={13} />
          </Link>
        </div>
        {activiteiten.length === 0 ? (
          <EmptyState icon={Activity} title="Nog geen activiteiten geregistreerd." />
        ) : (
          <div className="divide-y divide-neutral-50">
            {activiteiten.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                <ActiviteitIcon type={a.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {a.vrijwilliger.naam}
                    <span className="text-neutral-400 font-normal"> bij </span>
                    {a.bewoner.naam}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {a.type} · {a.duurMinuten} min ·{" "}
                    {formatDatum(new Date(a.createdAt))}
                  </p>
                </div>
                {a.fotoUrl && (
                  <img
                    src={getFotoUrl(a.fotoUrl, a.bewonerId) ?? ""}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
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
