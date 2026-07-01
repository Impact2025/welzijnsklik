"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Calendar, Shield, Heart } from "lucide-react";
import { updateVrijwilligerProfiel, updateGebruikerNaam } from "@/lib/actions/gebruikers";
import { ACTIVITEIT_TYPES } from "@/lib/activiteit";

// Beschikbaarheid opties
const BESCHIKBAARHEID_OPTIES = [
  { value: "weekend", label: "Weekend" },
  { value: "weekdagen", label: "Weekdagen" },
  { value: "avonden", label: "Avonden" },
  { value: "flexibel", label: "Flexibel" },
];

// VOG status opties
const VOG_OPTIES = [
  { value: "heeft", label: "Heeft VOG" },
  { value: "aanvraag_lopen", label: "VOG in aanvraag" },
  { value: "niet_nodig", label: "Niet nodig" },
];

interface Props {
  gebruikerId: string;
  naam: string;
  telefoon: string | null;
  voorkeurActiviteiten: string[];
  interneNotities: string | null;
  beschikbaarheid?: string | null;
  vogStatus?: string | null;
  ervaring?: string | null;
  motivatie?: string | null;
}

export function ProfielForm({ 
  gebruikerId, 
  naam, 
  telefoon, 
  voorkeurActiviteiten, 
  interneNotities,
  beschikbaarheid: initBeschikbaarheid,
  vogStatus: initVogStatus,
  ervaring: initErvaring,
  motivatie: initMotivatie,
}: Props) {
  const router = useRouter();
  const [gekozen, setGekozen] = useState<string[]>(voorkeurActiviteiten);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Intake state
  const [beschikbaarheid, setBeschikbaarheid] = useState(initBeschikbaarheid ?? "");
  const [vogStatus, setVogStatus] = useState(initVogStatus ?? "niet_nodig");

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
    
    // Intake velden toevoegen
    formData.set("beschikbaarheid", beschikbaarheid);
    formData.set("vogStatus", vogStatus);

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

      {/* Beschikbaarheid */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 text-[15px] flex items-center gap-1.5">
          <Calendar size={15} />
          Beschikbaarheid
        </h3>
        <select
          value={beschikbaarheid}
          onChange={(e) => setBeschikbaarheid(e.target.value)}
          name="beschikbaarheid"
          className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
        >
          <option value="">Selecteer…</option>
          {BESCHIKBAARHEID_OPTIES.map((optie) => (
            <option key={optie.value} value={optie.value}>{optie.label}</option>
          ))}
        </select>
      </div>

      {/* VOG status */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 text-[15px] flex items-center gap-1.5">
          <Shield size={15} />
          VOG-status
        </h3>
        <select
          value={vogStatus}
          onChange={(e) => setVogStatus(e.target.value)}
          name="vogStatus"
          className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
        >
          {VOG_OPTIES.map((optie) => (
            <option key={optie.value} value={optie.value}>{optie.label}</option>
          ))}
        </select>
      </div>

      {/* Ervaring */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 text-[15px] flex items-center gap-1.5">
          <Heart size={15} />
          Ervaring
        </h3>
        <textarea
          name="ervaring"
          rows={3}
          defaultValue={initErvaring ?? ""}
          placeholder="Eerdere vrijwilligers- of zorgervaring…"
          className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50 resize-none"
        />
      </div>

      {/* Motivatie */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 text-[15px] flex items-center gap-1.5">
          <Heart size={15} />
          Motivatie
        </h3>
        <textarea
          name="motivatie"
          rows={3}
          defaultValue={initMotivatie ?? ""}
          placeholder="Waarom wil deze persoon vrijwilligerswerk doen?"
          className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50 resize-none"
        />
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