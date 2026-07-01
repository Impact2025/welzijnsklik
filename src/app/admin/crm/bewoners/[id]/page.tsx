import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader, Card, Badge } from "@/components/ui";
import { updateBewoner, deleteBewoner } from "@/app/admin/_actions";
import Link from "next/link";
import { ACTIVITEIT_ICON } from "@/lib/activiteit";
import { Trash2 } from "lucide-react";

export default async function BewonderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const bewoner = await prisma.bewoner.findUnique({
    where: { id: params.id, organisatieId },
    include: {
      familieleden: {
        include: { gebruiker: { select: { naam: true, email: true } } },
      },
      activiteiten: {
        include: { vrijwilliger: { select: { naam: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!bewoner) notFound();

  const updateWithId = updateBewoner.bind(null, params.id);
  const deleteWithId = deleteBewoner.bind(null, params.id);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={bewoner.naam}
        description={bewoner.kamer ? `Kamer ${bewoner.kamer}` : "Geen kamer opgegeven"}
        action={
          <Link
            href="/admin/crm/bewoners"
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
                  defaultValue={bewoner.naam}
                  className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kamernummer</label>
                <input
                  name="kamer"
                  defaultValue={bewoner.kamer ?? ""}
                  className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Geboortedatum</label>
                <input
                  name="geboortedatum"
                  type="date"
                  defaultValue={
                    bewoner.geboortedatum
                      ? new Date(bewoner.geboortedatum).toISOString().slice(0, 10)
                      : ""
                  }
                  className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notities</label>
                <textarea
                  name="notities"
                  rows={3}
                  defaultValue={bewoner.notities ?? ""}
                  className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  name="toestemmingFotos"
                  type="checkbox"
                  defaultChecked={bewoner.toestemmingFotos}
                  className="w-4 h-4 rounded border-warm-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Toestemming voor foto&apos;s gegeven
                </span>
              </label>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
                >
                  Wijzigingen opslaan
                </button>
                <Link
                  href="/admin/crm/bewoners"
                  className="px-5 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-semibold text-sm hover:bg-neutral-200 transition-colors"
                >
                  Annuleren
                </Link>
              </div>
            </form>
          </Card>

          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">Recente activiteiten</h2>
            {bewoner.activiteiten.length === 0 ? (
              <p className="text-sm text-neutral-400 py-4 text-center">Nog geen activiteiten geregistreerd</p>
            ) : (
              <div className="space-y-2">
                {bewoner.activiteiten.map((a) => {
                  const cfg = ACTIVITEIT_ICON[a.type] ?? ACTIVITEIT_ICON.Anders;
                  const Icon = cfg.icon;
                  return (
                    <div key={a.id} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon size={13} className={cfg.kleur} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{a.type}</p>
                        <p className="text-xs text-neutral-400">{a.vrijwilliger.naam} · {a.duurMinuten} min</p>
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
            <h2 className="font-semibold text-gray-900 mb-3">Familieleden</h2>
            {bewoner.familieleden.length === 0 ? (
              <p className="text-sm text-neutral-400">Nog geen familieleden gekoppeld</p>
            ) : (
              <div className="space-y-3">
                {bewoner.familieleden.map((f) => (
                  <div key={f.id} className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700 flex-shrink-0">
                      {f.gebruiker.naam?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{f.gebruiker.naam}</p>
                      <p className="text-xs text-neutral-400">{f.relatie} · {f.gebruiker.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Foto toestemming</span>
                <Badge variant={bewoner.toestemmingFotos ? "success" : "default"}>
                  {bewoner.toestemmingFotos ? "Ja" : "Nee"}
                </Badge>
              </div>
              {bewoner.toestemmingDoor && (
                <div className="flex items-start justify-between">
                  <span className="text-neutral-500">Door</span>
                  <span className="text-gray-700 text-right max-w-[140px]">{bewoner.toestemmingDoor}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Aangemaakt</span>
                <span className="text-gray-700">{new Date(bewoner.createdAt).toLocaleDateString("nl-NL")}</span>
              </div>
            </div>
          </Card>

          <form action={deleteWithId}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
              onClick={(e) => {
                if (!confirm(`Weet je zeker dat je ${bewoner.naam} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
                  e.preventDefault();
                }
              }}
            >
              <Trash2 size={15} />
              Bewoner verwijderen
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
