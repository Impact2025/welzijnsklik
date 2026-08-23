import { prisma } from "@/lib/prisma";
import { Mail, Plus, Send, Eye, Trash2, FileText, Image as ImageIcon } from "lucide-react";
import { Card, PageHeader, Badge, EmptyState } from "@/components/ui";
import Link from "next/link";
import { auth } from "@/auth";
import { getCoordinatorNieuwsbrieven, verwijderNieuwsbriefDraft } from "@/lib/actions/nieuwsbrieven";

function doelgroepLabel(d: string[]): string {
  const m: Record<string, string> = { FAMILIE: "Familie", VRIJWILLIGER: "Vrijwilligers" };
  return d.map((g) => m[g] ?? g).join(" + ") || "—";
}

export default async function CoordinatorNieuwsbrievenPage() {
  const session = await auth();
  if (!session?.user?.organisatieId) return null;

  const drafts = await getCoordinatorNieuwsbrieven();

  return (
    <div className="py-6 lg:py-8 space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Nieuwsbrieven"
        description="Stel een nieuwsbrief samen uit vrijwilligersactiviteiten met foto en verstuur naar familie en/of vrijwilligers."
        action={
          <Link
            href="/coordinator/nieuwsbrieven/nieuw"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Nieuwe nieuwsbrief
          </Link>
        }
      />

      {drafts.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Nog geen nieuwsbrieven"
          description="Maak een nieuwsbrief en kies de mooiste activiteiten van vrijwilligers om te delen."
          action={
            <Link
              href="/coordinator/nieuwsbrieven/nieuw"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
            >
              <Plus size={16} />
              Maak eerste nieuwsbrief
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {drafts.map((d) => {
            const verzonden = d.status === "verzonden";
            return (
              <Card key={d.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{d.titel}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-warm-500">
                    <span className="flex items-center gap-1">
                      <FileText size={11} />
                      {d._count.blokken} blok{d._count.blokken !== 1 ? "ken" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <ImageIcon size={11} />
                      {doelgroepLabel(d.doelgroep)}
                    </span>
                    {verzonden && d.verstuurtAantal > 0 && (
                      <span className="text-emerald-600 font-semibold">
                        {d.verstuurtAantal} verzonden
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge variant={verzonden ? "success" : "warning"}>
                    {verzonden ? "Verzonden" : "Concept"}
                  </Badge>
                  <Link
                    href={`/coordinator/nieuwsbrieven/${d.id}/edit`}
                    className="p-2 rounded-lg hover:bg-warm-100 transition-colors"
                    title="Bewerken"
                  >
                    <Eye size={16} className="text-warm-600" />
                  </Link>
                  {!verzonden && (
                    <form action={verwijderNieuwsbriefDraft.bind(null, d.id)}>
                      <button
                        type="submit"
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Verwijderen"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </form>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-warm-500 text-center">
        Tip: kies bij het versturen naar wie je stuurt — familie, vrijwilligers of allebei.
      </p>
    </div>
  );
}
