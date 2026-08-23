import { Card, PageHeader } from "@/components/ui";
import { createNieuwsbriefDraft } from "@/lib/actions/nieuwsbrieven";
import { ArrowLeft } from "lucide-react";

export default function NieuweNieuwsbriefPage() {
  return (
    <div className="py-6 lg:py-8 space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Nieuwe nieuwsbrief"
        description="Geef een titel en begin met het samenstellen van je nieuwsbrief."
        action={
          <a
            href="/coordinator/nieuwsbrieven"
            className="text-sm text-warm-500 hover:text-warm-900 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Terug
          </a>
        }
      />

      <Card>
        <form action={createNieuwsbriefDraft} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">
              Titel van de nieuwsbrief
            </label>
            <input
              name="titel"
              required
              placeholder="Bijv. Maandoverzicht juli — mooie momenten"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
          >
            Aanmaken en samenstellen
          </button>
        </form>
      </Card>
    </div>
  );
}
