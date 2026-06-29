import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";
import { Avatar } from "@/components/ui";

function tijdLabel(datum: Date) {
  const nu = new Date();
  const diff = nu.getTime() - datum.getTime();
  if (diff < 60_000) return "nu";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return datum.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  if (diff < 7 * 86_400_000) return datum.toLocaleDateString("nl-NL", { weekday: "short" });
  return datum.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export default async function CoordinatorBerichtenPage() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  const ikId = session!.user.gebruikerId!;

  // Haal alle vrijwilligers op + hun laatste bericht + ongelezen teller
  const vrijwilligers = await prisma.gebruiker.findMany({
    where: { organisatieId, rol: "VRIJWILLIGER" },
    orderBy: { naam: "asc" },
  });

  const threadData = await Promise.all(
    vrijwilligers.map(async (v) => {
      const [laatste, ongelezen] = await Promise.all([
        prisma.bericht.findFirst({
          where: {
            OR: [
              { vanId: ikId, aanId: v.id },
              { vanId: v.id, aanId: ikId },
            ],
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.bericht.count({
          where: { vanId: v.id, aanId: ikId, gelezen: false },
        }),
      ]);
      return { vrijwilliger: v, laatste, ongelezen };
    })
  );

  // Sorteer: eerst met berichten (nieuwste eerst), dan zonder
  const gesorteerd = threadData.sort((a, b) => {
    if (!a.laatste && !b.laatste) return 0;
    if (!a.laatste) return 1;
    if (!b.laatste) return -1;
    return new Date(b.laatste.createdAt).getTime() - new Date(a.laatste.createdAt).getTime();
  });

  const metBerichten = gesorteerd.filter((t) => t.laatste);
  const zonderBerichten = gesorteerd.filter((t) => !t.laatste);

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Berichten</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Gesprekken met vrijwilligers</p>
      </div>

      {vrijwilligers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 px-4 py-12 text-center">
          <MessageSquare size={24} className="text-neutral-300 mx-auto mb-2" />
          <p className="text-neutral-400 text-sm">Nog geen vrijwilligers in het team.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Actieve gesprekken */}
          {metBerichten.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden divide-y divide-neutral-50">
              {metBerichten.map(({ vrijwilliger: v, laatste, ongelezen }) => (
                <Link
                  key={v.id}
                  href={`/coordinator/berichten/${v.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors"
                >
                  <Avatar naam={v.naam} src={v.profielFoto} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${ongelezen > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                        {v.naam}
                      </p>
                      <span className="text-[11px] text-neutral-400 flex-shrink-0">
                        {laatste && tijdLabel(new Date(laatste.createdAt))}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${ongelezen > 0 ? "text-gray-700 font-medium" : "text-neutral-400"}`}>
                      {laatste?.vanId === ikId ? "Jij: " : ""}{laatste?.inhoud}
                    </p>
                  </div>
                  {ongelezen > 0 && (
                    <span className="w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      {ongelezen > 9 ? "9+" : ongelezen}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Vrijwilligers zonder gesprek */}
          {zonderBerichten.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wider">Nog geen gesprek</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden divide-y divide-neutral-50">
                {zonderBerichten.map(({ vrijwilliger: v }) => (
                  <Link
                    key={v.id}
                    href={`/coordinator/berichten/${v.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors"
                  >
                    <Avatar naam={v.naam} src={v.profielFoto} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{v.naam}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">Klik om een bericht te sturen</p>
                    </div>
                    <Plus size={16} className="text-neutral-300 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
