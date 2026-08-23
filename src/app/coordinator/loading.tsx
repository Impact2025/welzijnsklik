"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";

// De RSC-stream kan onderweg afbreken ("Connection closed") als Neon net uit
// idle-suspend moet ontwaken op de eerste request na een tijdje inactiviteit.
// Dat gooit geen error die error.tsx kan opvangen — de Suspense-boundary
// blijft dan voor altijd op deze skeleton hangen. Daarom hier een automatische
// retry, en na een tweede mislukking een handmatige knop i.p.v. eindeloos wachten.
const RETRY_KEY = "coordinator-loading-retry";

export default function CoordinatorLoading() {
  const router = useRouter();
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const pogingen = Number(sessionStorage.getItem(RETRY_KEY) ?? "0");

    if (pogingen >= 1) {
      const toonKnopTimer = setTimeout(() => setStuck(true), 4000);
      // Als dit onmount vóór de knop verschijnt, is het dashboard alsnog geladen.
      return () => {
        clearTimeout(toonKnopTimer);
        sessionStorage.removeItem(RETRY_KEY);
      };
    }

    const retryTimer = setTimeout(() => {
      sessionStorage.setItem(RETRY_KEY, String(pogingen + 1));
      router.refresh();
    }, 4000);
    // Onmount vóórdat de timer afgaat betekent: succesvol geladen, teller resetten.
    return () => {
      clearTimeout(retryTimer);
      sessionStorage.removeItem(RETRY_KEY);
    };
  }, [router]);

  return (
    <div className="px-4 py-20 text-center space-y-3">
      <Loader2 size={24} className="animate-spin text-amber-500 mx-auto" />
      <p className="text-sm text-neutral-400 font-medium">Dashboard laden…</p>
      {stuck && (
        <button
          onClick={() => {
            sessionStorage.removeItem(RETRY_KEY);
            router.refresh();
          }}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors mt-2"
        >
          <RotateCcw size={14} />
          Opnieuw proberen
        </button>
      )}
    </div>
  );
}
