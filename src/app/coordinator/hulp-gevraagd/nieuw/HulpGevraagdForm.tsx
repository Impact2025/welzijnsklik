"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { maakHulpGevraagd } from "@/lib/actions/hulp-gevraagd";
import { Camera, X, Loader2, CheckCircle2, ChevronLeft } from "lucide-react";
import Link from "next/link";


export default function HulpGevraagdForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fotoDataUrl, setFotoDataUrl] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
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
        setFotoDataUrl(null);
        return;
      }
      const data = await res.json();
      setFotoUrl(data.url);
    } catch {
      setError("Foto uploaden mislukt. Probeer opnieuw.");
      setFotoDataUrl(null);
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

    startTransition(async () => {
      try {
        await maakHulpGevraagd(data);
        setSuccess(true);
        setTimeout(() => router.push("/coordinator/hulp-gevraagd"), 1500);
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
        <p className="font-bold text-gray-900 text-lg">Geplaatst!</p>
        <p className="text-neutral-500 text-sm">Vrijwilligers worden direct op de hoogte gesteld.</p>
      </div>
    );
  }

  // Today in YYYY-MM-DD for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Foto */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Foto (optioneel)</label>
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFotoChange}
          className="hidden"
        />
      </div>

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
          maxLength={100}
          placeholder="bijv. Hulp bij bingo-avond"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
      </div>

      {/* Omschrijving */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="omschrijving">
          Omschrijving <span className="text-red-400">*</span>
        </label>
        <textarea
          id="omschrijving"
          name="omschrijving"
          required
          rows={4}
          maxLength={1000}
          placeholder="Wat gaan we doen? Wat wordt er verwacht van de vrijwilliger?"
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
            Eindtijd <span className="text-red-400">*</span>
          </label>
          <input
            id="eindtijd"
            name="eindtijd"
            type="time"
            required
            defaultValue="15:00"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Eindtijd */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="eindtijd">
          Eindtijd <span className="text-red-400">*</span>
        </label>
        <input
          id="eindtijd"
          name="eindtijd"
          type="time"
          required
          defaultValue="15:00"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
      </div>

      {/* Aantal nodig */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="aantalNodig">
          Hoeveel vrijwilligers nodig? <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <label key={n} className="flex-1 cursor-pointer">
              <input type="radio" name="aantalNodig" value={String(n)} defaultChecked={n === 1} className="sr-only peer" />
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
        {isPending ? "Plaatsen…" : "Hulp gevraagd plaatsen"}
      </button>
    </form>
  );
}
