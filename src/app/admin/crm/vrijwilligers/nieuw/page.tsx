import { PageHeader, Card } from "@/components/ui";
import { inviteVrijwilliger } from "@/app/admin/_actions";
import Link from "next/link";
import { Mail, Calendar, Shield, Heart, ChevronRight } from "lucide-react";

// Beschikbaarheid opties
const BESCHIKBAARHEID_OPTIES = [
  { value: "weekend", label: "Weekend" },
  { value: "weekdagen", label: "Weekdagen" },
  { value: "avonden", label: "Avonden" },
  { value: "flexibel", label: "Flexibel" },
];

// VOG status opties
const VOG_OPTIES = [
  { value: "heeft", label: "Heeft VOG" },
  { value: "aanvraag_lopen", label: "VOG in aanvraag" },
  { value: "niet_nodig", label: "Niet nodig" },
];

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

          {/* Beschikbaarheid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Calendar size={14} />
              Beschikbaarheid
            </label>
            <select
              name="beschikbaarheid"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Selecteer…</option>
              {BESCHIKBAARHEID_OPTIES.map((optie) => (
                <option key={optie.value} value={optie.value}>{optie.label}</option>
              ))}
            </select>
          </div>

          {/* VOG status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Shield size={14} />
              VOG-status
            </label>
            <select
              name="vogStatus"
              defaultValue="niet_nodig"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {VOG_OPTIES.map((optie) => (
                <option key={optie.value} value={optie.value}>{optie.label}</option>
              ))}
            </select>
          </div>

          {/* Ervaring */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <Heart size={14} />
              Ervaring (optioneel)
            </label>
            <textarea
              name="ervaring"
              rows={3}
              placeholder="Eerdere vrijwilligers- of zorgervaring…"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Motivatie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <Heart size={14} />
              Motivatie (optioneel)
            </label>
            <textarea
              name="motivatie"
              rows={3}
              placeholder="Waarom wil deze persoon vrijwilligerswerk doen?"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
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