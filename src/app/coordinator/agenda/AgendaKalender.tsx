"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const MAANDEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];
const DAGHEADERS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

type AgendaItem = {
  id: string;
  dag: number;
  type: "activiteit" | "hulp";
  titel: string;
  subtitel?: string;
  href: string;
  status?: string;
  tijdLabel?: string;
};

interface Props {
  jaar: number;
  maand: number; // 0-indexed
  activiteiten: AgendaItem[];
  hulpVragen: AgendaItem[];
}

function maandParam(j: number, m: number) {
  return `${j}-${String(m + 1).padStart(2, "0")}`;
}

export default function AgendaKalender({ jaar, maand, activiteiten, hulpVragen }: Props) {
  const vandaag = new Date();
  const [geselecteerdeDag, setGeselecteerdeDag] = useState<number | null>(null);

  const eerstedag = new Date(jaar, maand, 1);
  const aantaldagen = new Date(jaar, maand + 1, 0).getDate();
  // Monday-first offset: 0=Mon … 6=Sun
  const startOffset = (eerstedag.getDay() + 6) % 7;

  const alleItems: AgendaItem[] = [...activiteiten, ...hulpVragen];
  const itemsPerDag: Record<number, AgendaItem[]> = {};
  for (const item of alleItems) {
    (itemsPerDag[item.dag] ??= []).push(item);
  }

  // Sort items per day: hulp first (by tijdLabel), then activiteiten
  for (const dag of Object.keys(itemsPerDag)) {
    itemsPerDag[Number(dag)].sort((a, b) => {
      if (a.type !== b.type) return a.type === "hulp" ? -1 : 1;
      return (a.tijdLabel ?? "").localeCompare(b.tijdLabel ?? "");
    });
  }

  const prevMaand = maand === 0 ? { j: jaar - 1, m: 11 } : { j: jaar, m: maand - 1 };
  const nextMaand = maand === 11 ? { j: jaar + 1, m: 0 } : { j: jaar, m: maand + 1 };

  // Build cells (null = empty padding)
  const cells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: aantaldagen }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const geselecteerdeItems = geselecteerdeDag ? (itemsPerDag[geselecteerdeDag] ?? []) : [];

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/coordinator/agenda?m=${maandParam(prevMaand.j, prevMaand.m)}`}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors"
          onClick={() => setGeselecteerdeDag(null)}
        >
          <ChevronLeft size={18} className="text-neutral-500" />
        </Link>
        <h2 className="font-bold text-gray-900 text-base capitalize">
          {MAANDEN[maand]} {jaar}
        </h2>
        <Link
          href={`/coordinator/agenda?m=${maandParam(nextMaand.j, nextMaand.m)}`}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors"
          onClick={() => setGeselecteerdeDag(null)}
        >
          <ChevronRight size={18} className="text-neutral-500" />
        </Link>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7">
        {DAGHEADERS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-neutral-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((dag, i) => {
          if (dag === null) return <div key={`e-${i}`} />;

          const items = itemsPerDag[dag] ?? [];
          const heeftHulp = items.some((it) => it.type === "hulp");
          const heeftActiviteit = items.some((it) => it.type === "activiteit");
          const isVandaag =
            dag === vandaag.getDate() &&
            maand === vandaag.getMonth() &&
            jaar === vandaag.getFullYear();
          const isGeselecteerd = dag === geselecteerdeDag;

          return (
            <button
              key={dag}
              onClick={() => setGeselecteerdeDag(isGeselecteerd ? null : dag)}
              className={[
                "relative flex flex-col items-center justify-start pt-1.5 pb-2 rounded-xl text-sm font-medium transition-all min-h-[52px]",
                isGeselecteerd
                  ? "bg-amber-500 text-white shadow-sm"
                  : isVandaag
                  ? "bg-amber-50 text-amber-700 ring-2 ring-amber-300"
                  : "hover:bg-neutral-50 text-gray-700",
              ].join(" ")}
            >
              <span className="text-sm font-semibold leading-none">{dag}</span>
              {(heeftHulp || heeftActiviteit) && (
                <div className="flex gap-0.5 mt-1.5">
                  {heeftActiviteit && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isGeselecteerd ? "bg-white/80" : "bg-emerald-500"
                      }`}
                    />
                  )}
                  {heeftHulp && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isGeselecteerd ? "bg-white/80" : "bg-amber-500"
                      }`}
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          Activiteit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
          Hulp gevraagd
        </span>
      </div>

      {/* Selected day detail */}
      {geselecteerdeDag !== null && (
        <div className="space-y-2 pt-1">
          <h3 className="font-semibold text-gray-900 text-sm">
            {geselecteerdeDag} {MAANDEN[maand]}
          </h3>
          {geselecteerdeItems.length === 0 ? (
            <div className="flex items-center gap-3 bg-neutral-50 rounded-2xl p-4 text-sm text-neutral-400">
              <CalendarDays size={16} />
              Niets gepland op deze dag
            </div>
          ) : (
            <div className="space-y-2">
              {geselecteerdeItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-neutral-100 p-3.5 hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-1.5 h-10 rounded-full flex-shrink-0 ${
                      item.type === "hulp" ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.titel}</p>
                    {item.subtitel && (
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">{item.subtitel}</p>
                    )}
                  </div>
                  {item.tijdLabel && (
                    <span className="text-xs text-neutral-400 flex-shrink-0 font-medium">
                      {item.tijdLabel}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
