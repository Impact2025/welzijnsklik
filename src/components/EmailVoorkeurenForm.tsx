"use client";

import { useState, useTransition } from "react";
import { Mail, Bell, Calendar } from "lucide-react";

interface Props {
  initial: { activiteiten: boolean; wekelijkseDigest: boolean };
}

export default function EmailVoorkeurenForm({ initial }: Props) {
  const [activiteiten, setActiviteiten] = useState(initial.activiteiten);
  const [wekelijkseDigest, setWekelijkseDigest] = useState(initial.wekelijkseDigest);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleToggle(type: "activiteiten" | "digest") {
    const nieuweActiviteiten = type === "activiteiten" ? !activiteiten : activiteiten;
    const nieuweDigest = type === "digest" ? !wekelijkseDigest : wekelijkseDigest;

    if (type === "activiteiten") setActiviteiten(!activiteiten);
    else setWekelijkseDigest(!wekelijkseDigest);

    startTransition(async () => {
      const { updateEmailVoorkeuren } = await import("@/lib/actions/email-voorkeuren");
      await updateEmailVoorkeuren(nieuweActiviteiten, nieuweDigest);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 space-y-4">
      <div className="flex items-center gap-2">
        <Mail size={16} className="text-neutral-400" />
        <h2 className="font-semibold text-gray-900 text-[15px]">E-mailnotificaties</h2>
      </div>

      <div className="divide-y divide-neutral-50 -mx-5">
        {/* Activiteiten */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Bell size={14} className="text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800">Nieuwe activiteiten</p>
              <p className="text-xs text-neutral-400">Ontvang een e-mail bij elke nieuwe activiteit</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("activiteiten")}
            disabled={isPending}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              activiteiten ? "bg-amber-500" : "bg-neutral-200"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                activiteiten ? "translate-x-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Wekelijkse digest */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Calendar size={14} className="text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800">Wekelijkse samenvatting</p>
              <p className="text-xs text-neutral-400">Elke maandag een overzicht van de afgelopen week</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("digest")}
            disabled={isPending}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              wekelijkseDigest ? "bg-amber-500" : "bg-neutral-200"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                wekelijkseDigest ? "translate-x-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {saved && (
        <p className="text-xs text-emerald-600 font-medium text-center">Voorkeuren opgeslagen</p>
      )}
    </div>
  );
}
