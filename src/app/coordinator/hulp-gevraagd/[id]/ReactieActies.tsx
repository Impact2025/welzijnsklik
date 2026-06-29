"use client";

import { useTransition } from "react";
import { updateHulpReactieStatus, updateHulpStatus } from "@/lib/actions/hulp-gevraagd";
import { CheckCircle2, XCircle, Lock, Unlock } from "lucide-react";

export function ReactieKnopjes({ reactieId, huidigStatus }: { reactieId: string; huidigStatus: string }) {
  const [isPending, startTransition] = useTransition();

  if (huidigStatus === "bevestigd") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
        <CheckCircle2 size={11} />
        Bevestigd
      </span>
    );
  }
  if (huidigStatus === "afgewezen") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full">
        <XCircle size={11} />
        Afgewezen
      </span>
    );
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => updateHulpReactieStatus(reactieId, "bevestigd"))}
        className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors disabled:opacity-60"
      >
        <CheckCircle2 size={13} />
        Bevestigen
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => updateHulpReactieStatus(reactieId, "afgewezen"))}
        className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors disabled:opacity-60"
      >
        <XCircle size={13} />
        Afwijzen
      </button>
    </div>
  );
}

export function StatusKnop({ hulpId, huidigStatus }: { hulpId: string; huidigStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const isOpen = huidigStatus === "open" || huidigStatus === "vol";

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(() => updateHulpStatus(hulpId, isOpen ? "gesloten" : "open"))
      }
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-60 ${
        isOpen
          ? "text-neutral-600 bg-neutral-100 hover:bg-neutral-200"
          : "text-amber-700 bg-amber-50 hover:bg-amber-100"
      }`}
    >
      {isOpen ? <Lock size={12} /> : <Unlock size={12} />}
      {isOpen ? "Sluiten" : "Heropenen"}
    </button>
  );
}
