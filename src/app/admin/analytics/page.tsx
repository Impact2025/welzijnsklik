import { prisma } from "@/lib/prisma";
import { TrendingUp, Users, Activity, BarChart3, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/ui";

export default async function AnalyticsDashboard() {
  const nu = new Date();

  const eersteDezeMaand = new Date(nu.getFullYear(), nu.getMonth(), 1);
  const eersteVorigeMaand = new Date(nu.getFullYear(), nu.getMonth() - 1, 1);

  const zeveDagenGeleden = new Date();
  zeveDagenGeleden.setDate(zeveDagenGeleden.getDate() - 7);

  const dertigDagenGeleden = new Date();
  dertigDagenGeleden.setDate(dertigDagenGeleden.getDate() - 30);

  const [
    totaalActiviteiten,
    activiteitenDezeMaand,
    activiteitenVorigeMaand,
    actieveVrijwilligers,
    recenteActiviteiten,
    typeStats,
  ] = await Promise.all([
    prisma.activiteit.count(),
    prisma.activiteit.count({
      where: { createdAt: { gte: eersteDezeMaand } },
    }),
    prisma.activiteit.count({
      where: { createdAt: { gte: eersteVorigeMaand, lt: eersteDezeMaand } },
    }),
    prisma.gebruiker.count({ where: { rol: "VRIJWILLIGER" } }),
    prisma.activiteit.findMany({
      where: { createdAt: { gte: zeveDagenGeleden } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.activiteit.groupBy({
      by: ["type"],
      where: { createdAt: { gte: dertigDagenGeleden } },
      _sum: { duurMinuten: true },
      _count: { type: true },
      orderBy: { _sum: { duurMinuten: "desc" } },
      take: 6,
    }),
  ]);

  const maandTrend =
    activiteitenVorigeMaand > 0
      ? Math.round(((activiteitenDezeMaand - activiteitenVorigeMaand) / activiteitenVorigeMaand) * 100)
      : activiteitenDezeMaand > 0
      ? 100
      : 0;

  const dagenData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const count = recenteActiviteiten.filter(
      (a) => new Date(a.createdAt).toISOString().slice(0, 10) === dateStr
    ).length;
    return {
      dag: d.toLocaleDateString("nl-NL", { weekday: "short" }),
      count,
    };
  });
  const maxCount = Math.max(...dagenData.map((d) => d.count), 1);

  const maxMinuten = Math.max(...typeStats.map((t) => t._sum.duurMinuten ?? 0), 1);

  const stats = [
    {
      label: "Activiteiten deze maand",
      value: activiteitenDezeMaand,
      icon: Activity,
      trend: maandTrend,
      sub: `${totaalActiviteiten} totaal`,
    },
    {
      label: "Vrijwilligers",
      value: actieveVrijwilligers,
      icon: Users,
      trend: 0,
      sub: "geregistreerd",
    },
    {
      label: "Activiteiten (7 dagen)",
      value: recenteActiviteiten.length,
      icon: BarChart3,
      trend: null,
      sub: "afgelopen week",
    },
    {
      label: "Activiteitstypen",
      value: typeStats.length,
      icon: TrendingUp,
      trend: null,
      sub: "in gebruik (30d)",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Analytics" description="Platformbreed gebruik over alle klanten" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
                <s.icon size={18} className="text-sky-600" />
              </div>
              {s.trend !== null && (
                <span
                  className={`text-xs font-semibold flex items-center gap-0.5 ${
                    s.trend > 0 ? "text-emerald-600" : s.trend < 0 ? "text-red-500" : "text-neutral-400"
                  }`}
                >
                  {s.trend > 0 ? (
                    <ArrowUp size={12} />
                  ) : s.trend < 0 ? (
                    <ArrowDown size={12} />
                  ) : (
                    <Minus size={12} />
                  )}
                  {s.trend !== 0 ? `${Math.abs(s.trend)}%` : "stabiel"}
                </span>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{s.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5 font-medium">{s.label}</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">{s.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-gray-900 mb-1">Activiteiten afgelopen 7 dagen</h2>
          <p className="text-xs text-neutral-400 mb-4">Aantal geregistreerde activiteiten per dag</p>
          {recenteActiviteiten.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-neutral-400">
              Nog geen activiteiten geregistreerd
            </div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {dagenData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-neutral-600 tabular-nums">
                    {d.count > 0 ? d.count : ""}
                  </span>
                  <div className="w-full flex flex-col justify-end" style={{ height: 100 }}>
                    <div
                      className="w-full bg-brand-500 rounded-t-md transition-all hover:bg-brand-600 min-h-[3px]"
                      style={{ height: `${Math.max((d.count / maxCount) * 100, d.count > 0 ? 4 : 1)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400">{d.dag}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-900 mb-1">Uren per activiteitstype (30d)</h2>
          <p className="text-xs text-neutral-400 mb-4">Totaal bestede tijd per type</p>
          {typeStats.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-400">
              Nog geen activiteiten deze maand
            </div>
          ) : (
            <div className="space-y-3">
              {typeStats.map((t) => {
                const minuten = t._sum.duurMinuten ?? 0;
                const uren = Math.round((minuten / 60) * 10) / 10;
                const pct = Math.round((minuten / maxMinuten) * 100);
                return (
                  <div key={t.type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{t.type}</span>
                      <span className="text-neutral-500 font-medium tabular-nums">
                        {uren}u · {t._count.type}×
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-600" />
          Maand-op-maand vergelijking
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{activiteitenVorigeMaand}</p>
            <p className="text-xs text-neutral-500 mt-1">Vorige maand</p>
          </div>
          <div className="flex items-center justify-center">
            <Badge
              variant={maandTrend > 0 ? "success" : maandTrend < 0 ? "danger" : "default"}
            >
              {maandTrend > 0 ? "+" : ""}{maandTrend}%
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-600 tabular-nums">{activiteitenDezeMaand}</p>
            <p className="text-xs text-neutral-500 mt-1">Deze maand</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
