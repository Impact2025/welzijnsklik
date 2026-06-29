"use client";

import { useState, useTransition } from "react";
import { reageerOpHulp, trekReactieIn } from "@/lib/actions/hulp-gevraagd";
import { HandHeart, Loader2, CheckCircle2, X } from "lucide-react";

interface Props {
  hulpId: string;
  heeftGereageerd: boolean;
  reactieBericht?: string | null;
  reactieStatus?: string;
  isOpen: boolean;
}

export default function AanmeldKnop({ hulpId, heeftGereageerd, reactieBericht, reactieStatus, isOpen }: Props) {
  const [isPending, startTransition] = useTransition();
  const [bericht, setBericht] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (heeftGereageerd) {
    const isBevestigd = reactieStatus === "bevestigd";
    return (
      <div className="space-y-2">
        <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${isBevestigd ? "bg-emerald-50 border border-emerald-100" : "bg-sky-50 border border-sky-100"}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className={isBevestigd ? "text-emerald-600" : "text-sky-500"} />
            <span className={`text-sm font-semibold ${isBevestigd ? "text-emerald-700" : "text-sky-700"}`}>
              {isBevestigd ? "Jij bent bevestigd!" : "Je bent aangemeld"}
            </span>
          </div>
          {!isBevestigd && isOpen && (
            <button
              disabled={isPending}
              onClick={() => {
                setError(null);
                startTransition(() => trekReactieIn(hulpId).catch((e) => setError(e.message)));
              }}
              className="text-xs text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-60 flex items-center gap-1"
            >
              <X size={12} />
              Intrekken
            </button>
          )}
        </div>
        {reactieBericht && (
          <p className="text-xs text-neutral-500 italic px-1">&ldquo;{reactieBericht}&rdquo;</p>
        )}
        {error && <p className="text-xs text-red-500 px-1">{error}</p>}
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-3">
        <span className="text-sm text-neutral-400 font-medium">Niet meer beschikbaar</span>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-3">
        <textarea
          value={bericht}
          onChange={(e) => setBericht(e.target.value)}
          placeholder="Optioneel: laat een berichtje achter voor de coördinator…"
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button
            disabled={isPending}
            onClick={() => {
              setError(null);
              startTransition(() =>
                reageerOpHulp(hulpId, bericht).catch((e) => {
                  setError(e instanceof Error ? e.message : "Er ging iets mis");
                })
              );
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <HandHeart size={15} />}
            {isPending ? "Aanmelden…" : "Aanmelden"}
          </button>
          <button
            disabled={isPending}
            onClick={() => setShowForm(false)}
            className="px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-sm font-medium transition-colors disabled:opacity-60"
          >
            Annuleren
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm transition-colors"
    >
      <HandHeart size={16} />
      Ik doe mee!
    </button>
  );
}
