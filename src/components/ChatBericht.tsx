"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { verwijderBericht } from "@/lib/actions/berichten";

type Bericht = {
  id: string;
  inhoud: string;
  createdAt: Date;
  vanId: string;
};

function tijdStempel(datum: Date) {
  return datum.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) +
    " · " +
    datum.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
}

export default function ChatBericht({ bericht, ikId }: { bericht: Bericht; ikId: string }) {
  const vanMij = bericht.vanId === ikId;
  const [verwijderd, setVerwijderd] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (verwijderd) return null;

  function handleDelete() {
    if (!window.confirm("Dit bericht verwijderen?")) return;
    startTransition(async () => {
      try {
        await verwijderBericht(bericht.id);
        setVerwijderd(true);
      } catch {
        // laat bericht staan als verwijderen mislukt
      }
    });
  }

  return (
    <div className={`flex items-center gap-1.5 ${vanMij ? "justify-end" : "justify-start"}`}>
      {vanMij && (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-neutral-300 hover:text-red-500 active:text-red-500 transition-colors flex-shrink-0 disabled:opacity-40 p-1"
          aria-label="Bericht verwijderen"
        >
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
        </button>
      )}
      <div className={`max-w-[78%] ${vanMij ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            vanMij
              ? "bg-amber-500 text-white rounded-br-md"
              : "bg-white border border-neutral-100 shadow-sm text-gray-900 rounded-bl-md"
          }`}
        >
          {bericht.inhoud}
        </div>
        <span className="text-[10px] text-neutral-400 px-1">
          {tijdStempel(new Date(bericht.createdAt))}
        </span>
      </div>
    </div>
  );
}
