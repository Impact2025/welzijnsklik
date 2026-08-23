"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { RotateCcw, X, AlertTriangle, ImageUp } from "lucide-react";

interface InAppCameraProps {
  /** Wordt aangeroepen met de gemaakte foto als JPEG-blob. De camera sluit daarna zichzelf. */
  onCapture: (blob: Blob) => void;
  /** Wordt aangeroepen als de gebruiker annuleert (Esc, kruisje, klik buiten de modal). */
  onClose: () => void;
  /**
   * Fallback voor toestellen/browsers zonder cameratoegang (of bij geweigerde
   * toestemming): laat de gebruiker alsnog een bestand kiezen. Optioneel —
   * zonder deze prop toont de component alleen een foutmelding.
   */
  onFallbackFile?: (file: File) => void;
}

/**
 * Maakt een foto zonder ooit een bestand op het toestel te bewaren: de
 * camerastream wordt live in de app getoond, een druk op de knop tekent het
 * huidige frame op een canvas en levert direct een in-memory Blob op. Er
 * wordt geen `<input type="file" capture>` gebruikt — dat delegeert naar de
 * native camera-app van het OS, die de foto doorgaans zelf in de fotorol
 * bewaart, wat niet is wat "in-app camera, nooit lokaal opgeslagen" belooft.
 */
export default function InAppCamera({ onCapture, onClose, onFallbackFile }: InAppCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);
  const dialogTitleId = useId();

  const [status, setStatus] = useState<"laden" | "klaar" | "fout">("laden");
  const [foutmelding, setFoutmelding] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let geannuleerd = false;

    async function startCamera() {
      setStatus("laden");
      setFoutmelding(null);
      stopStream();

      if (!navigator.mediaDevices?.getUserMedia) {
        if (!geannuleerd) {
          setStatus("fout");
          setFoutmelding("Deze browser ondersteunt geen camera-toegang.");
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (geannuleerd) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("klaar");
      } catch (err) {
        if (geannuleerd) return;
        setStatus("fout");
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setFoutmelding("Cameratoegang geweigerd. Sta toegang toe in je browserinstellingen, of kies een bestaande foto.");
        } else if (err instanceof DOMException && err.name === "NotFoundError") {
          setFoutmelding("Geen camera gevonden op dit toestel.");
        } else {
          setFoutmelding("Camera kon niet worden gestart.");
        }
      }
    }

    startCamera();
    return () => {
      geannuleerd = true;
      stopStream();
    };
  }, [facingMode, stopStream]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function maakFoto() {
    const video = videoRef.current;
    if (!video || status !== "klaar") return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          stopStream();
          onCapture(blob);
        }
      },
      "image/jpeg",
      0.9
    );
  }

  function wisselCamera() {
    setFacingMode((m) => (m === "environment" ? "user" : "environment"));
  }

  function handleFallbackChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onFallbackFile) {
      stopStream();
      onFallbackFile(file);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={dialogTitleId}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <h2 id={dialogTitleId} className="sr-only">Foto maken</h2>

      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="Camera sluiten"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X size={20} />
        </button>
        {status === "klaar" && (
          <button
            type="button"
            onClick={wisselCamera}
            aria-label="Wissel tussen voor- en achtercamera"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {status === "fout" ? (
          <div className="text-center px-8 space-y-4 max-w-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-500/20 rounded-2xl">
              <AlertTriangle size={26} className="text-red-400" />
            </div>
            <p className="text-white text-sm">{foutmelding}</p>
            {onFallbackFile && (
              <button
                type="button"
                onClick={() => fallbackInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <ImageUp size={16} />
                Bestaande foto kiezen
              </button>
            )}
          </div>
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className="max-w-full max-h-full object-contain"
          />
        )}
        {status === "laden" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {status === "klaar" && (
        <div className="flex items-center justify-center p-8 flex-shrink-0">
          <button
            type="button"
            onClick={maakFoto}
            aria-label="Foto maken"
            className="w-16 h-16 rounded-full bg-white ring-4 ring-white/30 hover:ring-white/50 transition-all active:scale-95"
          />
        </div>
      )}

      {onFallbackFile && (
        <input
          ref={fallbackInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFallbackChange}
        />
      )}
    </div>
  );
}
