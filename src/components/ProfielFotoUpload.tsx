"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Camera, Loader2 } from "lucide-react";
import { getInitials } from "@/components/ui";

export default function ProfielFotoUpload({
  naam,
  huidigeFoto,
}: {
  naam?: string;
  huidigeFoto?: string | null;
}) {
  const { update } = useSession();
  const [foto, setFoto] = useState<string | null>(huidigeFoto ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setError(null);
    setUploading(true);

    try {
      const res = await fetch("/api/upload-profielfoto", {
        method: "POST",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });

      if (!res.ok) {
        let message = "Upload mislukt";
        try {
          const data = await res.json();
          if (data.error) message = data.error;
        } catch {
          // HTML foutpagina
        }
        throw new Error(message);
      }

      const { url } = (await res.json()) as { url: string };
      setFoto(url);
      // Sessie bijwerken zodat het profielfoto ook in de topbar verschijnt
      await update({ profielFoto: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {foto ? (
          <img
            src={foto}
            alt={naam ?? "Profiel"}
            className="w-20 h-20 rounded-2xl object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center">
            <span className="text-amber-700 font-bold text-2xl">{getInitials(naam)}</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-500 hover:bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-sm transition-colors disabled:opacity-60"
          title="Foto wijzigen"
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Camera size={14} />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
