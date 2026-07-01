import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, PageHeader, Badge, StatCard, Button } from "@/components/ui";
import { Users, UserCheck, Activity } from "lucide-react";
import { updateKlant } from "../_actions";

const ROL_LABEL: Record<string, string> = {
  COORDINATOR: "Coördinator",
  VRIJWILLIGER: "Vrijwilliger",
  FAMILIE: "Familie",
};

export default async function KlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const organisatie = await prisma.organisatie.findUnique({ where: { id } });
  if (!organisatie) notFound();

  const dertigDagenGeleden = new Date();
  dertigDagenGeleden.setDate(dertigDagenGeleden.getDate() - 30);

  const [bewoners, gebruikers, activiteiten] = await Promise.all([
    prisma.bewoner.count({ where: { organisatieId: id } }),
    prisma.gebruiker.findMany({
      where: { organisatieId: id },
      orderBy: { createdAt: "asc" },
      select: { id: true, naam: true, email: true, rol: true, createdAt: true },
    }),
    prisma.activiteit.count({
      where: { bewoner: { organisatieId: id }, createdAt: { gte: dertigDagenGeleden } },
    }),
  ]);

  const vrijwilligers = gebruikers.filter((g) => g.rol === "VRIJWILLIGER").length;
  const familieleden = gebruikers.filter((g) => g.rol === "FAMILIE").length;

  const updateKlantWithId = updateKlant.bind(null, id);

  return (
    <div className="p-6 space-y-6">
      <PageHeader title={organisatie.naam} description={organisatie.plaats} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Bewoners" value={bewoners} icon={Users} href="#" variant="info" />
        <StatCard
          label="Vrijwilligers + familie"
          value={vrijwilligers + familieleden}
          icon={UserCheck}
          href="#"
          variant="success"
        />
        <StatCard label="Activiteiten (30d)" value={activiteiten} icon={Activity} href="#" variant="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Organisatiegegevens</h2>
          <form action={updateKlantWithId} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-900 mb-1">Naam</label>
              <input
                name="naam"
                defaultValue={organisatie.naam}
                required
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-900 mb-1">Plaats</label>
              <input
                name="plaats"
                defaultValue={organisatie.plaats}
                required
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <Button type="submit" variant="primary">
              Opslaan
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Gebruikers bij deze klant</h2>
          {gebruikers.length === 0 ? (
            <p className="text-sm text-warm-500">Nog geen gebruikers.</p>
          ) : (
            <div className="space-y-2">
              {gebruikers.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between py-2 border-b border-warm-100 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{g.naam}</p>
                    <p className="text-xs text-warm-500 truncate">{g.email}</p>
                  </div>
                  <Badge variant={g.rol === "COORDINATOR" ? "info" : "default"}>
                    {ROL_LABEL[g.rol] ?? g.rol}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
