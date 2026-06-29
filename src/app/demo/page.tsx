import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import DemoLoginForm from "./DemoLoginForm";

export const metadata: Metadata = {
  title: "Demo — Welzijnsklik",
  description: "Verken Welzijnsklik met een demo-account. Coördinator, vrijwilliger of familie.",
};

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center mx-auto">
            <img src="/logo.svg" alt="Welzijnsklik" className="w-16 h-16" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Verken Welzijnsklik
            </h1>
            <p className="text-neutral-500 text-sm">
              Kies een rol en ontdek de app — geen registratie nodig.
            </p>
          </div>
        </div>

        {/* Demo login */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <Sparkles size={14} className="text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              Klik en ontdek
            </span>
          </div>
          <DemoLoginForm />
        </div>

        {/* Rol-beschrijvingen */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { rol: "Coördinator", desc: "Dashboard, bewoners, rapportages", kleur: "text-violet-600" },
            { rol: "Vrijwilliger", desc: "Activiteiten, foto's, notities", kleur: "text-emerald-600" },
            { rol: "Familie", desc: "Tijdlijn, meehelpen", kleur: "text-sky-600" },
          ].map((r) => (
            <div key={r.rol} className="bg-white/80 rounded-xl p-3 border border-neutral-100">
              <p className={`font-bold text-xs ${r.kleur}`}>{r.rol}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{r.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-neutral-400">
          Welzijnsklik · De Meerwende · Badhoevedorp
        </p>
      </div>
    </main>
  );
}
