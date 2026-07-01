import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { updateInstellingen } from "@/app/admin/_actions";

export default async function InstellingenPage() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const [organisatie, instellingen] = await Promise.all([
    prisma.organisatie.findUnique({ where: { id: organisatieId } }),
    prisma.adminInstellingen.findUnique({ where: { organisatieId } }),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <PageHeader
        title="Instellingen"
        description="Beheer organisatiegegevens en platformconfiguratie"
      />

      <form action={updateInstellingen} className="space-y-6">
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Organisatie</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Naam organisatie
              </label>
              <input
                name="orgNaam"
                required
                defaultValue={organisatie?.naam ?? ""}
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plaats</label>
              <input
                name="orgPlaats"
                defaultValue={organisatie?.plaats ?? ""}
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">E-mail &amp; nieuwsbrieven</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                name="nieuwsbriefEnabled"
                type="checkbox"
                defaultChecked={instellingen?.nieuwsbriefEnabled ?? true}
                className="w-4 h-4 rounded border-warm-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Nieuwsbrieffunctie ingeschakeld
              </span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Afzender e-mailadres
                <span className="text-neutral-400 font-normal ml-1">(optioneel)</span>
              </label>
              <input
                name="nieuwsbriefFrom"
                type="email"
                defaultValue={instellingen?.nieuwsbriefFrom ?? ""}
                placeholder="bijv. info@mijnorganisatie.nl"
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-neutral-400 mt-1">
                Leeg laten om het standaard afzenderadres te gebruiken.
              </p>
            </div>
          </div>
        </Card>

        <button
          type="submit"
          className="px-6 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
        >
          Instellingen opslaan
        </button>
      </form>
    </div>
  );
}
