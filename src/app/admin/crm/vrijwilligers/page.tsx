import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserCheck, Plus, Search } from "lucide-react";
import { Card, PageHeader, Badge, EmptyState } from "@/components/ui";
import Link from "next/link";

export default async function VrijwilligersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  const query = searchParams.q ?? "";

  const vrijwilligers = await prisma.gebruiker.findMany({
    where: {
      organisatieId,
      rol: "VRIJWILLIGER",
      ...(query ? { naam: { contains: query, mode: "insensitive" } } : {}),
    },
    include: {
      _count: { select: { activiteiten: true } },
    },
    orderBy: { naam: "asc" },
    take: 100,
  });

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Vrijwilligers"
        description={`${vrijwilligers.length} vrijwilliger${vrijwilligers.length !== 1 ? "s" : ""} geregistreerd`}
        action={
          <Link
            href="/admin/crm/vrijwilligers/nieuw"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Vrijwilliger uitnodigen
          </Link>
        }
      />

      <form className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Zoek op naam…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl border border-warm-200 text-sm font-medium hover:bg-warm-50 transition-colors"
        >
          Zoek
        </button>
        {query && (
          <Link
            href="/admin/crm/vrijwilligers"
            className="px-3 py-2 rounded-xl text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Wis
          </Link>
        )}
      </form>

      {vrijwilligers.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title={query ? "Geen vrijwilligers gevonden" : "Nog geen vrijwilligers"}
          description={query ? `Geen resultaten voor "${query}"` : "Nodig de eerste vrijwilliger uit."}
          action={
            !query ? (
              <Link
                href="/admin/crm/vrijwilligers/nieuw"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
              >
                <Plus size={16} />
                Vrijwilliger uitnodigen
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vrijwilligers.map((v) => (
            <Card key={v.id} hover>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 flex-shrink-0">
                  {v.naam?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{v.naam}</h3>
                  <p className="text-xs text-neutral-500 truncate">{v.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                <span>{v._count.activiteiten} activiteit{v._count.activiteiten !== 1 ? "en" : ""}</span>
                {v.telefoon && (
                  <>
                    <span>·</span>
                    <span>{v.telefoon}</span>
                  </>
                )}
              </div>

              {v.voorkeurActiviteiten.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {v.voorkeurActiviteiten.slice(0, 3).map((a) => (
                    <Badge key={a} variant="info">{a}</Badge>
                  ))}
                  {v.voorkeurActiviteiten.length > 3 && (
                    <Badge variant="default">+{v.voorkeurActiviteiten.length - 3}</Badge>
                  )}
                </div>
              )}

              <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between">
                <Link
                  href={`/admin/crm/vrijwilligers/${v.id}`}
                  className="text-brand-600 text-sm font-semibold hover:underline"
                >
                  Bewerken →
                </Link>
                <span className="text-[10px] text-neutral-400">
                  {new Date(v.createdAt).toLocaleDateString("nl-NL")}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
