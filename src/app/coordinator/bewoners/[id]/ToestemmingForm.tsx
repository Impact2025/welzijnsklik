"use client";

import { useState, useTransition } from "react";
import { updateToestemming } from "@/lib/actions/bewoners";
import { CheckCircle2 } from "lucide-react";

interface Props {
  bewonerId: string;
  toestemmingFotos: boolean;
  toestemmingDoor: string;
  toestemmingDatum: string | null;
}

export default function ToestemmingForm({
  bewonerId,
  toestemmingFotos,
  toestemmingDoor,
  toestemmingDatum,
}: Props) {
  const [toestemming, setToestemming] = useState(toestemmingFotos);
  const [door, setDoor] = useState(toestemmingDoor);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (toestemming && !door.trim()) return;
    startTransition(async () => {
      await updateToestemming(bewonerId, toestemming, door);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => {
            setToestemming(!toestemming);
            if (toestemming) setDoor("");
          }}
          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
            toestemming ? "bg-emerald-500" : "bg-neutral-200"
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
              toestemming ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>
        <span className="text-sm font-medium text-gray-800">
          Toestemming voor foto&apos;s bij activiteiten
        </span>
      </label>

      {toestemming && (
        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
            Toestemming gegeven door
          </label>
          <input
            type="text"
            value={door}
            onChange={(e) => setDoor(e.target.value)}
            required={toestemming}
            placeholder="bijv. Maria Jansen (dochter)"
            className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
          />
        </div>
      )}

      {toestemmingDatum && (
        <p className="text-xs text-neutral-400">
          Vastgelegd op{" "}
          {new Date(toestemmingDatum).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {toestemmingDoor ? ` door ${toestemmingDoor}` : ""}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {isPending ? "Opslaan…" : "Opslaan"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
            <CheckCircle2 size={15} />
            Opgeslagen
          </span>
        )}
      </div>
    </form>
  );
}
