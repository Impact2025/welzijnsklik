"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { maakGeplandeActiviteit } from "@/lib/actions/activiteiten-agenda";
import { ACTIVITEIT_TYPES } from "@/lib/activiteit";
import { Loader2, CheckCircle2, HandHeart, Link2, MapPin } from "lucide-react";

interface HulpOptie {
  id: string;
  titel: string;
  datum: Date;
  aantalNodig: number;
}

export default function ActiviteitForm({ hulpOpties }: { hulpOpties: HulpOptie[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState("");
  const [hulpGevraagdId, setHulpGevraagdId] = useState("");

  // Today in YYYY-MM-DD for min date
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    if (type) data.set("type", type);
    if (hulpGevraagdId) data.set("hulpGevraagdId", hulpGevraagdId);
    else data.delete("hulpGevraagdId");

    startTransition(async () => {
      try {
        await maakGeplandeActiviteit(data);
        setSuccess(true);
        setTimeout(() => router.push("/coordinator/activiteiten"), 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Er ging iets mis");
      }
    });
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <p className="font-bold text-gray-900 text-lg">Gepland!</p>
        <p className="text-neutral-500 text-sm">De activiteit staat in de agenda.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Titel */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="titel">
          Titel <span className="text-red-400">*</span>
        </label>
        <input
          id="titel"
          name="titel"
          type="text"
          required
          maxLength={120}
          placeholder="bijv. Wandeling in het park"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Soort activiteit</label>
        <div className="grid grid-cols-2 gap-2">
          {ACTIVITEIT_TYPES.map((t) => {
            const Icon = t.icon;
            const isActive = type === t.label;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setType(isActive ? "" : t.label)}
                className={`flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                  isActive ? t.actief : `${t.bg} ${t.kleur} hover:opacity-80`
                }`}
              >
                <Icon size={15} strokeWidth={1.8} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Beschrijving */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="beschrijving">
          Beschrijving <span className="text-neutral-400 font-normal">(optioneel)</span>
        </label>
        <textarea
          id="beschrijving"
          name="beschrijving"
          rows={3}
          maxLength={1000}
          placeholder="Wat gaan we doen?"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
        />
      </div>

      {/* Locatie */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="locatie">
          Locatie <span className="text-neutral-400 font-normal">(optioneel)</span>
        </label>
        <div className="relative">
          <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            id="locatie"
            name="locatie"
            type="text"
            maxLength={120}
            placeholder="bijv. Tuin / Gemeenschapsruimte"
            className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 py-3 text-sm text-gray-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Datum, Starttijd, Eindtijd */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3 sm:col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="datum">
            Datum <span className="text-red-400">*</span>
          </label>
          <input
            id="datum"
            name="datum"
            type="date"
            required
            min={today}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="tijd">
            Starttijd <span className="text-red-400">*</span>
          </label>
          <input
            id="tijd"
            name="tijd"
            type="time"
            required
            defaultValue="14:00"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="eindtijd">
            Eindtijd
          </label>
          <input
            id="eindtijd"
            name="eindtijd"
            type="time"
            defaultValue="15:00"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Hulp koppelen */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <HandHeart size={14} className="text-amber-500" />
          Hulpvraag koppelen <span className="text-neutral-400 font-normal">(optioneel)</span>
        </label>
        {hulpOpties.length === 0 ? (
          <p className="text-xs text-neutral-400 bg-neutral-50 rounded-xl px-3 py-2.5">
            Er zijn geen open hulpvragen zonder activiteit. Maak eerst een hulpvraag aan.
          </p>
        ) : (
          <select
            value={hulpGevraagdId}
            onChange={(e) => setHulpGevraagdId(e.target.value)}
            className="w-full border border-neutral-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
          >
            <option value="">Geen — alleen activiteit</option>
            {hulpOpties.map((h) => (
              <option key={h.id} value={h.id}>
                {h.titel} ({new Date(h.datum).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })})
              </option>
            ))}
          </select>
        )}
        {hulpGevraagdId && (
          <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
            <Link2 size={12} />
            Deze activiteit verschijnt ook bij de hulpvraag voor vrijwilligers en familieleden.
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
        {isPending ? "Plannen…" : "Activiteit plannen"}
      </button>
    </form>
  );
}
