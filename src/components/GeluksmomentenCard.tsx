import Link from "next/link";
import { Sparkles, Info } from "lucide-react";
import type { GeluksmomentenOverzicht, GeluksmomentenPeriode } from "@/lib/actions/geluksmomenten";

const PERIODE_LABEL: Record<GeluksmomentenPeriode, string> = {
  week: "Deze week",
  maand: "Deze maand",
  kwartaal: "Dit kwartaal",
};

const PERIODE_TOGGLE_LABEL: Record<GeluksmomentenPeriode, string> = {
  week: "Week",
  maand: "Maand",
  kwartaal: "Kwartaal",
};

function formatGetal(n: number): string {
  return Math.round(n).toLocaleString("nl-NL");
}

export function GeluksmomentenCard({
  data,
  periodeHref,
}: {
  data: GeluksmomentenOverzicht;
  // (periode) => href, voor de maand/kwartaal-toggle. Zonder deze prop geen toggle.
  periodeHref?: (periode: GeluksmomentenPeriode) => string;
}) {
  const { bereikt, voorspeld, percentages, totalUren, verdeling } = data;
  const heeftData = totalUren > 0 && verdeling.groen + verdeling.oranje + verdeling.rood > 0;
  const voortgang = voorspeld > 0 ? Math.min(100, Math.round((bereikt / voorspeld) * 100)) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 lg:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Sparkles size={17} className="text-amber-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-[15px] lg:text-base">Geluksmomenten</h2>
            <p className="text-xs text-neutral-400">{PERIODE_LABEL[data.periode]}</p>
          </div>
        </div>

        {periodeHref && (
          <div className="flex items-center gap-1 bg-neutral-100 rounded-full p-0.5 text-xs font-semibold">
            {(["week", "maand", "kwartaal"] as const).map((p) => (
              <Link
                key={p}
                href={periodeHref(p)}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  data.periode === p ? "bg-white text-gray-900 shadow-sm" : "text-neutral-500 hover:text-gray-700"
                }`}
              >
                {PERIODE_TOGGLE_LABEL[p]}
              </Link>
            ))}
          </div>
        )}
      </div>

      {!heeftData ? (
        <p className="text-sm text-neutral-400">
          Nog geen welzijnschecks of activiteiten in deze periode.
        </p>
      ) : (
        <>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-gray-900 tabular-nums">
                {formatGetal(bereikt)}
              </p>
              <p className="text-xs lg:text-sm text-neutral-500 mt-0.5 font-medium">Bereikt</p>
            </div>
            <div className="pb-0.5">
              <p className="text-lg lg:text-xl font-semibold text-neutral-400 tabular-nums">
                {formatGetal(voorspeld)}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">Voorspeld</p>
            </div>

            <div className="ml-auto group relative">
              <button
                type="button"
                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-300 hover:text-neutral-500 hover:bg-neutral-50 transition-colors"
                aria-label="Toelichting welzijnsscores"
              >
                <Info size={15} />
              </button>
              <div className="hidden group-hover:block group-focus-within:block absolute right-0 bottom-full mb-2 w-56 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-lg z-10 space-y-1.5">
                <p className="font-semibold mb-1">Welzijnschecks deze periode</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Groen</span>
                  <span className="tabular-nums">{percentages.groen}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Oranje</span>
                  <span className="tabular-nums">{percentages.oranje}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Rood</span>
                  <span className="tabular-nums">{percentages.rood}%</span>
                </div>
                <p className="text-neutral-400 pt-1 border-t border-white/10 mt-1.5">
                  {formatGetal(totalUren)}u vrijwilligerswerk deze periode
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${Math.max(voortgang, voortgang > 0 ? 2 : 0)}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
