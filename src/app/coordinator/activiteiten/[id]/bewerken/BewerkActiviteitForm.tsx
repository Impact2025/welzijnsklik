"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bewerkGeplandeActiviteit } from "@/lib/actions/activiteiten-agenda";
import { ACTIVITEIT_TYPES } from "@/lib/activiteit";
import { Loader2, CheckCircle2 } from "lucide-react";

interface HulpOptie {
  id: string;
  titel: string;
}
interface Bestaande {
  id: string;
  titel: string;
  type: string | null;
  beschrijving: string | null;
  locatie: string | null;
  datum: Date;
  duurMinuten: number;
  hulpGevraagdId: string | null;
}

function toDateInput(d: Date) {
  return d.toISOString().split("T")[0];
}
function toTimeInput(d: Date) {
  return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function BewerkActiviteitForm({
  bestaande,
  hulpOpties,
}: {
  bestaande: Bestaande;
  hulpOpties: HulpOptie[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState(bestaande.type ?? "");
  const [hulpGevraagdId, setHulpGevraagdId] = useState(bestaande.hulpGevraagdId ?? "");

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
        await bewerkGeplandeActiviteit(bestaande.id, data);
        setSuccess(true);
        setTimeout(() => router.push(`/coordinator/activiteiten/${bestaande.id}`), 1200);
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
        <p className="font-bold text-gray-900 text-lg">Opgeslagen!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="titel">Titel *</label>
        <input id="titel" name="titel" type="text" required defaultValue={bestaande.titel} maxLength={120}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Soort activiteit</label>
        <div className="grid grid-cols-2 gap-2">
          {ACTIVITEIT_TYPES.map((t) => {
            const Icon = t.icon;
            const isActive = type === t.label;
            return (
              <button key={t.label} type="button" onClick={() => setType(isActive ? "" : t.label)}
                className={`flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${isActive ? t.actief : `${t.bg} ${t.kleur} hover:opacity-80`}`}>
                <Icon size={15} strokeWidth={1.8} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="beschrijving">Beschrijving</label>
        <textarea id="beschrijving" name="beschrijving" rows={3} maxLength={1000} defaultValue={bestaande.beschrijving ?? ""}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="locatie">Locatie</label>
        <input id="locatie" name="locatie" type="text" maxLength={120} defaultValue={bestaande.locatie ?? ""}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3 sm:col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="datum">Datum *</label>
          <input id="datum" name="datum" type="date" required defaultValue={toDateInput(new Date(bestaande.datum))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="tijd">Starttijd *</label>
          <input id="tijd" name="tijd" type="time" required defaultValue={toTimeInput(new Date(bestaande.datum))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="eindtijd">Eindtijd</label>
          <input id="eindtijd" name="eindtijd" type="time" defaultValue={toTimeInput(new Date(new Date(bestaande.datum).getTime() + bestaande.duurMinuten * 60000))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hulpvraag koppelen</label>
        <select value={hulpGevraagdId} onChange={(e) => setHulpGevraagdId(e.target.value)}
          className="w-full border border-neutral-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50">
          <option value="">Geen — alleen activiteit</option>
          {hulpOpties.map((h) => (
            <option key={h.id} value={h.id}>{h.titel}</option>
          ))}
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

      <button type="submit" disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors">
        {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
        {isPending ? "Opslaan…" : "Wijzigingen opslaan"}
      </button>
    </form>
  );
}
