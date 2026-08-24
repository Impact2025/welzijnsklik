"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { markeerAandachtOpgepaktAction } from "@/lib/actions/aandacht";

export function OppakKnop({ bewonerId }: { bewonerId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notitie, setNotitie] = useState("");
  const [pending, startTransition] = useTransition();
  const [fout, setFout] = useState<string | null>(null);

  function markeer() {
    setFout(null);
    startTransition(async () => {
      try {
        await markeerAandachtOpgepaktAction(bewonerId, notitie || undefined);
        setOpen(false);
        setNotitie("");
        router.refresh();
      } catch (e) {
        setFout(e instanceof Error ? e.message : "Er ging iets mis.");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="text-[11px] lg:text-xs font-semibold rounded-full border border-neutral-200 text-neutral-500 px-2.5 py-1 flex-shrink-0 flex items-center gap-1 hover:border-brand-300 hover:text-brand-600 transition-colors"
      >
        <CheckCheck size={12} />
        Opgepakt
      </button>
    );
  }

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="flex-shrink-0 flex flex-col items-end gap-1.5 w-full sm:w-56"
    >
      <input
        type="text"
        value={notitie}
        onChange={(e) => setNotitie(e.target.value)}
        placeholder="Notitie (optioneel)"
        maxLength={300}
        className="w-full text-xs rounded-lg border border-neutral-200 px-2.5 py-1.5 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
      />
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={markeer}
          disabled={pending}
          className="text-[11px] font-semibold rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-3 py-1"
        >
          {pending ? "Bezig…" : "Bevestigen"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="text-[11px] font-medium text-neutral-400 px-2 py-1"
        >
          Annuleren
        </button>
      </div>
      {fout && <p className="text-[11px] text-red-600">{fout}</p>}
    </div>
  );
}
