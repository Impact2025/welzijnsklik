"use client";

import { useRef, useState, useTransition } from "react";
import { logActiviteit } from "@/lib/actions/activiteiten";
import {
  Camera,
  CheckCircle2,
  X,
} from "lucide-react";
import { ACTIVITEIT_TYPES, DUUR_OPTIES } from "@/lib/activiteit";

interface Bewoner {
  id: string;
  naam: string;
  toestemmingFotos: boolean;
}

export default function ActiviteitForm({ bewoners }: { bewoners: Bewoner[] }) {
  const [bewonerId, setBewonerId] = useState("");
  const [type, setType] = useState("");
  const [duur, setDuur] = useState("30");
  const [notities, setNotities] = useState("");
  const [fotoDataUrl, setFotoDataUrl] = useState<string | null>(null);
  const [cameraActief, setCameraActief] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const gekozenBewoner = bewoners.find((b) => b.id === bewonerId);
  const magFoto = gekozenBewoner?.toestemmingFotos === true;

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActief(true);
    } catch {
      setError("Camera kon niet worden gestart. Controleer je browserrechten.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActief(false);
  }

  function maakFoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setFotoDataUrl(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
  }

  async function uploadFoto(blob: Blob): Promise<string> {
    const res = await fetch(`/api/upload-foto?bewonerId=${bewonerId}`, {
      method: "POST",
      headers: { "Content-Type": "image/jpeg" },
      body: blob,
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Upload mislukt");
    }
    return ((await res.json()) as { url: string }).url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!bewonerId || !type || !duur) {
      setError("Vul alle verplichte velden in.");
      return;
    }
    startTransition(async () => {
      try {
        let fotoUrl: string | null = null;
        if (fotoDataUrl && magFoto) {
          const resp = await fetch(fotoDataUrl);
          const blob = await resp.blob();
          fotoUrl = await uploadFoto(blob);
        }
        const formData = new FormData();
        formData.set("bewonerId", bewonerId);
        formData.set("type", type);
        formData.set("duurMinuten", duur);
        if (notities) formData.set("notities", notities);
        if (fotoUrl) formData.set("fotoUrl", fotoUrl);
        await logActiviteit(formData);
        setSuccess(true);
        setBewonerId(""); setType(""); setDuur("30"); setNotities(""); setFotoDataUrl(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
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
          <p className="font-bold text-gray-900 text-lg">Geregistreerd!</p>
          <p className="text-neutral-500 text-sm mt-1">De activiteit is succesvol vastgelegd.</p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-6 py-3 rounded-2xl transition-colors"
        >
          Nog een activiteit
        </button>
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
        <textarea
          value={notities}
          onChange={(e) => setNotities(e.target.value)}
          rows={3}
          placeholder="Bijzonderheden, sfeer, opmerkingen…"
          className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50 resize-none"
        />
      </div>

      {/* Foto — alleen als toestemmingFotos = true */}
      {bewonerId && magFoto && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 space-y-3">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest">
            Foto <span className="text-neutral-300 font-normal normal-case">(optioneel)</span>
          </label>
          <canvas ref={canvasRef} className="hidden" />

          {cameraActief && (
            <div className="space-y-2">
              <video ref={videoRef} className="w-full rounded-xl bg-black aspect-video object-cover" playsInline muted />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={maakFoto}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
                >
                  <Camera size={16} />
                  Foto maken
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="w-12 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {fotoDataUrl && !cameraActief && (
            <div className="space-y-2">
              <img src={fotoDataUrl} alt="Voorvertoning" className="w-full rounded-xl object-cover max-h-52" />
              <button
                type="button"
                onClick={() => setFotoDataUrl(null)}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                <X size={14} />
                Foto verwijderen
              </button>
            </div>
          )}

          {!cameraActief && !fotoDataUrl && (
            <button
              type="button"
              onClick={startCamera}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-neutral-200 hover:border-amber-300 rounded-xl py-5 text-neutral-400 hover:text-amber-600 text-sm font-medium transition-colors"
            >
              <Camera size={18} />
              Camera openen
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl text-sm transition-colors disabled:opacity-60 shadow-sm"
      >
        {isPending ? "Opslaan…" : "Activiteit opslaan"}
      </button>
    </form>
  );
}
