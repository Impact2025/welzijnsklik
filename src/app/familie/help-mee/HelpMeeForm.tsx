"use client";

import { useState, useTransition } from "react";
import { meldWervingsinteresse } from "@/lib/actions/werving";

export default function HelpMeeForm() {
  const [bericht, setBericht] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await meldWervingsinteresse(bericht);
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Er is iets misgegaan.");
      }
    });
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 text-center space-y-2">
        <div className="text-4xl">🙌</div>
        <p className="font-semibold text-gray-800">Bedankt voor je aanmelding!</p>
        <p className="text-gray-500 text-sm">
          De coördinator neemt zo snel mogelijk contact met je op.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-md p-5 space-y-4"
    >
      {error && (
        <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</p>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bericht (optioneel)
        </label>
        <textarea
          value={bericht}
          onChange={(e) => setBericht(e.target.value)}
          rows={4}
          placeholder="Vertel ons wanneer je kunt, wat je leuk vindt om te doen, of stel een vraag…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-60"
      >
        {isPending ? "Versturen…" : "Aanmelden als samenzorg-vrijwilliger"}
      </button>
    </form>
  );
}
