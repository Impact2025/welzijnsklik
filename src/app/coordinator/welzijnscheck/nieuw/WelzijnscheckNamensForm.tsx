"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Smile, Meh, Frown, Send, CheckCircle2 } from "lucide-react";
import { vulWelzijnscheckNamensIn } from "@/lib/actions/welzijnscheck";
import { AANDACHTSPUNTEN, welzijnsInfo } from "@/lib/welzijnscheck";

const SCORE_KNOPPEN = [1, 2, 3, 4, 5];
const SCORE_ICOON = { 1: Frown, 2: Frown, 3: Meh, 4: Smile, 5: Smile } as const;

export default function WelzijnscheckNamensForm({
  vrijwilligers,
}: {
  vrijwilligers: { id: string; naam: string }[];
}) {
  const router = useRouter();
  const [vrijwilligerId, setVrijwilligerId] = useState(vrijwilligers[0]?.id ?? "");
  const [score, setScore] = useState<number | null>(null);
  const [notitie, setNotitie] = useState("");
  const [aandacht, setAandacht] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [fout, setFout] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);

  const info = score ? welzijnsInfo(score) : null;

  async function verstuur() {
    if (!vrijwilligerId) return setFout("Kies een vrijwilliger.");
    if (!score) return setFout("Kies eerst een score van 1 tot 5.");
    setFout(null);
    startTransition(async () => {
      try {
        await vulWelzijnscheckNamensIn(vrijwilligerId, {
          score,
          notitie: notitie || undefined,
          aandachtspunten: aandacht,
        });
        setSucces(true);
        setTimeout(() => router.push("/coordinator/welzijnscheck"), 900);
      } catch (e) {
        setFout(e instanceof Error ? e.message : "Er ging iets mis.");
      }
    });
  }

  function toggleAandacht(p: string) {
    setAandacht((cur) =>
      cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]
    );
  }

  if (succes) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 text-center">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={24} />
        </div>
        <h2 className="font-semibold text-gray-900">Check opgeslagen</h2>
        <p className="text-sm text-neutral-500 mt-1">Je gaat terug naar het overzicht…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
        <label className="font-semibold text-gray-900 mb-2 block">Vrijwilliger</label>
        <select
          value={vrijwilligerId}
          onChange={(e) => setVrijwilligerId(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-gray-800 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
        >
          {vrijwilligers.map((v) => (
            <option key={v.id} value={v.id}>
              {v.naam}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
        <p className="font-semibold text-gray-900 mb-3">
          Score <span className="text-neutral-400 font-normal">(1–5)</span>
        </p>
        <div className="grid grid-cols-5 gap-2">
          {SCORE_KNOPPEN.map((s) => {
            const Icon = SCORE_ICOON[s as 1 | 2 | 3 | 4 | 5];
            const actief = score === s;
            const i = welzijnsInfo(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => setScore(s)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                  actief
                    ? `${i.chipBg} border-current ${i.chipText}`
                    : "bg-neutral-50 border-neutral-200 text-neutral-400 hover:border-neutral-300"
                }`}
              >
                <Icon size={22} strokeWidth={actief ? 2.4 : 1.8} />
                <span className="text-sm font-bold">{s}</span>
              </button>
            );
          })}
        </div>
        {info && (
          <div className={`mt-3 text-sm font-medium ${info.chipText}`}>
            {info.label} — {info.kort}
          </div>
        )}
      </div>

      {score !== null && score <= 3 && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
          <p className="font-semibold text-gray-900 mb-3">
            Waar loopt het tegen? <span className="text-neutral-400 font-normal">(optioneel)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {AANDACHTSPUNTEN.map((p) => {
              const actief = aandacht.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggleAandacht(p)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    actief
                      ? "bg-brand-50 border-brand-200 text-brand-700 font-medium"
                      : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
        <label className="font-semibold text-gray-900 mb-2 block">
          Notitie <span className="text-neutral-400 font-normal">(optioneel)</span>
        </label>
        <textarea
          value={notitie}
          onChange={(e) => setNotitie(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Korte observatie van de coördinator…"
          className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-gray-800 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none resize-none"
        />
      </div>

      {fout && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{fout}</p>
      )}

      <button
        onClick={verstuur}
        disabled={pending || score === null || !vrijwilligerId}
        className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {pending ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Send size={16} />
        )}
        Check opslaan
      </button>
    </div>
  );
}
