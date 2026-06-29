"use client";

import { useState, useTransition } from "react";
import { updateToestemming } from "@/lib/actions/bewoners";

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
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={toestemming}
          onChange={(e) => {
            setToestemming(e.target.checked);
            if (!e.target.checked) setDoor("");
          }}
          className="w-4 h-4 accent-amber-600"
        />
        <span className="text-sm text-gray-700">
          Toestemming voor foto&apos;s bij activiteiten
        </span>
      </label>

      {toestemming && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Toestemming gegeven door (naam wettelijk vertegenwoordiger of familielid)
          </label>
          <input
            type="text"
            value={door}
            onChange={(e) => setDoor(e.target.value)}
            required={toestemming}
            placeholder="bijv. Maria Jansen (dochter)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}

      {toestemmingDatum && (
        <p className="text-xs text-gray-400">
          Vastgelegd op{" "}
          {new Date(toestemmingDatum).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {toestemmingDoor ? ` door ${toestemmingDoor}` : ""}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
      >
        {isPending ? "Opslaan…" : "Opslaan"}
      </button>
      {saved && (
        <span className="text-green-600 text-sm ml-3">Opgeslagen ✓</span>
      )}
    </form>
  );
}
