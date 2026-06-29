"use client";

import { useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  id: string;
}

export default function MarkeerBehandeld({ id }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleMarkeren() {
    startTransition(async () => {
      try {
        const { markeerBehandeld } = await import("@/lib/actions/notificaties");
        await markeerBehandeld(id);
        window.location.reload();
      } catch {
        // ignore
      }
    });
  }

  return (
    <button
      onClick={handleMarkeren}
      disabled={isPending}
      className="flex items-center justify-center gap-1.5 flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <CheckCircle2 size={13} />
      )}
      Markeer behandeld
    </button>
  );
}
