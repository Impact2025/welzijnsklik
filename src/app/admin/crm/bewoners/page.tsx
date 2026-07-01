import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Users, Plus, Search, CheckCircle2, XCircle } from "lucide-react";
import { Card, PageHeader, Badge, EmptyState } from "@/components/ui";
import Link from "next/link";

export default async function BewonersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  const query = searchParams.q ?? "";

  const bewoners = await prisma.bewoner.findMany({
    where: {
      organisatieId,
      ...(query
        ? {
            OR: [
              { naam: { contains: query, mode: "insensitive" } },
              { kamer: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { activiteiten: true, familieleden: true } },
    },
    orderBy: { naam: "asc" },
    take: 100,
  });

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Bewoners"
        description={`${bewoners.length} bewoner${bewoners.length !== 1 ? "s" : ""} geregistreerd`}
        action={
          <Link
            href="/admin/crm/bewoners/nieuw"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Bewoner toevoegen
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
            placeholder="Zoek op naam of kamer…"
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
            href="/admin/crm/bewoners"
            className="px-3 py-2 rounded-xl text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Wis
          </Link>
        )}
      </form>

      {bewoners.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "Geen bewoners gevonden" : "Nog geen bewoners"}
          description={query ? `Geen resultaten voor "${query}"` : "Voeg de eerste bewoner toe om te beginnen."}
          action={
            !query ? (
              <Link
                href="/admin/crm/bewoners/nieuw"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
              >
                <Plus size={16} />
                Bewoner toevoegen
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bewoners.map((b) => (
            <Card key={b.id} hover>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{b.naam}</h3>
                  {b.kamer && (
                    <p className="text-xs text-neutral-500 mt-0.5">Kamer {b.kamer}</p>
                  )}
                </div>
                {b.toestemmingFotos ? (
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircle size={18} className="text-neutral-300 flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <span>{b._count.activiteiten} activiteit{b._count.activiteiten !== 1 ? "en" : ""}</span>
                <span>·</span>
                <span>{b._count.familieleden} familielid{b._count.familieleden !== 1 ? "en" : ""}</span>
              </div>

              {b.toestemmingFotos && (
                <Badge variant="success" className="mt-3">Foto toestemming</Badge>
              )}

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                <Link
                  href={`/admin/crm/bewoners/${b.id}`}
                  className="text-brand-600 text-sm font-semibold hover:underline"
                >
                  Bewerken →
                </Link>
                <span className="text-[10px] text-neutral-400">
                  {new Date(b.createdAt).toLocaleDateString("nl-NL")}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
