"use client";

import { useState, useTransition } from "react";
import { meldWervingsinteresse } from "@/lib/actions/werving";
import { CheckCircle2, Handshake, ChevronRight, ChevronLeft } from "lucide-react";

// Beschikbaarheid opties
const BESCHIKBAARHEID_OPTIES = [
  { value: "weekend", label: "Weekend" },
  { value: "weekdagen", label: "Weekdagen" },
  { value: "avonden", label: "Avonden" },
  { value: "flexibel", label: "Flexibel" },
];

// VOG status opties
const VOG_OPTIES = [
  { value: "heeft", label: "Ik heb een geldige VOG" },
  { value: "aanvraag_lopen", label: "VOG wordt aangevraagd" },
  { value: "niet_nodig", label: "Niet nodig voor deze activiteiten" },
];

export default function HelpMeeForm() {
  const [stap, setStap] = useState(1);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    beschikbaarheid: "",
    ervaring: "",
    motivatie: "",
    vogStatus: "niet_nodig",
    bericht: "",
  });

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (stap < 4) setStap(stap + 1);
  }

  function handleBack() {
    if (stap > 1) setStap(stap - 1);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await meldWervingsinteresse(
          formData.beschikbaarheid,
          formData.ervaring,
          formData.motivatie,
          formData.vogStatus,
          formData.bericht
        );
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
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100">
      {/* Progress indicator */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-3">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= stap ? "bg-amber-500" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-neutral-500 font-medium">
          Stap {stap} van 4
        </p>
      </div>

      <form onSubmit={stap === 4 ? handleSubmit : handleNext} className="px-5 pb-5 space-y-4">
        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-xl p-3 border border-red-100">{error}</p>
        )}

        {/* Stap 1: Beschikbaarheid */}
        {stap === 1 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Wanneer ben je beschikbaar?</h3>
            <p className="text-sm text-neutral-500">
              Dit helpt ons bij het matchen met activiteiten.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {BESCHIKBAARHEID_OPTIES.map((optie) => (
                <button
                  key={optie.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, beschikbaarheid: optie.value })}
                  className={`p-3 rounded-xl text-sm font-medium border transition-all ${
                    formData.beschikbaarheid === optie.value
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-neutral-50 text-gray-700 border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  {optie.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stap 2: Ervaring */}
        {stap === 2 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Heb je ervaring?</h3>
            <p className="text-sm text-neutral-500">
              Deel kort je eerdere vrijwilligers- of zorgwerk.
            </p>
            <textarea
              value={formData.ervaring}
              onChange={(e) => setFormData({ ...formData, ervaring: e.target.value })}
              rows={4}
              placeholder="Bijv. Ik heb ervaring met het begeleiden van mensen met dementia..."
              className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50 resize-none"
            />
          </div>
        )}

        {/* Stap 3: Motivatie */}
        {stap === 3 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Waarom wil je helpen?</h3>
            <p className="text-sm text-neutral-500">
              Wat drijft je in het vrijwilligerswerk?
            </p>
            <textarea
              value={formData.motivatie}
              onChange={(e) => setFormData({ ...formData, motivatie: e.target.value })}
              rows={4}
              placeholder="Bijv. Ik vind het mooi om anderen een steentje te kunnen helpen..."
              className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50 resize-none"
            />
          </div>
        )}

        {/* Stap 4: VOG + optioneel bericht */}
        {stap === 4 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Toestemming en afsluiting</h3>
            
            {/* VOG status */}
            <div>
              <p className="text-sm text-neutral-500 mb-2">Voor sommige activiteiten is een VOG vereist. Wat is jouw situatie?</p>
              <div className="space-y-2">
                {VOG_OPTIES.map((optie) => (
                  <label
                    key={optie.value}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="vogStatus"
                      value={optie.value}
                      checked={formData.vogStatus === optie.value}
                      onChange={(e) => setFormData({ ...formData, vogStatus: e.target.value })}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">{optie.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optioneel bericht */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                Extra bericht
                <span className="text-neutral-300 font-normal normal-case"> (optioneel)</span>
              </label>
              <textarea
                value={formData.bericht}
                onChange={(e) => setFormData({ ...formData, bericht: e.target.value })}
                rows={3}
                placeholder="Nog iets dat we moeten weten?"
                className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50 resize-none"
              />
            </div>
          </div>
        )}

        {/* Navigatie knoppen */}
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
          {stap > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <ChevronLeft size={14} />
              Terug
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || (stap === 1 && !formData.beschikbaarheid)}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
          >
            {isPending ? (
              "Versturen..."
            ) : stap < 4 ? (
              <>
                Volgende
                <ChevronRight size={14} />
              </>
            ) : (
              <>
                <Handshake size={16} />
                Aanmelden
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
