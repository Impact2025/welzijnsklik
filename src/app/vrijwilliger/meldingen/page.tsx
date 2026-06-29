import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Bell, CheckCircle2, XCircle, Megaphone, HandHeart } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui";

function formatDatum(datum: Date) {
  return datum.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export default async function VrijwilligerMeldingenPage() {
  const session = await auth();
  const vrijwilligerId = session!.user.gebruikerId!;
  const organisatieId = session!.user.organisatieId!;

  const [reacties, openHulp] = await Promise.all([
    // Aanmeldingen met statusupdate (bevestigd / afgewezen)
    prisma.hulpReactie.findMany({
      where: {
        vrijwilligerId,
        status: { in: ["bevestigd", "afgewezen"] },
      },
      include: {
        hulpGevraagd: { select: { id: true, titel: true, datum: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    // Open oproepen waarop nog niet gereageerd
    prisma.hulpGevraagd.findMany({
      where: {
        organisatieId,
        status: "open",
        datum: { gte: new Date() },
        reacties: { none: { vrijwilligerId } },
      },
      orderBy: { datum: "asc" },
      take: 5,
    }),
  ]);

  const heeftMeldingen = reacties.length > 0 || openHulp.length > 0;

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Meldingen</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {heeftMeldingen ? "Updates voor jou" : "Alles bijgewerkt"}
        </p>
      </div>

      {/* Open oproepen */}
      {openHulp.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900 text-[15px]">Nieuwe oproepen</h2>
          <div className="space-y-2">
            {openHulp.map((h) => (
              <Link
                key={h.id}
                href="/vrijwilliger/hulp-gevraagd"
                className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 hover:bg-amber-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Megaphone size={16} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{h.titel}</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {h.datum.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}
                    {" · "}Reageer nu
                  </p>
                </div>
                <HandHeart size={16} className="text-amber-500 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Status updates aanmeldingen */}
      {reacties.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900 text-[15px]">Jouw aanmeldingen</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 divide-y divide-neutral-50 overflow-hidden">
            {reacties.map((r) => {
              const bevestigd = r.status === "bevestigd";
              return (
                <Link
                  key={r.id}
                  href="/vrijwilliger/hulp-gevraagd"
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bevestigd ? "bg-emerald-100" : "bg-neutral-100"}`}>
                    {bevestigd
                      ? <CheckCircle2 size={16} className="text-emerald-600" />
                      : <XCircle size={16} className="text-neutral-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {r.hulpGevraagd.titel}
                    </p>
                    <p className={`text-xs mt-0.5 ${bevestigd ? "text-emerald-600" : "text-neutral-400"}`}>
                      {bevestigd ? "Jij bent bevestigd!" : "Niet geselecteerd"}
                      {" · "}{formatDatum(new Date(r.hulpGevraagd.datum))}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!heeftMeldingen && (
        <EmptyState
          icon={Bell}
          title="Geen nieuwe meldingen"
          description="Je bent helemaal bij. Nieuwe oproepen en statusupdates verschijnen hier."
        />
      )}
    </div>
  );
}
