import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ACTIVITEIT_ICON, formatDatum, formatDuur } from "@/lib/activiteit";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/ui";

export default async function FamilieNotificatiesPage() {
  const session = await auth();
  const gebruikerId = session?.user?.gebruikerId;
  if (!gebruikerId) redirect("/login");

  const dertigDagenGeleden = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const weekGeleden = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const koppelingen = await prisma.familieKoppeling.findMany({
    where: { gebruikerId },
    include: {
      bewoner: {
        include: {
          activiteiten: {
            where: { createdAt: { gte: dertigDagenGeleden } },
            orderBy: { createdAt: "desc" },
            include: {
              vrijwilliger: { select: { naam: true } },
            },
          },
        },
      },
    },
  });

  const activiteiten = koppelingen
    .flatMap((k) =>
      k.bewoner.activiteiten.map((a) => ({
        ...a,
        bewonerNaam: k.bewoner.naam,
        isNieuw: new Date(a.createdAt) >= weekGeleden,
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const aantalNieuw = activiteiten.filter((a) => a.isNieuw).length;

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Notificaties</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {aantalNieuw > 0
            ? `${aantalNieuw} nieuwe activiteit${aantalNieuw !== 1 ? "en" : ""} deze week`
            : "Activiteiten van de afgelopen 30 dagen"}
        </p>
      </div>

      {activiteiten.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Geen recente activiteiten"
          description="Er zijn nog geen activiteiten geregistreerd voor uw naaste(n)."
        />
      ) : (
        <div className="space-y-2">
          {activiteiten.map((a) => {
            const cfg = ACTIVITEIT_ICON[a.type] ?? ACTIVITEIT_ICON.Anders;
            const Icon = cfg.icon;
            return (
              <div
                key={a.id}
                className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4"
              >
                <div className="flex gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}
                  >
                    <Icon size={16} className={cfg.kleur} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{a.type}</p>
                      {a.isNieuw && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                          Nieuw
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {a.vrijwilliger.naam} bij {a.bewonerNaam} ·{" "}
                      {formatDuur(a.duurMinuten)} ·{" "}
                      {formatDatum(new Date(a.createdAt), {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {a.notities && (
                      <p className="text-sm text-gray-700 mt-1.5 leading-snug">{a.notities}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
