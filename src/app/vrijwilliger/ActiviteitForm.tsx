"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logActiviteit } from "@/lib/actions/activiteiten";
import {
  CheckCircle2,
  Mic,
  StopCircle,
} from "lucide-react";
import { ACTIVITEIT_TYPES, DUUR_OPTIES } from "@/lib/activiteit";
import PhotoCaptureField from "@/components/PhotoCaptureField";

interface Bewoner {
  id: string;
  naam: string;
  toestemmingFotos: boolean;
}

export default function ActiviteitForm({ bewoners }: { bewoners: Bewoner[] }) {
  const router = useRouter();
  const [bewonerId, setBewonerId] = useState("");
  const [type, setType] = useState("");
  const [duur, setDuur] = useState("30");
  const [notities, setNotities] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRecording, setIsRecording] = useState(false);
  const [fotoUploading, setFotoUploading] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const gekozenBewoner = bewoners.find((b) => b.id === bewonerId);
  const magFoto = gekozenBewoner?.toestemmingFotos === true;

  // ─── Spraak-naar-tekst ───────────────────────────────────────────
  function startSpraakHerkenning() {
    const w = window as unknown as Record<string, unknown>;
    const SpeechRecognitionCtor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as (new () => {
      start: () => void;
      stop: () => void;
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      maxAlternatives: number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onresult: ((event: any) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
    }) | undefined;

    if (!SpeechRecognitionCtor) {
      setError("Spraakherkenning wordt niet ondersteund in deze browser. Gebruik Chrome, Edge of Safari.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "nl-NL";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setNotities((prev) => (prev + " " + transcript).trim());
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setError("Spraakherkenning mislukt. Probeer opnieuw.");
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition as { stop: () => void };
    recognition.start();
    setIsRecording(true);
  }

  function stopSpraakHerkenning() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!bewonerId || !type || !duur) {
      setError("Vul alle verplichte velden in.");
      return;
    }

    const formData = new FormData();
    formData.set("bewonerId", bewonerId);
    formData.set("type", type);
    formData.set("duurMinuten", duur);
    if (notities) formData.set("notities", notities);
    if (fotoUrl) formData.set("fotoUrl", fotoUrl);

    startTransition(async () => {
      try {
        await logActiviteit(formData);
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Activiteit opslaan mislukt");
      }
    });
  }

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => router.push("/vrijwilliger"), 2000);
    return () => clearTimeout(t);
  }, [success, router]);

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-2xl">
          <CheckCircle2 size={28} className="text-emerald-600" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-lg">Bedankt!</p>
          <p className="text-neutral-500 text-sm mt-1">De activiteit is vastgelegd. Je wordt teruggestuurd naar het dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl p-3.5">
          {error}
        </div>
      )}

      {/* Bewoner */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 space-y-2">
        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest">
          Bewoner <span className="text-red-400">*</span>
        </label>
        <select
          value={bewonerId}
          onChange={(e) => setBewonerId(e.target.value)}
          required
          className="w-full border border-neutral-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50 font-medium text-gray-800"
        >
          <option value="">Kies een bewoner…</option>
          {bewoners.map((b) => (
            <option key={b.id} value={b.id}>{b.naam}</option>
          ))}
        </select>
      </div>

      {/* Type */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 space-y-3">
        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest">
          Activiteit <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ACTIVITEIT_TYPES.map((t) => {
            const Icon = t.icon;
            const isActive = type === t.label;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setType(t.label)}
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

      {/* Duur */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 space-y-3">
        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest">
          Duur <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DUUR_OPTIES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setDuur(m)}
              className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                duur === m
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-amber-300"
              }`}
            >
              {parseInt(m) >= 60 ? `${parseInt(m) / 60}u` : `${m}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Notities */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 space-y-2">
        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest">
          Notities <span className="text-neutral-300 font-normal normal-case">(optioneel)</span>
        </label>
        <div className="relative">
          <textarea
            value={notities}
            onChange={(e) => setNotities(e.target.value)}
            rows={3}
            placeholder="Bijzonderheden, sfeer, opmerkingen..."
            className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50 resize-none"
          />
          <button
            type="button"
            onClick={isRecording ? stopSpraakHerkenning : startSpraakHerkenning}
            className={`absolute bottom-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
              isRecording
                ? "bg-red-500 text-white shadow-sm animate-pulse"
                : "text-neutral-400 hover:text-amber-600 hover:bg-amber-50"
            }`}
            aria-label={isRecording ? "Stop opname" : "Spreek in plaats van typen"}
            title={isRecording ? "Stop opname" : "Spreek in plaats van typen"}
          >
            {isRecording ? <StopCircle size={16} /> : <Mic size={16} />}
          </button>
        </div>
        {isRecording && (
          <div className="flex items-center gap-2 text-xs text-red-500 font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Aan het luisteren... spreek rustig in
          </div>
        )}
      </div>

      {/* Foto — alleen als toestemmingFotos = true */}
      {bewonerId && magFoto && (
        <PhotoCaptureField
          key={bewonerId}
          uploadUrl={`/api/upload-foto?bewonerId=${bewonerId}`}
          onUploaded={setFotoUrl}
          onUploadingChange={setFotoUploading}
          compact
        />
      )}

      <button
        type="submit"
        disabled={isPending || fotoUploading}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl text-sm transition-colors disabled:opacity-60 shadow-sm"
      >
        {isPending ? "Opslaan…" : fotoUploading ? "Foto uploaden…" : "Activiteit opslaan"}
      </button>
    </form>
  );
}
