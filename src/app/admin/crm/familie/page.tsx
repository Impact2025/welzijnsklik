import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { Card, PageHeader, EmptyState } from "@/components/ui";

export default async function FamiliePage() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const familieleden = await prisma.gebruiker.findMany({
    where: { organisatieId, rol: "FAMILIE" },
    include: {
      familieVan: {
        include: { bewoner: { select: { naam: true, kamer: true } } },
      },
    },
    orderBy: { naam: "asc" },
    take: 100,
  });

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Familieleden"
        description={`${familieleden.length} familielid${familieleden.length !== 1 ? "en" : ""} geregistreerd`}
      />

      {familieleden.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nog geen familieleden"
          description="Familieleden worden automatisch aangemaakt via de uitnodigingsmail vanuit het bewonerprofiel."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {familieleden.map((f) => (
            <Card key={f.id} hover>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700 flex-shrink-0">
                  {f.naam?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{f.naam}</h3>
                  <p className="text-xs text-neutral-500 truncate">{f.email}</p>
                </div>
              </div>

              {f.familieVan.length > 0 && (
                <div className="space-y-1 text-sm">
                  {f.familieVan.map((koppeling) => (
                    <div key={koppeling.id} className="flex items-center gap-2 text-neutral-600">
                      <span className="text-neutral-400 text-xs">{koppeling.relatie} van</span>
                      <span className="font-medium text-gray-700">{koppeling.bewoner.naam}</span>
                      {koppeling.bewoner.kamer && (
                        <span className="text-neutral-400 text-xs">· kamer {koppeling.bewoner.kamer}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-neutral-100">
                <span className="text-[11px] text-neutral-400">
                  Lid sinds {new Date(f.createdAt).toLocaleDateString("nl-NL")}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
