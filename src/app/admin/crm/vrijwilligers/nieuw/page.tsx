import { PageHeader, Card } from "@/components/ui";
import { inviteVrijwilliger } from "@/app/admin/_actions";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function NieuweVrijwilliger() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Vrijwilliger uitnodigen"
        description="Maak een account aan en stuur een uitnodigingsmail"
      />
      <Card className="max-w-xl">
        <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl mb-5">
          <Mail size={16} className="text-sky-600 flex-shrink-0" />
          <p className="text-sm text-sky-700">
            De vrijwilliger ontvangt een e-mail met een link om in te loggen op Welzijnsklik.
          </p>
        </div>

        <form action={inviteVrijwilliger} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volledige naam <span className="text-red-500">*</span>
            </label>
            <input
              name="naam"
              required
              placeholder="Bijv. Jan de Boer"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mailadres <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="jan@example.nl"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefoonnummer</label>
            <input
              name="telefoon"
              type="tel"
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
              placeholder="Bijv. Bezoek, Boodschappen, Muziek"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
            >
              <Mail size={15} />
              Uitnodiging versturen
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
    </div>
  );
}
