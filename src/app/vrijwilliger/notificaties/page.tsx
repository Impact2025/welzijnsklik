import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ACTIVITEIT_ICON, formatDatum } from "@/lib/activiteit";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/ui";

export default async function VrijwilligerNotificatiesPage() {
  const session = await auth();
  const gebruikerId = session?.user?.gebruikerId;
  if (!gebruikerId) redirect("/login");

  const dertigDagenGeleden = new Date();
  dertigDagenGeleden.setDate(dertigDagenGeleden.getDate() - 30);
  const weekGeleden = new Date();
  weekGeleden.setDate(weekGeleden.getDate() - 7);

  const reacties = await prisma.reactie.findMany({
    where: {
      activiteit: { vrijwilligerId: gebruikerId },
      createdAt: { gte: dertigDagenGeleden },
    },
    include: {
      activiteit: {
        select: {
          type: true,
          bewoner: { select: { naam: true } },
        },
      },
      gebruiker: { select: { naam: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const aantalNieuw = reacties.filter((r) => new Date(r.createdAt) >= weekGeleden).length;

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Notificaties</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {aantalNieuw > 0
            ? `${aantalNieuw} nieuwe reactie${aantalNieuw !== 1 ? "s" : ""} deze week`
            : "Reacties van familie op jouw activiteiten"}
        </p>
      </div>

      {reacties.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nog geen reacties"
          description="Familie kan reageren op activiteiten die jij hebt geregistreerd."
        />
      ) : (
        <div className="space-y-2">
          {reacties.map((r) => {
            const cfg = ACTIVITEIT_ICON[r.activiteit.type] ?? ACTIVITEIT_ICON.Anders;
            const Icon = cfg.icon;
            const isNieuw = new Date(r.createdAt) >= weekGeleden;
            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4"
              >
                <div className="flex gap-3 items-start">
                  <div className="text-2xl leading-none pt-0.5 flex-shrink-0">{r.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{r.gebruiker.naam}</p>
                      {isNieuw && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                          Nieuw
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon size={11} className={cfg.kleur} />
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {r.activiteit.type} bij {r.activiteit.bewoner.naam}
                      </p>
                    </div>
                    {r.bericht && (
                      <p className="text-sm text-gray-700 mt-1.5 leading-snug bg-neutral-50 rounded-xl px-3 py-2">
                        {r.bericht}
                      </p>
                    )}
                    <p className="text-[11px] text-neutral-400 mt-1.5">
                      {formatDatum(new Date(r.createdAt), {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
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
