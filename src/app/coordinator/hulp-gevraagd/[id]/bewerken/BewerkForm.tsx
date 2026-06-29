"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { bewerkHulpGevraagd, verwijderHulpGevraagd } from "@/lib/actions/hulp-gevraagd";
import { Camera, X, Loader2, CheckCircle2, Trash2, AlertTriangle } from "lucide-react";

interface Props {
  id: string;
  initieel: {
    titel: string;
    omschrijving: string;
    datum: string;   // "YYYY-MM-DD"
    tijd: string;    // "HH:MM"
    eindtijd: string; // "HH:MM"
    aantalNodig: number;
    fotoUrl: string | null;
  };
}

export default function BewerkForm({ id, initieel }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bevestigVerwijder, setBevestigVerwijder] = useState(false);

  const [fotoDataUrl, setFotoDataUrl] = useState<string | null>(initieel.fotoUrl);
  const [fotoUrl, setFotoUrl] = useState<string | null>(initieel.fotoUrl);
  const [fotoUploading, setFotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => setFotoDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
    setFotoUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/upload-hulp-foto", {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Foto uploaden mislukt");
        setFotoDataUrl(initieel.fotoUrl);
        return;
      }
      const data = await res.json();
      setFotoUrl(data.url);
    } catch {
      setError("Foto uploaden mislukt. Probeer opnieuw.");
      setFotoDataUrl(initieel.fotoUrl);
    } finally {
      setFotoUploading(false);
    }
  }

  function verwijderFoto() {
    setFotoDataUrl(null);
    setFotoUrl(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    if (fotoUrl) data.set("fotoUrl", fotoUrl);
    else data.delete("fotoUrl");

    startTransition(async () => {
      try {
        await bewerkHulpGevraagd(id, data);
        setSuccess(true);
        setTimeout(() => router.push(`/coordinator/hulp-gevraagd/${id}`), 1200);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Er ging iets mis");
      }
    });
  }

  function handleVerwijder() {
    startDelete(async () => {
      try {
        await verwijderHulpGevraagd(id);
        router.push("/coordinator/hulp-gevraagd");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verwijderen mislukt");
        setBevestigVerwijder(false);
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Foto */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Foto</label>
        {fotoDataUrl ? (
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100">
            <img src={fotoDataUrl} alt="" className="w-full h-full object-cover" />
            {fotoUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 size={28} className="text-white animate-spin" />
              </div>
            )}
            {!fotoUploading && (
              <button
                type="button"
                onClick={verwijderFoto}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-neutral-200 hover:border-amber-300 hover:bg-amber-50 transition-colors flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-amber-500"
          >
            <Camera size={28} />
            <span className="text-sm font-medium">Foto toevoegen</span>
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
      </div>

      {/* Titel */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="titel">
          Titel <span className="text-red-400">*</span>
        </label>
        <input
          id="titel" name="titel" type="text" required maxLength={100}
          defaultValue={initieel.titel}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
      </div>

      {/* Omschrijving */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="omschrijving">
          Omschrijving <span className="text-red-400">*</span>
        </label>
        <textarea
          id="omschrijving" name="omschrijving" required rows={4} maxLength={1000}
          defaultValue={initieel.omschrijving}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
        />
      </div>

      {/* Datum, Starttijd, Eindtijd */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3 sm:col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="datum">
            Datum <span className="text-red-400">*</span>
          </label>
          <input
            id="datum" name="datum" type="date" required min={today}
            defaultValue={initieel.datum}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="tijd">
            Starttijd <span className="text-red-400">*</span>
          </label>
          <input
            id="tijd" name="tijd" type="time" required
            defaultValue={initieel.tijd}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="eindtijd">
            Eindtijd <span className="text-red-400">*</span>
          </label>
          <input
            id="eindtijd" name="eindtijd" type="time" required
            defaultValue={initieel.eindtijd}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Aantal nodig */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Hoeveel vrijwilligers nodig? <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <label key={n} className="flex-1 cursor-pointer">
              <input
                type="radio" name="aantalNodig" value={String(n)}
                defaultChecked={n === initieel.aantalNodig}
                className="sr-only peer"
              />
              <div className="rounded-xl border border-neutral-200 bg-white py-2.5 text-sm text-center font-bold text-neutral-600 peer-checked:border-amber-400 peer-checked:bg-amber-50 peer-checked:text-amber-700 transition-colors">
                {n}
              </div>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || fotoUploading}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
        {isPending ? "Opslaan…" : "Wijzigingen opslaan"}
      </button>

      {/* Verwijderen */}
      <div className="pt-2 border-t border-neutral-100">
        {!bevestigVerwijder ? (
          <button
            type="button"
            onClick={() => setBevestigVerwijder(true)}
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 font-semibold py-3 rounded-2xl text-sm transition-colors"
          >
            <Trash2 size={15} />
            Oproep verwijderen
          </button>
        ) : (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">
                Weet je het zeker? De oproep én alle aanmeldingen worden permanent verwijderd.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleVerwijder}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {isDeleting ? "Verwijderen…" : "Ja, verwijderen"}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setBevestigVerwijder(false)}
                className="flex-1 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                Annuleren
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
