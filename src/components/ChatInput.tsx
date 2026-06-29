"use client";

import { useRef, useState, useTransition } from "react";
import { stuurBericht } from "@/lib/actions/berichten";
import { Send, Loader2 } from "lucide-react";

export default function ChatInput({ aanId }: { aanId: string }) {
  const [inhoud, setInhoud] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inhoud.trim() || isPending) return;
    const tekst = inhoud;
    setInhoud("");
    setError(null);
    // reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    startTransition(async () => {
      try {
        await stuurBericht(aanId, tekst);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Versturen mislukt");
        setInhoud(tekst);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInhoud(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }

  return (
    <div className="fixed bottom-16 inset-x-0 z-30 max-w-lg mx-auto w-full px-3 pb-2">
      {error && (
        <p className="text-xs text-red-500 mb-1 px-1">{error}</p>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 bg-white border border-neutral-200 rounded-2xl shadow-lg px-3 py-2"
      >
        <textarea
          ref={textareaRef}
          value={inhoud}
          onChange={autoResize}
          onKeyDown={handleKeyDown}
          placeholder="Schrijf een bericht…"
          rows={1}
          maxLength={2000}
          className="flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder-neutral-400 focus:outline-none py-1.5 max-h-[120px] leading-relaxed"
        />
        <button
          type="submit"
          disabled={!inhoud.trim() || isPending}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-40 transition-colors flex-shrink-0 mb-0.5"
        >
          {isPending
            ? <Loader2 size={16} className="animate-spin" />
            : <Send size={15} />
          }
        </button>
      </form>
    </div>
  );
}
