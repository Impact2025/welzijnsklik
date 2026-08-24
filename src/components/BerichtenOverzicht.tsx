"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { MessageSquare, Plus, Search, Megaphone, Send, Loader2, X } from "lucide-react";
import { Avatar } from "@/components/ui";
import { stuurBerichtAanIedereen } from "@/lib/actions/berichten";

type Rol = "VRIJWILLIGER" | "WELZIJNSMEDEWERKER";

export type Thread = {
  id: string;
  naam: string;
  rol: Rol;
  profielFoto: string | null;
  laatste: { inhoud: string; createdAt: Date; vanId: string } | null;
  ongelezen: number;
};

const ROL_LABEL: Record<Rol, string> = {
  VRIJWILLIGER: "Vrijwilliger",
  WELZIJNSMEDEWERKER: "Pro",
};

const ROL_BADGE: Record<Rol, string> = {
  VRIJWILLIGER: "bg-emerald-100 text-emerald-700",
  WELZIJNSMEDEWERKER: "bg-teal-100 text-teal-700",
};

function tijdLabel(datum: Date) {
  const nu = new Date();
  const diff = nu.getTime() - datum.getTime();
  if (diff < 60_000) return "nu";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return datum.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  if (diff < 7 * 86_400_000) return datum.toLocaleDateString("nl-NL", { weekday: "short" });
  return datum.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

function ThreadRow({ t, ikId }: { t: Thread; ikId: string }) {
  return (
    <Link
      key={t.id}
      href={`/coordinator/berichten/${t.id}`}
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors"
    >
      <Avatar naam={t.naam} src={t.profielFoto} fotoId={t.id} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={`text-sm truncate ${t.ongelezen > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
            {t.naam}
          </p>
          <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROL_BADGE[t.rol]}`}>
            {ROL_LABEL[t.rol]}
          </span>
        </div>
        {t.laatste ? (
          <p className={`text-xs mt-0.5 truncate ${t.ongelezen > 0 ? "text-gray-700 font-medium" : "text-neutral-400"}`}>
            {t.laatste.vanId === ikId ? "Jij: " : ""}{t.laatste.inhoud}
          </p>
        ) : (
          <p className="text-xs text-neutral-400 mt-0.5">Klik om een bericht te sturen</p>
        )}
      </div>
      {t.laatste && (
        <span className="text-[11px] text-neutral-400 flex-shrink-0">{tijdLabel(new Date(t.laatste.createdAt))}</span>
      )}
      {t.ongelezen > 0 ? (
        <span className="w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
          {t.ongelezen > 9 ? "9+" : t.ongelezen}
        </span>
      ) : !t.laatste ? (
        <Plus size={16} className="text-neutral-300 flex-shrink-0" />
      ) : null}
    </Link>
  );
}

function BroadcastComposer({ onClose }: { onClose: () => void }) {
  const [inhoud, setInhoud] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [verzonden, setVerzonden] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inhoud.trim() || isPending) return;
    setError(null);
    startTransition(async () => {
      try {
        await stuurBerichtAanIedereen(inhoud);
        setVerzonden(true);
        setInhoud("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Versturen mislukt");
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-700">
          <Megaphone size={16} />
          <p className="text-sm font-semibold">Bericht aan iedereen</p>
        </div>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
          <X size={16} />
        </button>
      </div>

      {verzonden ? (
        <p className="text-sm text-emerald-600">Verstuurd naar alle vrijwilligers en pro&apos;s.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={inhoud}
            onChange={(e) => setInhoud(e.target.value)}
            placeholder="Schrijf een bericht voor alle vrijwilligers en pro's…"
            rows={3}
            maxLength={2000}
            className="w-full resize-none bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!inhoud.trim() || isPending}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium disabled:opacity-40 transition-colors"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Verstuur naar iedereen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function BerichtenOverzicht({ threads, ikId }: { threads: Thread[]; ikId: string }) {
  const [zoek, setZoek] = useState("");
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  const gefilterd = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => t.naam.toLowerCase().includes(q));
  }, [zoek, threads]);

  const pros = gefilterd.filter((t) => t.rol === "WELZIJNSMEDEWERKER");
  const metBerichten = gefilterd.filter((t) => t.rol === "VRIJWILLIGER" && t.laatste);
  const zonderBerichten = gefilterd.filter((t) => t.rol === "VRIJWILLIGER" && !t.laatste);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            placeholder="Zoek op naam…"
            className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>
        <button
          onClick={() => setBroadcastOpen((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex-shrink-0 ${
            broadcastOpen ? "bg-amber-500 text-white" : "bg-white border border-neutral-200 text-gray-700 hover:bg-neutral-50"
          }`}
        >
          <Megaphone size={15} />
          <span className="hidden sm:inline">Iedereen</span>
        </button>
      </div>

      {broadcastOpen && <BroadcastComposer onClose={() => setBroadcastOpen(false)} />}

      {threads.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 px-4 py-12 text-center">
          <MessageSquare size={24} className="text-neutral-300 mx-auto mb-2" />
          <p className="text-neutral-400 text-sm">Nog geen vrijwilligers in het team.</p>
        </div>
      ) : gefilterd.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 px-4 py-12 text-center">
          <Search size={24} className="text-neutral-300 mx-auto mb-2" />
          <p className="text-neutral-400 text-sm">Niemand gevonden voor &quot;{zoek}&quot;.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {pros.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wider">Pro&apos;s</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden divide-y divide-neutral-50">
                {pros.map((t) => (
                  <ThreadRow key={t.id} t={t} ikId={ikId} />
                ))}
              </div>
            </div>
          )}

          {metBerichten.length > 0 && (
            <div className="space-y-2">
              {pros.length > 0 && (
                <h2 className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wider">Gesprekken</h2>
              )}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden divide-y divide-neutral-50">
                {metBerichten.map((t) => (
                  <ThreadRow key={t.id} t={t} ikId={ikId} />
                ))}
              </div>
            </div>
          )}

          {zonderBerichten.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wider">Nog geen gesprek</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden divide-y divide-neutral-50">
                {zonderBerichten.map((t) => (
                  <ThreadRow key={t.id} t={t} ikId={ikId} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
