import { PageHeader, Card } from "@/components/ui";
import { createBewoner } from "@/app/admin/_actions";
import Link from "next/link";

export default function NieuweBewoner() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Bewoner toevoegen"
        description="Voeg een nieuwe bewoner toe aan de organisatie"
      />
      <Card className="max-w-xl">
        <form action={createBewoner} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volledige naam <span className="text-red-500">*</span>
            </label>
            <input
              name="naam"
              required
              placeholder="Bijv. Marie de Vries"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kamernummer</label>
            <input
              name="kamer"
              placeholder="Bijv. 12A"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geboortedatum</label>
            <input
              name="geboortedatum"
              type="date"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notities</label>
            <textarea
              name="notities"
              rows={3}
              placeholder="Interne aantekeningen over de bewoner…"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="toestemmingFotos"
              type="checkbox"
              className="w-4 h-4 rounded border-warm-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-gray-700">Toestemming voor foto&apos;s gegeven</span>
          </label>

          <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
            >
              Bewoner toevoegen
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
    </div>
  );
}
