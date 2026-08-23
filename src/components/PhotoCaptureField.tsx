"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import InAppCamera from "./InAppCamera";

interface PhotoCaptureFieldProps {
  /** Endpoint dat de rauwe foto-blob accepteert (POST, body = blob) en `{ url }` teruggeeft. */
  uploadUrl: string;
  /** Al bestaande foto (bewerkmodus) — rauwe of geproxyde URL, wordt ongewijzigd getoond. */
  initialPreviewUrl?: string | null;
  /** Aangeroepen met de nieuwe opslag-URL na een geslaagde upload, of `null` na verwijderen. */
  onUploaded: (url: string | null) => void;
  label?: string;
  /** Toon "(optioneel)" achter het label. Default true. */
  optioneel?: boolean;
  /** Compacte inline stijl (ActiviteitForm) i.p.v. de volle 16:9-tegel (Hulp-gevraagd-formulieren). */
  compact?: boolean;
  disabled?: boolean;
  /** Laat de omringende form weten of een upload nog loopt, om voortijdig submitten te voorkomen. */
  onUploadingChange?: (uploading: boolean) => void;
}

/**
 * Foto-veld met een echte in-app camera: de foto wordt nooit via de native
 * camera-app van het OS gemaakt (die slaat vaak zelf iets op in de fotorol),
 * maar rechtstreeks in de app gecaptured en als blob geüpload. Een bestaande
 * foto kiezen blijft mogelijk als bewuste fallback, niet als standaardpad.
 */
export default function PhotoCaptureField({
  uploadUrl,
  initialPreviewUrl = null,
  onUploaded,
  label = "Foto",
  optioneel = true,
  compact = false,
  disabled = false,
  onUploadingChange,
}: PhotoCaptureFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl);
  const [uploading, setUploadingState] = useState(false);
  const setUploading = (value: boolean) => {
    setUploadingState(value);
    onUploadingChange?.(value);
  };
  const [error, setError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function setLocalPreview(blob: Blob) {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    setPreviewUrl(url);
  }

  async function uploadBlob(blob: Blob) {
    setError(null);
    setUploading(true);
    setLocalPreview(blob);

    try {
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type || "image/jpeg" },
        body: blob,
      });
      if (!res.ok) {
        let message = "Foto uploaden mislukt";
        try {
          const data = await res.json();
          if (data.error) message = data.error;
        } catch {
          // geen JSON-body
        }
        throw new Error(message);
      }
      const data = (await res.json()) as { url: string };
      onUploaded(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Foto uploaden mislukt");
      setPreviewUrl(initialPreviewUrl);
      onUploaded(initialPreviewUrl);
    } finally {
      setUploading(false);
    }
  }

  function verwijderFoto() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl(null);
    setError(null);
    onUploaded(null);
  }

  const labelTekst = optioneel ? (
    <>
      {label} <span className="text-neutral-300 font-normal normal-case">(optioneel)</span>
    </>
  ) : (
    label
  );

  return (
    <div className={compact ? "bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 space-y-3" : undefined}>
      <label className={compact
        ? "block text-xs font-semibold text-neutral-400 uppercase tracking-widest"
        : "block text-sm font-semibold text-gray-700 mb-2"}>
        {labelTekst}
      </label>

      {previewUrl ? (
        <div className={compact ? "space-y-2" : "relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100"}>
          <img
            src={previewUrl}
            alt="Voorvertoning"
            className={compact ? "w-full rounded-xl object-cover max-h-52" : "w-full h-full object-cover"}
          />
          {uploading && (
            <div className={compact
              ? "flex items-center gap-2 text-xs text-neutral-400 font-medium"
              : "absolute inset-0 bg-black/40 flex items-center justify-center"}>
              <Loader2 size={compact ? 14 : 28} className={compact ? "animate-spin" : "text-white animate-spin"} />
              {compact && "Uploaden…"}
            </div>
          )}
          {!uploading && (
            compact ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCameraOpen(true)}
                  className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-800 transition-colors"
                >
                  <Camera size={14} />
                  Andere foto
                </button>
                <button
                  type="button"
                  onClick={verwijderFoto}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={14} />
                  Verwijderen
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={verwijderFoto}
                aria-label="Foto verwijderen"
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X size={15} />
              </button>
            )
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setCameraOpen(true)}
          className={compact
            ? "w-full flex items-center justify-center gap-2 border-2 border-dashed border-neutral-200 hover:border-amber-300 rounded-xl py-5 text-neutral-400 hover:text-amber-600 text-sm font-medium transition-colors disabled:opacity-60"
            : "w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-neutral-200 hover:border-amber-300 hover:bg-amber-50 transition-colors flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-amber-500 disabled:opacity-60"}
        >
          <Camera size={compact ? 18 : 28} />
          <span className={compact ? undefined : "text-sm font-medium"}>Foto maken</span>
        </button>
      )}

      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}

      {cameraOpen && (
        <InAppCamera
          onCapture={(blob) => {
            setCameraOpen(false);
            uploadBlob(blob);
          }}
          onClose={() => setCameraOpen(false)}
          onFallbackFile={(file) => {
            setCameraOpen(false);
            uploadBlob(file);
          }}
        />
      )}
    </div>
  );
}
