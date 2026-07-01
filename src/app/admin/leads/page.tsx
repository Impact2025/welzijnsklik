import { prisma } from "@/lib/prisma";
import { UserPlus, Trash2 } from "lucide-react";
import { Card, PageHeader, Badge, EmptyState, Button } from "@/components/ui";
import { createLead, updateLeadStatus, deleteLead } from "./_actions";

const STATUS_OPTIES = [
  { value: "nieuw", label: "Nieuw", variant: "info" as const },
  { value: "benaderd", label: "Benaderd", variant: "warning" as const },
  { value: "klant", label: "Klant geworden", variant: "success" as const },
  { value: "niet_relevant", label: "Niet relevant", variant: "default" as const },
];

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Leads"
        description="Prospects en woonorganisaties met interesse in Welzijnsklik"
      />

      <Card className="max-w-2xl">
        <h2 className="font-semibold text-gray-900 mb-4">Lead toevoegen</h2>
        <form action={createLead} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">Naam</label>
            <input
              name="naam"
              placeholder="Contactpersoon"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">Organisatie</label>
            <input
              name="organisatie"
              placeholder="Naam woonorganisatie"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">E-mailadres</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">Telefoon</label>
            <input
              name="telefoon"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-warm-900 mb-1">Notitie</label>
            <textarea
              name="notitie"
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="primary" icon={UserPlus}>
              Toevoegen
            </Button>
          </div>
        </form>
      </Card>

      {leads.length === 0 ? (
        <EmptyState icon={UserPlus} title="Nog geen leads" description="Voeg handmatig je eerste lead toe" />
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const statusInfo = STATUS_OPTIES.find((s) => s.value === lead.status);
            const updateWithId = updateLeadStatus.bind(null, lead.id);
            const deleteWithId = deleteLead.bind(null, lead.id);
            return (
              <Card key={lead.id} className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{lead.naam ?? lead.email}</h3>
                  <p className="text-sm text-warm-600 mt-0.5">
                    {lead.organisatie && <span>{lead.organisatie} · </span>}
                    {lead.email}
                    {lead.telefoon && <span> · {lead.telefoon}</span>}
                  </p>
                  {lead.notitie && <p className="text-sm text-warm-500 mt-1 line-clamp-2">{lead.notitie}</p>}
                  <p className="text-xs text-warm-400 mt-1">
                    {new Date(lead.createdAt).toLocaleDateString("nl-NL")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={statusInfo?.variant ?? "default"}>{statusInfo?.label ?? lead.status}</Badge>
                  <form action={updateWithId} className="flex items-center gap-1.5">
                    <select
                      name="status"
                      defaultValue={lead.status}
                      className="text-xs border border-warm-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {STATUS_OPTIES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="text-xs font-medium px-2 py-1.5 rounded-lg border border-warm-200 hover:bg-warm-50 transition-colors"
                    >
                      Opslaan
                    </button>
                  </form>
                  <form action={deleteWithId}>
                    <button
                      type="submit"
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors text-warm-400 hover:text-red-500"
                      title="Verwijderen"
                    >
                      <Trash2 size={15} />
                    </button>
                  </form>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
