"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { updateVrijwilligerProfiel, updateGebruikerNaam } from "@/lib/actions/gebruikers";
import { ACTIVITEIT_TYPES } from "@/lib/activiteit";

interface Props {
  gebruikerId: string;
  naam: string;
  telefoon: string | null;
  voorkeurActiviteiten: string[];
  interneNotities: string | null;
}

export function ProfielForm({ gebruikerId, naam, telefoon, voorkeurActiviteiten, interneNotities }: Props) {
  const router = useRouter();
  const [gekozen, setGekozen] = useState<string[]>(voorkeurActiviteiten);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(label: string) {
    setGekozen((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    // voorkeur als meerdere waarden
    formData.delete("voorkeurActiviteiten");
    for (const v of gekozen) formData.append("voorkeurActiviteiten", v);

    startTransition(async () => {
      try {
        await updateGebruikerNaam(formData);
        await updateVrijwilligerProfiel(formData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="gebruikerId" value={gebruikerId} />

      {error && (
        <p className="text-red-600 text-xs bg-red-50 rounded-xl p-3 border border-red-100">{error}</p>
      )}

      {/* Naam + telefoon */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 text-[15px]">Gegevens</h3>
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
            Telefoonnummer
          </label>
          <input
            name="telefoon"
            type="tel"
            defaultValue={telefoon ?? ""}
            placeholder="06-12345678"
            className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
          />
        </div>
      </div>

      {/* Voorkeur activiteiten */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 text-[15px]">Wat doet hij/zij graag?</h3>
        <div className="flex flex-wrap gap-2">
          {ACTIVITEIT_TYPES.map((a) => {
            const actief = gekozen.includes(a.label);
            return (
              <button
                key={a.label}
                type="button"
                onClick={() => toggle(a.label)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  actief ? a.actief : a.btn
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interne notities */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 text-[15px]">Notities coördinator</h3>
        <textarea
          name="interneNotities"
          rows={4}
          defaultValue={interneNotities ?? ""}
          placeholder="Achtergrond, bijzonderheden, tips voor matching met bewoners…"
          className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50 resize-none"
        />
        <p className="text-xs text-neutral-400">Alleen zichtbaar voor coördinatoren.</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 size={15} className="animate-spin" />
        ) : success ? (
          "Opgeslagen!"
        ) : (
          <>
            <Save size={15} />
            Opslaan
          </>
        )}
      </button>
    </form>
  );
}
