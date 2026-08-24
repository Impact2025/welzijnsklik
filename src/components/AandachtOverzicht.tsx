import Link from "next/link";
import { AlertTriangle, HeartPulse, Sparkles, Activity } from "lucide-react";
import { EmptyState } from "@/components/ui";
import type { AandachtStatus, BewonerAandacht } from "@/lib/aandacht";

const STATUS_CONFIG: Record<AandachtStatus, { label: string; dot: string; badge: string }> = {
  rood: { label: "Aandacht nodig", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
  oranje: { label: "Let op", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  groen: { label: "Op ritme", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  nieuw: { label: "Nog geen ritme bekend", dot: "bg-neutral-300", badge: "bg-neutral-100 text-neutral-500 border-neutral-200" },
};

function laatsteActiviteitLabel(dagen: number | null): string {
  if (dagen === null) return "Nog geen activiteit";
  if (dagen === 0) return "Vandaag";
  if (dagen === 1) return "Gisteren";
  return `${dagen} dagen geleden`;
}

export function AandachtOverzicht({
  data,
  bewonerHref,
}: {
  data: BewonerAandacht[];
  bewonerHref?: (id: string) => string;
}) {
  const rood = data.filter((b) => b.status === "rood");
  const oranje = data.filter((b) => b.status === "oranje");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 lg:p-4">
          <p className="text-2xl font-bold text-red-700">{rood.length}</p>
          <p className="text-xs lg:text-sm text-red-700/80 mt-0.5">Aandacht nodig</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 lg:p-4">
          <p className="text-2xl font-bold text-amber-700">{oranje.length}</p>
          <p className="text-xs lg:text-sm text-amber-700/80 mt-0.5">Let op</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 lg:p-4">
          <p className="text-2xl font-bold text-emerald-700">{data.length - rood.length - oranje.length}</p>
          <p className="text-xs lg:text-sm text-emerald-700/80 mt-0.5">Op ritme / nieuw</p>
        </div>
      </div>

      {rood.length > 0 && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-2xl px-4 py-3.5">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">
            Deze bewoners hebben duidelijk minder activiteiten dan hun eigen gebruikelijke ritme
            de afgelopen {14} dagen. Dit is relatief bepaald — iedereen wordt vergeleken met
            zichzelf, niet met elkaar.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        {data.length === 0 ? (
          <EmptyState icon={HeartPulse} title="Nog geen bewoners om te beoordelen." />
        ) : (
          <div className="divide-y divide-neutral-50">
            {data.map((b) => {
              const cfg = STATUS_CONFIG[b.status];
              const href = bewonerHref?.(b.id);
              const content = (
                <>
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm truncate">{b.naam}</p>
                      {b.kamer && <span className="text-xs text-neutral-400 flex-shrink-0">kamer {b.kamer}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-400">
                      <span>{laatsteActiviteitLabel(b.dagenSindsLaatste)}</span>
                      <span className="flex items-center gap-1">
                        <Activity size={11} />
                        {b.aantalLaatste30Dagen} laatste 30 dagen
                      </span>
                      {b.status !== "nieuw" && (
                        <span className="hidden sm:inline">gem. {b.gemiddeldPerWeek}/week eigen ritme</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[11px] lg:text-xs font-semibold rounded-full border px-2.5 py-1 flex-shrink-0 flex items-center gap-1 ${cfg.badge}`}>
                    {b.status === "nieuw" && <Sparkles size={11} />}
                    {cfg.label}
                  </span>
                </>
              );
              const className = `flex items-center gap-3 lg:gap-4 px-4 py-3.5 lg:py-4 ${href ? "hover:bg-neutral-50 transition-colors" : ""}`;
              return href ? (
                <Link key={b.id} href={href} className={className}>
                  {content}
                </Link>
              ) : (
                <div key={b.id} className={className}>
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
