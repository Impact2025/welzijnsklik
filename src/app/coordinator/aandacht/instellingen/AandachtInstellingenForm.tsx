"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, RotateCcw, CheckCircle2 } from "lucide-react";
import { updateAandachtInstellingenAction } from "@/lib/actions/aandacht";
import type { AandachtInstellingen } from "@/lib/aandacht";

const STANDAARD: AandachtInstellingen = {
  recentDagen: 14,
  baselineDagen: 90,
  drempelRood: 0.5,
  drempelOranje: 0.7,
  minActiviteiten: 3,
};

function Veld({
  label,
  toelichting,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  toelichting: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 lg:p-5">
      <label className="font-semibold text-gray-900 text-sm block">{label}</label>
      <p className="text-xs text-neutral-500 mt-0.5 mb-3">{toelichting}</p>
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step ?? 1}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-28 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-gray-800 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
        />
        {suffix && <span className="text-sm text-neutral-400">{suffix}</span>}
      </div>
    </div>
  );
}

export function AandachtInstellingenForm({ instellingen }: { instellingen: AandachtInstellingen }) {
  const router = useRouter();
  const [waarden, setWaarden] = useState(instellingen);
  const [pending, startTransition] = useTransition();
  const [fout, setFout] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);

  function veld<K extends keyof AandachtInstellingen>(key: K) {
    return (v: number) => setWaarden((w) => ({ ...w, [key]: v }));
  }

  function opslaan() {
    setFout(null);
    setSucces(false);
    startTransition(async () => {
      try {
        await updateAandachtInstellingenAction(waarden);
        setSucces(true);
        router.refresh();
      } catch (e) {
        setFout(e instanceof Error ? e.message : "Er ging iets mis.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Veld
        label="Recent venster"
        toelichting="Over hoeveel dagen wordt het huidige aantal activiteiten geteld."
        value={waarden.recentDagen}
        onChange={veld("recentDagen")}
        min={1}
        max={90}
        suffix="dagen"
      />
      <Veld
        label="Baseline-periode"
        toelichting="Over hoeveel dagen wordt het eigen gemiddelde ritme van een bewoner bepaald."
        value={waarden.baselineDagen}
        onChange={veld("baselineDagen")}
        min={waarden.recentDagen}
        max={365}
        suffix="dagen"
      />
      <Veld
        label="Rode drempel"
        toelichting="Onder dit percentage van het eigen gemiddelde ritme geldt een bewoner als 'aandacht nodig'."
        value={waarden.drempelRood}
        onChange={veld("drempelRood")}
        min={0.05}
        max={0.95}
        step={0.05}
        suffix="× eigen gemiddelde"
      />
      <Veld
        label="Oranje drempel"
        toelichting="Onder dit percentage geldt een bewoner als 'let op' (maar nog niet rood)."
        value={waarden.drempelOranje}
        onChange={veld("drempelOranje")}
        min={0.1}
        max={0.99}
        step={0.05}
        suffix="× eigen gemiddelde"
      />
      <Veld
        label="Minimum activiteiten"
        toelichting="Hoeveel activiteiten een bewoner minimaal moet hebben voordat er een betrouwbaar eigen ritme berekend wordt. Daaronder telt de bewoner als 'nieuw'."
        value={waarden.minActiviteiten}
        onChange={veld("minActiviteiten")}
        min={1}
        max={20}
        suffix="activiteiten"
      />

      {fout && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{fout}</p>}
      {succes && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <CheckCircle2 size={16} />
          Instellingen opgeslagen.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={opslaan}
          disabled={pending}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {pending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Opslaan
        </button>
        <button
          onClick={() => setWaarden(STANDAARD)}
          disabled={pending}
          className="flex items-center gap-2 border border-neutral-200 text-neutral-600 font-medium px-4 py-3 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          <RotateCcw size={15} />
          Standaard
        </button>
      </div>
    </div>
  );
}
