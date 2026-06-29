"use client";

import { useState, useTransition } from "react";
import { toggleReactie, plaatsBericht, verwijderReactie } from "@/lib/actions/reacties";
import { X, Send } from "lucide-react";

const EMOJI = ["❤️", "😊", "👍", "🎉", "😢", "🙏", "🔥", "😂"];

interface ReactieData {
  id: string;
  emoji: string;
  bericht: string | null;
  createdAt: Date;
  gebruiker: { id: string; naam: string };
}

interface Props {
  activiteitId: string;
  reacties: ReactieData[];
  gebruikersId: string;
  gebruikersNaam: string;
}

export default function Reacties({ activiteitId, reacties: initieleReacties, gebruikersId, gebruikersNaam }: Props) {
  const [reacties, setReacties] = useState(initieleReacties);
  const [bericht, setBericht] = useState("");
  const [isPending, startTransition] = useTransition();

  // Groepeer emoji-reacties
  const emojiGroepen = new Map<string, { count: number; users: string[] }>();

  for (const r of reacties) {
    const key = r.emoji;
    if (!emojiGroepen.has(key)) emojiGroepen.set(key, { count: 0, users: [] });
    const g = emojiGroepen.get(key)!;
    g.count++;
    g.users.push(r.gebruiker.naam);
  }

  // Haal berichten uit reacties
  const berichten = reacties.filter((r) => r.emoji === "💬" || r.bericht);

  function handleEmoji(emoji: string) {
    startTransition(async () => {
      await toggleReactie(activiteitId, emoji);
      // Optimistische update
      setReacties((prev) => {
        const bestaand = prev.find((r) => r.emoji === emoji && r.gebruiker.id === gebruikersId);
        if (bestaand) {
          return prev.filter((r) => r.id !== bestaand.id);
        }
        return [
          ...prev,
          { id: `opt-${Date.now()}`, emoji, bericht: null, createdAt: new Date(), gebruiker: { id: gebruikersId, naam: gebruikersNaam } },
        ];
      });
    });
  }

  function handleBericht(e: React.FormEvent) {
    e.preventDefault();
    if (!bericht.trim()) return;
    startTransition(async () => {
      await plaatsBericht(activiteitId, bericht.trim());
      setReacties((prev) => [
        ...prev,
        { id: `opt-${Date.now()}`, emoji: "💬", bericht: bericht.trim(), createdAt: new Date(), gebruiker: { id: gebruikersId, naam: gebruikersNaam } },
      ]);
      setBericht("");
    });
  }

  function handleVerwijder(reactieId: string) {
    startTransition(async () => {
      await verwijderReactie(reactieId);
      setReacties((prev) => prev.filter((r) => r.id !== reactieId));
    });
  }

  return (
    <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2">
      {/* Emoji balk */}
      <div className="flex flex-wrap items-center gap-1.5">
        {EMOJI.map((emoji) => {
          const isActief = reacties.some((r) => r.emoji === emoji && r.gebruiker.id === gebruikersId && !r.bericht);
          const groep = emojiGroepen.get(emoji);

          return (
            <button
              key={emoji}
              onClick={() => handleEmoji(emoji)}
              disabled={isPending}
              className={`text-lg leading-none px-2.5 py-1.5 rounded-lg transition-all ${
                isActief
                  ? "bg-amber-100 ring-1 ring-amber-300 scale-110"
                  : "hover:bg-neutral-100"
              } disabled:opacity-50`}
              title={groep ? `${groep.users.join(", ")}` : emoji}
            >
              {emoji}
              {groep && groep.count > 1 && (
                <span className="text-[10px] font-bold text-neutral-500 ml-0.5 align-top">{groep.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Berichten */}
      {berichten.length > 0 && (
        <div className="space-y-1.5">
          {berichten
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((r) => (
              <div key={r.id} className="flex items-start gap-2 group">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                  {r.gebruiker.naam.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-gray-800">{r.gebruiker.naam}</span>
                    {r.emoji !== "💬" && <span className="text-sm leading-none">{r.emoji}</span>}
                  </div>
                  {r.bericht && (
                    <p className="text-sm text-gray-700 leading-snug">{r.bericht}</p>
                  )}
                </div>
                {r.gebruiker.id === gebruikersId && (
                  <button
                    onClick={() => handleVerwijder(r.id)}
                    disabled={isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-300 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Bericht invoer */}
      <form onSubmit={handleBericht} className="flex items-center gap-2">
        <input
          type="text"
          value={bericht}
          onChange={(e) => setBericht(e.target.value)}
          placeholder="Schrijf een bericht..."
          maxLength={500}
          className="flex-1 text-sm bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-neutral-400"
        />
        <button
          type="submit"
          disabled={isPending || !bericht.trim()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-40 transition-colors flex-shrink-0"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
