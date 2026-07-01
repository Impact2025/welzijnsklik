import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader, Card, Badge } from "@/components/ui";
import { updateVrijwilliger } from "@/app/admin/_actions";
import Link from "next/link";
import { ACTIVITEIT_ICON } from "@/lib/activiteit";

export default async function VrijwilligerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const vrijwilliger = await prisma.gebruiker.findUnique({
    where: { id: params.id, organisatieId, rol: "VRIJWILLIGER" },
    include: {
      activiteiten: {
        include: { bewoner: { select: { naam: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { activiteiten: true } },
    },
  });

  if (!vrijwilliger) notFound();

  const updateWithId = updateVrijwilliger.bind(null, params.id);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={vrijwilliger.naam}
        description={vrijwilliger.email}
        action={
          <Link
            href="/admin/crm/vrijwilligers"
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            ← Terug
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">Gegevens bewerken</h2>
            <form action={updateWithId} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volledige naam <span className="text-red-500">*</span>
                </label>
                <input
                  name="naam"
                  required
                  defaultValue={vrijwilliger.naam}
                  className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefoonnummer</label>
                <input
                  name="telefoon"
                  type="tel"
                  defaultValue={vrijwilliger.telefoon ?? ""}
                  placeholder="06 12345678"
                  className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voorkeur activiteiten
                  <span className="text-neutral-400 font-normal ml-1">(komma-gescheiden)</span>
                </label>
                <input
                  name="voorkeur"
                  defaultValue={vrijwilliger.voorkeurActiviteiten.join(", ")}
                  placeholder="Bezoek, Boodschappen, Muziek"
                  className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interne notities</label>
                <textarea
                  name="interneNotities"
                  rows={3}
                  defaultValue={vrijwilliger.interneNotities ?? ""}
                  placeholder="Aantekeningen zichtbaar alleen voor de coördinator…"
                  className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
                >
                  Wijzigingen opslaan
                </button>
                <Link
                  href="/admin/crm/vrijwilligers"
                  className="px-5 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-semibold text-sm hover:bg-neutral-200 transition-colors"
                >
                  Annuleren
                </Link>
              </div>
            </form>
          </Card>

          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">
              Activiteiten ({vrijwilliger._count.activiteiten} totaal)
            </h2>
            {vrijwilliger.activiteiten.length === 0 ? (
              <p className="text-sm text-neutral-400 py-4 text-center">Nog geen activiteiten geregistreerd</p>
            ) : (
              <div className="space-y-2">
                {vrijwilliger.activiteiten.map((a) => {
                  const cfg = ACTIVITEIT_ICON[a.type] ?? ACTIVITEIT_ICON.Anders;
                  const Icon = cfg.icon;
                  return (
                    <div key={a.id} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon size={13} className={cfg.kleur} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{a.type}</p>
                        <p className="text-xs text-neutral-400">bij {a.bewoner.naam} · {a.duurMinuten} min</p>
                      </div>
                      <span className="text-[11px] text-neutral-400 flex-shrink-0">
                        {new Date(a.createdAt).toLocaleDateString("nl-NL")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Profiel</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">E-mail</span>
                <span className="text-gray-700 text-right max-w-[140px] truncate">{vrijwilliger.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Activiteiten</span>
                <span className="text-gray-700 font-semibold">{vrijwilliger._count.activiteiten}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Lid sinds</span>
                <span className="text-gray-700">{new Date(vrijwilliger.createdAt).toLocaleDateString("nl-NL")}</span>
              </div>
            </div>
          </Card>

          {vrijwilliger.voorkeurActiviteiten.length > 0 && (
            <Card>
              <h2 className="font-semibold text-gray-900 mb-3">Voorkeuren</h2>
              <div className="flex flex-wrap gap-1.5">
                {vrijwilliger.voorkeurActiviteiten.map((v) => (
                  <Badge key={v} variant="info">{v}</Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
