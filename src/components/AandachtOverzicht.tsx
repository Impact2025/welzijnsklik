import Link from "next/link";
import { AlertTriangle, HeartPulse, Sparkles, Activity, CheckCheck } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { OppakKnop } from "@/components/OppakKnop";
import type { AandachtStatus, BewonerAandacht } from "@/lib/aandacht";

const STATUS_CONFIG: Record<AandachtStatus, { label: string; dot: string; badge: string }> = {
  rood: { label: "Aandacht nodig", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
  oranje: { label: "Let op", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  opgepakt: { label: "Opgepakt", dot: "bg-sky-500", badge: "bg-sky-50 text-sky-700 border-sky-200" },
  groen: { label: "Op ritme", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  nieuw: { label: "Nog geen ritme bekend", dot: "bg-neutral-300", badge: "bg-neutral-100 text-neutral-500 border-neutral-200" },
};

function opgepaktLabel(door: string | null, op: Date | null): string {
  if (!door || !op) return "";
  const dagen = Math.floor((Date.now() - op.getTime()) / 86400000);
  const wanneer = dagen === 0 ? "vandaag" : dagen === 1 ? "gisteren" : `${dagen} dagen geleden`;
  return `door ${door}, ${wanneer}`;
}

function laatsteActiviteitLabel(dagen: number | null): string {
  if (dagen === null) return "Nog geen activiteit";
  if (dagen === 0) return "Vandaag";
  if (dagen === 1) return "Gisteren";
  return `${dagen} dagen geleden`;
}

export function AandachtOverzicht({
  data,
  bewonerHref,
  recentDagen = 14,
}: {
  data: BewonerAandacht[];
  bewonerHref?: (id: string) => string;
  recentDagen?: number;
}) {
  const rood = data.filter((b) => b.status === "rood");
  const oranje = data.filter((b) => b.status === "oranje");
  const opgepakt = data.filter((b) => b.status === "opgepakt");
  const rustig = data.length - rood.length - oranje.length - opgepakt.length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 lg:p-4">
          <p className="text-2xl font-bold text-red-700">{rood.length}</p>
          <p className="text-xs lg:text-sm text-red-700/80 mt-0.5">Aandacht nodig</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 lg:p-4">
          <p className="text-2xl font-bold text-amber-700">{oranje.length}</p>
          <p className="text-xs lg:text-sm text-amber-700/80 mt-0.5">Let op</p>
        </div>
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3.5 lg:p-4">
          <p className="text-2xl font-bold text-sky-700">{opgepakt.length}</p>
          <p className="text-xs lg:text-sm text-sky-700/80 mt-0.5">Opgepakt</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 lg:p-4">
          <p className="text-2xl font-bold text-emerald-700">{rustig}</p>
          <p className="text-xs lg:text-sm text-emerald-700/80 mt-0.5">Op ritme / nieuw</p>
        </div>
      </div>

      {rood.length > 0 && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-2xl px-4 py-3.5">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">
            Deze bewoners hebben duidelijk minder activiteiten dan hun eigen gebruikelijke ritme
            de afgelopen {recentDagen} dagen. Dit is relatief bepaald — iedereen wordt vergeleken met
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
              const naam = href ? (
                <Link href={href} className="font-semibold text-gray-900 text-sm truncate hover:underline">
                  {b.naam}
                </Link>
              ) : (
                <p className="font-semibold text-gray-900 text-sm truncate">{b.naam}</p>
              );
              return (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 lg:gap-4 px-4 py-3.5 lg:py-4"
                >
                  <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {naam}
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
                      {b.status === "opgepakt" && (
                        <p className="flex items-center gap-1 mt-1 text-[11px] text-sky-600">
                          <CheckCheck size={11} />
                          {opgepaktLabel(b.opgepaktDoor, b.opgepaktOp)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 pl-[22px] sm:pl-0">
                    <span className={`text-[11px] lg:text-xs font-semibold rounded-full border px-2.5 py-1 flex-shrink-0 flex items-center gap-1 ${cfg.badge}`}>
                      {b.status === "nieuw" && <Sparkles size={11} />}
                      {cfg.label}
                    </span>
                    {(b.status === "rood" || b.status === "oranje") && <OppakKnop bewonerId={b.id} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
