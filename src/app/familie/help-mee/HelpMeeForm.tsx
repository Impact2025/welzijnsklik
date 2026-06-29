"use client";

import { useState, useTransition } from "react";
import { meldWervingsinteresse } from "@/lib/actions/werving";
import { CheckCircle2, Handshake } from "lucide-react";

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
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-2xl">
          <CheckCircle2 size={28} className="text-emerald-600" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-lg">Bedankt!</p>
          <p className="text-neutral-500 text-sm mt-1">
            De coördinator neemt zo snel mogelijk contact met je op.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-4">
      {error && (
        <p className="text-red-600 text-sm bg-red-50 rounded-xl p-3 border border-red-100">{error}</p>
      )}
      <div>
        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">
          Bericht <span className="text-neutral-300 font-normal normal-case">(optioneel)</span>
        </label>
        <textarea
          value={bericht}
          onChange={(e) => setBericht(e.target.value)}
          rows={4}
          placeholder="Vertel ons wanneer je kunt, wat je leuk vindt om te doen, of stel een vraag…"
          className="w-full border border-neutral-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl text-sm transition-colors disabled:opacity-60"
      >
        <Handshake size={16} />
        {isPending ? "Versturen…" : "Aanmelden als vrijwilliger"}
      </button>
    </form>
  );
}
