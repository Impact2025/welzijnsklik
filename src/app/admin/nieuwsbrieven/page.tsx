import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Mail, Plus, Send, Users, Calendar, Trash2, Edit, Eye } from "lucide-react";
import { Card, PageHeader, Badge, EmptyState } from "@/components/ui";
import Link from "next/link";

export default async function NieuwsbrievenDashboard({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  
  const statusFilter = searchParams.status ?? "alle";

  const whereClause = statusFilter === "alle" 
    ? { organisatieId }
    : { organisatieId, status: statusFilter.toUpperCase() } as any;

  const nieuwsbrieven = await prisma.nieuwsbrief.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const statusCounts = await prisma.nieuwsbrief.groupBy({
    by: ["status"],
    where: { organisatieId },
    _count: { status: true },
  });

  const counts = {
    alle: nieuwsbrieven.length,
    concept: statusCounts.find((s) => s.status === "CONCEPT")?._count.status ?? 0,
    verzonden: statusCounts.find((s) => s.status === "VERZONDEN")?._count.status ?? 0,
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Nieuwsbrieven"
        description="Beheer en verzend nieuwsbrieven naar vrijwilligers en familie"
        action={
          <Link
            href="/admin/nieuwsbrieven/nieuw"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-medium text-sm hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Nieuwe nieuwsbrief
          </Link>
        }
      />

      <div className="flex items-center gap-2 border-b border-warm-200">
        <button className={`px-3 py-2 rounded-t-lg text-sm font-medium transition-colors ${
          statusFilter === "alle" ? "bg-white border border-b-0 border-warm-200 text-brand-700" : "text-warm-600 hover:text-warm-900"
        }`}>
          Alle <Badge variant="default" className="ml-1">{counts.alle}</Badge>
        </button>
        <button className={`px-3 py-2 rounded-t-lg text-sm font-medium transition-colors ${
          statusFilter === "concept" ? "bg-white border border-b-0 border-warm-200 text-brand-700" : "text-warm-600 hover:text-warm-900"
        }`}>
          Concept <Badge variant="warning" className="ml-1">{counts.concept}</Badge>
        </button>
        <button className={`px-3 py-2 rounded-t-lg text-sm font-medium transition-colors ${
          statusFilter === "verzonden" ? "bg-white border border-b-0 border-warm-200 text-brand-700" : "text-warm-600 hover:text-warm-900"
        }`}>
          Verzonden <Badge variant="success" className="ml-1">{counts.verzonden}</Badge>
        </button>
      </div>

      {nieuwsbrieven.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Geen nieuwsbrieven gevonden"
          action={
            <Link href="/admin/nieuwsbrieven/nieuw" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-medium text-sm hover:bg-brand-600 transition-colors">
              <Plus size={16} />
              Maak eerste nieuwsbrief
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {nieuwsbrieven.map((n) => (
            <Card key={n.id} className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{n.onderwerp}</h3>
                <p className="text-sm text-warm-600 mt-1 line-clamp-2">{n.titel}</p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-warm-500">
                    <Calendar size={12} className="inline mr-1" />
                    {new Date(n.createdAt).toLocaleDateString("nl-NL")}
                  </span>
                  <span className="text-warm-500">
                    <Users size={12} className="inline mr-1" />
                    Doelgroep: {n.doelgroep}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={n.status === "VERZONDEN" ? "success" : "warning"}>
                  {n.status}
                </Badge>
                <Link href={`/admin/nieuwsbrieven/${n.id}/edit`} className="p-2 rounded-lg hover:bg-warm-100 transition-colors">
                  <Edit size={16} className="text-warm-600" />
                </Link>
                <Link href={`/admin/nieuwsbrieven/${n.id}/preview`} className="p-2 rounded-lg hover:bg-warm-100 transition-colors">
                  <Eye size={16} className="text-warm-600" />
                </Link>
                {n.status === "CONCEPT" && (
                  <Link href={`/admin/nieuwsbrieven/${n.id}/send`} className="p-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors">
                    <Send size={16} />
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
