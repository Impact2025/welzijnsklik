import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Users, UserCheck, Plus, Search, Filter } from "lucide-react";
import { Card, PageHeader, Badge, EmptyState } from "@/components/ui";
import Link from "next/link";

export default async function CRMDashboard({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string };
}) {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  
  const tab = searchParams.tab ?? "bewoners";
  const query = searchParams.q ?? "";

  const [bewoners, vrijwilligers, familieLeden] = await Promise.all([
    query
      ? prisma.bewoner.findMany({
          where: {
            organisatieId,
            OR: [
              { naam: { contains: query, mode: "insensitive" } },
              { kamer: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 50,
          orderBy: { naam: "asc" },
        })
      : prisma.bewoner.findMany({
          where: { organisatieId },
          take: 50,
          orderBy: { naam: "asc" },
          include: { _count: { select: { activiteiten: true } } },
        }),
    query
      ? prisma.gebruiker.findMany({
          where: {
            organisatieId,
            rol: "VRIJWILLIGER",
            naam: { contains: query, mode: "insensitive" },
          },
          take: 50,
          orderBy: { naam: "asc" },
          include: { _count: { select: { activiteiten: true } } },
        })
      : prisma.gebruiker.findMany({
          where: { organisatieId, rol: "VRIJWILLIGER" },
          take: 50,
          orderBy: { naam: "asc" },
          include: { _count: { select: { activiteiten: true } } },
        }),
    query
      ? prisma.gebruiker.findMany({
          where: {
            organisatieId,
            rol: "FAMILIE",
            naam: { contains: query, mode: "insensitive" },
          },
          take: 50,
          orderBy: { naam: "asc" },
        })
      : prisma.gebruiker.findMany({
          where: { organisatieId, rol: "FAMILIE" },
          take: 50,
          orderBy: { naam: "asc" },
        }),
  ]);

  const tabs = [
    { id: "bewoners", label: "Bewoners", icon: Users, count: bewoners.length },
    { id: "vrijwilligers", label: "Vrijwilligers", icon: UserCheck, count: vrijwilligers.length },
    { id: "familie", label: "Familieleden", icon: Users, count: familieLeden.length },
  ];

  const activeTab = tabs.find((t) => t.id === tab) ?? tabs[0];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="CRM Dashboard"
        description="Beheer bewoners, vrijwilligers en hun relaties"
        action={
          <Link
            href={`/admin/crm/${tab}/nieuw`}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-medium text-sm hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Nieuw
          </Link>
        }
      />

      <div className="flex items-center gap-2 border-b border-warm-200">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = t.id === tab;
          return (
            <Link
              key={t.id}
              href={`/admin/crm?tab=${t.id}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${isActive ? "bg-white border border-b-0 border-warm-200 text-brand-700" : "text-warm-600 hover:text-warm-900" }`}
            >
              <Icon size={16} />
              {t.label}
              <Badge variant={isActive ? "info" : "default"} className="ml-1">
                {t.count}
              </Badge>
            </Link>
          );
        })}
      </div>

      <form className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Zoek..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-warm-200 text-sm font-medium hover:bg-warm-50"
        >
          <Filter size={16} />
          Filter
        </button>
      </form>

      {activeTab.id === "bewoners" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(bewoners as any[]).length === 0 ? (
            <div className="col-span-full">
              <EmptyState icon={Users} title="Geen bewoners gevonden" />
            </div>
          ) : (
            (bewoners as any[]).map((b) => (
              <Card key={b.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{b.naam}</h3>
                  <Badge variant={b.toestemmingFotos ? "success" : "warning"}>
                    {b.toestemmingFotos ? "Foto toestemming" : "Geen foto"}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  {b.kamer && <p className="text-warm-600">Kamer {b.kamer}</p>}
                  <p className="text-warm-600">{b._count?.activiteiten ?? 0} activiteiten</p>
                </div>
                <div className="mt-4 pt-3 border-t border-warm-100">
                  <Link href={`/admin/crm/bewoners/${b.id}`} className="text-brand-600 text-sm font-medium hover:underline">
                    Bewerken →
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab.id === "vrijwilligers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vrijwilligers.length === 0 ? (
            <div className="col-span-full">
              <EmptyState icon={UserCheck} title="Geen vrijwilligers gevonden" />
            </div>
          ) : (
            vrijwilligers.map((v) => (
              <Card key={v.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{v.naam}</h3>
                  <Badge variant="success">Actief</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-warm-600">{v.email}</p>
                  <p className="text-warm-600">{(v as any)._count?.activiteiten ?? 0} activiteiten deze maand</p>
                </div>
                {v.voorkeurActiviteiten && v.voorkeurActiviteiten.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {v.voorkeurActiviteiten.slice(0, 3).map((a) => (
                      <Badge key={a} variant="info" className="text-[10px]">
                        {a}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-warm-100">
                  <Link href={`/admin/crm/vrijwilligers/${v.id}`} className="text-brand-600 text-sm font-medium hover:underline">
                    Bewerken →
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
