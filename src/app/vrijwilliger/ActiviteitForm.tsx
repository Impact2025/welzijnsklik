"use client";

import { useRef, useState, useTransition } from "react";
import { logActiviteit } from "@/lib/actions/activiteiten";

interface Bewoner {
  id: string;
  naam: string;
  toestemmingFotos: boolean;
}

const ACTIVITEIT_TYPES = [
  "Wandelen",
  "Koffiedrinken",
  "Gezelschap",
  "Spelletjes",
  "Lezen",
  "Muziek",
  "Boodschappen",
  "Anders",
];

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
      // navigator.mediaDevices.getUserMedia — géén native camera-app, alles in de browser
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

    // Haal foto als data URL op — nooit opslaan lokaal, direct als blob uploaden
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setFotoDataUrl(dataUrl);
    stopCamera();
  }

  function verwijderFoto() {
    setFotoDataUrl(null);
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
    const data = await res.json();
    return data.url as string;
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
          // Converteer canvas data URL naar blob — direct naar server, geen lokale opslag
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
        // Reset formulier
        setBewonerId("");
        setType("");
        setDuur("30");
        setNotities("");
        setFotoDataUrl(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      }
    });
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 text-center space-y-3">
        <div className="text-4xl">✅</div>
        <p className="font-semibold text-gray-800">Activiteit geregistreerd!</p>
        <button
          onClick={() => setSuccess(false)}
          className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition"
        >
          Nog een activiteit
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-5 space-y-4">
      {error && (
        <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</p>
      )}

      {/* Bewoner kiezen */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bewoner <span className="text-red-500">*</span>
        </label>
        <select
          value={bewonerId}
          onChange={(e) => setBewonerId(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Kies een bewoner…</option>
          {bewoners.map((b) => (
            <option key={b.id} value={b.id}>
              {b.naam}
            </option>
          ))}
        </select>
      </div>

      {/* Activiteittype */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type activiteit <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ACTIVITEIT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition ${
                type === t
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-amber-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Duur */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duur (minuten) <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {["15", "30", "45", "60", "90", "120"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setDuur(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                duur === m
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-amber-400"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Notities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notities (optioneel)
        </label>
        <textarea
          value={notities}
          onChange={(e) => setNotities(e.target.value)}
          rows={2}
          placeholder="Bijzonderheden, sfeer, opmerkingen…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
        />
      </div>

      {/* Foto — ALLEEN tonen als toestemmingFotos = true */}
      {bewonerId && magFoto && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto (optioneel)
          </label>

          {/* Canvas voor het vastleggen — verborgen totdat er een foto is */}
          <canvas ref={canvasRef} className="hidden" />

          {cameraActief && (
            <div className="space-y-2">
              <video
                ref={videoRef}
                className="w-full rounded-lg bg-black"
                playsInline
                muted
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={maakFoto}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2.5 rounded-lg transition"
                >
                  📸 Foto maken
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg transition"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {fotoDataUrl && !cameraActief && (
            <div className="space-y-2">
              <img
                src={fotoDataUrl}
                alt="Voorvertoning"
                className="w-full rounded-lg object-cover max-h-48"
              />
              <button
                type="button"
                onClick={verwijderFoto}
                className="text-sm text-red-500 hover:underline"
              >
                Foto verwijderen
              </button>
            </div>
          )}

          {!cameraActief && !fotoDataUrl && (
            <button
              type="button"
              onClick={startCamera}
              className="w-full border-2 border-dashed border-amber-300 rounded-lg py-4 text-amber-600 text-sm hover:bg-amber-50 transition"
            >
              📷 Camera openen
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-60"
      >
        {isPending ? "Opslaan…" : "Activiteit opslaan"}
      </button>
    </form>
  );
}
