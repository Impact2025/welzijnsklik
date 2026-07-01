import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Users, Activity, Calendar, BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/ui";

export default async function AnalyticsDashboard() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const [totaalActiviteiten, activiteitenDezeMaand, actieveVrijwilligers, nieuweBewoners] = await Promise.all([
    prisma.activiteit.count({
      where: { bewoner: { organisatieId } },
    }),
    prisma.activiteit.count({
      where: {
        bewoner: { organisatieId },
        createdAt: { gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.gebruiker.count({
      where: { organisatieId, rol: "VRIJWILLIGER" },
    }),
    prisma.bewoner.count({
      where: {
        organisatieId,
        createdAt: { gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const stats = [
    {
      label: "Totaal activiteiten",
      value: totaalActiviteiten,
      icon: Activity,
      variant: "info" as const,
      trend: "+12% vs vorige maand",
      trendUp: true,
    },
    {
      label: "Actieve vrijwilligers",
      value: actieveVrijwilligers,
      icon: Users,
      variant: "success" as const,
      trend: "Stabiel",
      trendUp: true,
    },
    {
      label: "Nieuwe bewoners",
      value: nieuweBewoners,
      icon: Calendar,
      variant: "violet" as const,
      trend: "Deze week",
      trendUp: nieuweBewoners > 0,
    },
    {
      label: "Activiteiten (30d)",
      value: activiteitenDezeMaand,
      icon: BarChart3,
      variant: "warning" as const,
      trend: "Actief",
      trendUp: activiteitenDezeMaand > 0,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Inzichten in gebruik en activiteiten"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${s.variant === "info" ? "sky" : s.variant === "success" ? "emerald" : s.variant === "warning" ? "amber" : "violet"}-100`}>
                <s.icon size={18} className={`text-${s.variant === "info" ? "sky" : s.variant === "success" ? "emerald" : s.variant === "warning" ? "amber" : "violet"}-700`} />
              </div>
              <Badge variant={s.variant}>{s.trend}</Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-warm-500">{s.label}</p>
            </div>
            {s.trendUp ? (
              <ArrowUp size={14} className="text-emerald-500" />
            ) : (
              <ArrowDown size={14} className="text-red-500" />
            )}
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Activiteiten deze week</h2>
        <div className="h-64 flex items-end gap-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const height = Math.random() * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-brand-500 rounded-t-md transition-all hover:bg-brand-600 min-h-[2px]"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                <span className="text-[10px] text-warm-400 mt-1">{new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("nl-NL", { weekday: "short" })}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Uren per activiteitstype (30d)</h2>
        <div className="space-y-3">
          {["Bezoeken", "Boodschappen", "Activiteiten", "Vervoer"].map((type) => {
            const uren = Math.random() * 100;
            return (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{type}</span>
                  <span className="text-warm-500 font-medium">{Math.round(uren)}u</span>
                </div>
                <div className="w-full h-2.5 bg-warm-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(uren, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
