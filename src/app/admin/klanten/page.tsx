import { prisma } from "@/lib/prisma";
import { Building2, Plus, Users, UserCheck, Activity } from "lucide-react";
import { Card, PageHeader, EmptyState } from "@/components/ui";
import Link from "next/link";

export default async function KlantenOverzicht({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const organisaties = await prisma.organisatie.findMany({
    where: q
      ? {
          OR: [
            { naam: { contains: q, mode: "insensitive" } },
            { plaats: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  const dertigDagenGeleden = new Date();
  dertigDagenGeleden.setDate(dertigDagenGeleden.getDate() - 30);

  const stats = await Promise.all(
    organisaties.map(async (org) => {
      const [bewoners, vrijwilligers, familieleden, activiteiten] = await Promise.all([
        prisma.bewoner.count({ where: { organisatieId: org.id } }),
        prisma.gebruiker.count({ where: { organisatieId: org.id, rol: "VRIJWILLIGER" } }),
        prisma.gebruiker.count({ where: { organisatieId: org.id, rol: "FAMILIE" } }),
        prisma.activiteit.count({
          where: {
            bewoner: { organisatieId: org.id },
            createdAt: { gte: dertigDagenGeleden },
          },
        }),
      ]);
      return { org, bewoners, vrijwilligers, familieleden, activiteiten };
    })
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Klanten"
        description="Overzicht van alle woonorganisaties die Welzijnsklik gebruiken"
        action={
          <Link
            href="/admin/klanten/nieuw"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Nieuwe klant
          </Link>
        }
      />

      <form className="max-w-sm">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Zoek op naam of plaats..."
          className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </form>

      {stats.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nog geen klanten"
          description="Voeg je eerste woonorganisatie toe"
          action={
            <Link
              href="/admin/klanten/nieuw"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
            >
              <Plus size={16} />
              Nieuwe klant
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {stats.map(({ org, bewoners, vrijwilligers, familieleden, activiteiten }) => (
            <Link key={org.id} href={`/admin/klanten/${org.id}`}>
              <Card className="flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{org.naam}</h3>
                  <p className="text-sm text-warm-600 mt-0.5">{org.plaats}</p>
                  <p className="text-xs text-warm-400 mt-1">
                    Klant sinds {new Date(org.createdAt).toLocaleDateString("nl-NL")}
                  </p>
                </div>
                <div className="flex items-center gap-5 flex-shrink-0 text-sm">
                  <div className="flex items-center gap-1.5 text-warm-600">
                    <Users size={15} />
                    {bewoners}
                  </div>
                  <div className="flex items-center gap-1.5 text-warm-600">
                    <UserCheck size={15} />
                    {vrijwilligers + familieleden}
                  </div>
                  <div className="flex items-center gap-1.5 text-warm-600">
                    <Activity size={15} />
                    {activiteiten}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
