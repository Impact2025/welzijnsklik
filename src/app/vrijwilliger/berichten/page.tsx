import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
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

export default async function VrijwilligerBerichtenPage() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;
  const ikId = session!.user.gebruikerId!;

  const coordinatoren = await prisma.gebruiker.findMany({
    where: { organisatieId, rol: "COORDINATOR" },
    orderBy: { naam: "asc" },
  });

  // Als er maar 1 coordinator is én er al een gesprek is → direct doorsturen
  if (coordinatoren.length === 1) {
    const heeftBericht = await prisma.bericht.count({
      where: {
        OR: [
          { vanId: ikId, aanId: coordinatoren[0].id },
          { vanId: coordinatoren[0].id, aanId: ikId },
        ],
      },
    });
    if (heeftBericht > 0) {
      redirect(`/vrijwilliger/berichten/${coordinatoren[0].id}`);
    }
  }

  const threadData = await Promise.all(
    coordinatoren.map(async (c) => {
      const [laatste, ongelezen] = await Promise.all([
        prisma.bericht.findFirst({
          where: {
            OR: [
              { vanId: ikId, aanId: c.id },
              { vanId: c.id, aanId: ikId },
            ],
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.bericht.count({
          where: { vanId: c.id, aanId: ikId, gelezen: false },
        }),
      ]);
      return { coordinator: c, laatste, ongelezen };
    })
  );

  const gesorteerd = threadData.sort((a, b) => {
    if (!a.laatste && !b.laatste) return 0;
    if (!a.laatste) return 1;
    if (!b.laatste) return -1;
    return new Date(b.laatste.createdAt).getTime() - new Date(a.laatste.createdAt).getTime();
  });

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Berichten</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Gesprekken met de coördinator</p>
      </div>

      {coordinatoren.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 px-4 py-12 text-center">
          <MessageSquare size={24} className="text-neutral-300 mx-auto mb-2" />
          <p className="text-neutral-400 text-sm">Geen coördinatoren gevonden.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden divide-y divide-neutral-50">
          {gesorteerd.map(({ coordinator: c, laatste, ongelezen }) => (
            <Link
              key={c.id}
              href={`/vrijwilliger/berichten/${c.id}`}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors"
            >
              <Avatar naam={c.naam} src={c.profielFoto} fotoId={c.id} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${ongelezen > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                    {c.naam}
                  </p>
                  {laatste && (
                    <span className="text-[11px] text-neutral-400 flex-shrink-0">
                      {tijdLabel(new Date(laatste.createdAt))}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 truncate ${ongelezen > 0 ? "text-gray-700 font-medium" : "text-neutral-400"}`}>
                  {laatste
                    ? `${laatste.vanId === ikId ? "Jij: " : ""}${laatste.inhoud}`
                    : "Stuur een bericht"}
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
    </div>
  );
}
