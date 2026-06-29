"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function CoordinatorError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="px-4 py-20 text-center space-y-4">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-3xl">
        <AlertTriangle size={26} className="text-red-500" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">Er ging iets mis</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Het dashboard kon niet worden geladen. Probeer het opnieuw.
        </p>
      </div>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        <RotateCcw size={14} />
        Opnieuw proberen
      </button>
    </div>
  );
}
