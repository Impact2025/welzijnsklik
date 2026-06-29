"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, X, Save } from "lucide-react";
import { updateBewoner } from "@/lib/actions/bewoners";

interface Props {
  bewonerId: string;
  naam: string;
  kamer: string | null;
  geboortedatum: Date | null;
  notities: string | null;
}

export function BewonersEditForm({ bewonerId, naam, kamer, geboortedatum, notities }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultDatum = geboortedatum
    ? new Date(geboortedatum).toISOString().slice(0, 10)
    : "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateBewoner(formData);
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        <Pencil size={12} />
        Bewerken
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Bewoner bewerken</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="hidden" name="bewonerId" value={bewonerId} />

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
                  defaultValue={naam}
                  className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                  Kamer / appartement
                </label>
                <input
                  name="kamer"
                  defaultValue={kamer ?? ""}
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
                  defaultValue={defaultDatum}
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
                  defaultValue={notities ?? ""}
                  placeholder="bijv. houdt van katten, heeft moeite met horen links…"
                  className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                {isPending ? <Loader2 size={15} className="animate-spin" /> : <>
                  <Save size={15} />
                  Opslaan
                </>}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
