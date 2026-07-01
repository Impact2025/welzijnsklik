import { Card, PageHeader, Button } from "@/components/ui";
import { createKlant } from "../_actions";

export default function NieuweKlantPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Nieuwe klant"
        description="Voeg een woonorganisatie toe en nodig de eerste coördinator uit"
      />

      <Card className="max-w-lg">
        <form action={createKlant} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">Organisatienaam</label>
            <input
              name="naam"
              required
              placeholder="Bijv. Woonzorgcentrum De Linde"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">Plaats</label>
            <input
              name="plaats"
              required
              placeholder="Bijv. Haarlem"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <hr className="border-warm-100" />
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">Naam eerste coördinator</label>
            <input
              name="coordinatorNaam"
              required
              placeholder="Bijv. Petra van den Berg"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">E-mailadres coördinator</label>
            <input
              name="coordinatorEmail"
              type="email"
              required
              placeholder="naam@organisatie.nl"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary">
              Klant aanmaken
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
