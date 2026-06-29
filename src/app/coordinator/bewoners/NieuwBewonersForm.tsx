"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, X } from "lucide-react";
import { maakBewoner } from "@/lib/actions/bewoners";

export function NieuwBewonersForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const id = await maakBewoner(formData);
        setOpen(false);
        router.push(`/coordinator/bewoners/${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors shadow-sm"
      >
        <UserPlus size={14} />
        Aanmaken
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Nieuwe bewoner</h2>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="text-red-600 text-xs bg-red-50 rounded-xl p-3 border border-red-100">{error}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
              Naam <span className="text-red-400">*</span>
            </label>
            <input
              name="naam"
              required
              placeholder="bijv. Grietje van den Berg"
              className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
              Kamer / appartement
            </label>
            <input
              name="kamer"
              placeholder="bijv. 14B"
              className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
              Geboortedatum
            </label>
            <input
              name="geboortedatum"
              type="date"
              className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
              Bijzonderheden voor vrijwilligers
            </label>
            <textarea
              name="notities"
              rows={3}
              placeholder="bijv. houdt van katten, heeft moeite met horen links, geniet van muziek uit de jaren 60…"
              className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <>
              <UserPlus size={15} />
              Aanmaken
            </>}
          </button>
        </form>
      </div>
    </div>
  );
}
