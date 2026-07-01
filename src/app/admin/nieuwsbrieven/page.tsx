import { prisma } from "@/lib/prisma";
import { Mail, Plus, Send, Users, Calendar, Edit, Eye } from "lucide-react";
import { Card, PageHeader, Badge, EmptyState } from "@/components/ui";
import Link from "next/link";

export default async function NieuwsbrievenDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusFilter = status ?? "alle";

  const whereClause = statusFilter !== "alle" ? { status: statusFilter.toUpperCase() } : {};

  const nieuwsbrieven = await prisma.nieuwsbrief.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const statusCounts = await prisma.nieuwsbrief.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const counts = {
    alle: statusCounts.reduce((s, c) => s + c._count.status, 0),
    concept: statusCounts.find((s) => s.status === "CONCEPT")?._count.status ?? 0,
    verzonden: statusCounts.find((s) => s.status === "VERZONDEN")?._count.status ?? 0,
  };

  const tabItems = [
    { key: "alle", label: "Alle", count: counts.alle },
    { key: "concept", label: "Concept", count: counts.concept, variant: "warning" as const },
    { key: "verzonden", label: "Verzonden", count: counts.verzonden, variant: "success" as const },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Nieuwsbrieven"
        description="Beheer en verzend nieuwsbrieven naar vrijwilligers en familie"
        action={
          <Link
            href="/admin/nieuwsbrieven/nieuw"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Nieuwe nieuwsbrief
          </Link>
        }
      />

      <div className="flex items-center gap-2 border-b border-warm-200">
        {tabItems.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/admin/nieuwsbrieven${tab.key !== "alle" ? `?status=${tab.key}` : ""}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white border border-b-0 border-warm-200 text-brand-700"
                  : "text-warm-600 hover:text-warm-900"
              }`}
            >
              {tab.label}
              <Badge variant={isActive ? (tab.variant ?? "info") : "default"}>
                {tab.count}
              </Badge>
            </Link>
          );
        })}
      </div>

      {nieuwsbrieven.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Geen nieuwsbrieven gevonden"
          action={
            <Link
              href="/admin/nieuwsbrieven/nieuw"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
            >
              <Plus size={16} />
              Maak eerste nieuwsbrief
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {nieuwsbrieven.map((n) => (
            <Card key={n.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{n.onderwerp}</h3>
                <p className="text-sm text-warm-600 mt-0.5 line-clamp-1">{n.titel}</p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-warm-500 flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(n.createdAt).toLocaleDateString("nl-NL")}
                  </span>
                  <span className="text-warm-500 flex items-center gap-1">
                    <Users size={11} />
                    Leads
                  </span>
                  {n.status === "VERZONDEN" && n.verstuurtAantal > 0 && (
                    <span className="text-emerald-600 font-semibold">
                      {n.verstuurtAantal} verzonden
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge variant={n.status === "VERZONDEN" ? "success" : "warning"}>
                  {n.status === "VERZONDEN" ? "Verzonden" : "Concept"}
                </Badge>
                <Link
                  href={`/admin/nieuwsbrieven/${n.id}/edit`}
                  className="p-2 rounded-lg hover:bg-warm-100 transition-colors"
                  title="Bewerken"
                >
                  <Edit size={16} className="text-warm-600" />
                </Link>
                <Link
                  href={`/admin/nieuwsbrieven/${n.id}/preview`}
                  className="p-2 rounded-lg hover:bg-warm-100 transition-colors"
                  title="Preview"
                >
                  <Eye size={16} className="text-warm-600" />
                </Link>
                {n.status === "CONCEPT" && (
                  <Link
                    href={`/admin/nieuwsbrieven/${n.id}/send`}
                    className="p-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                    title="Versturen"
                  >
                    <Send size={15} />
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
