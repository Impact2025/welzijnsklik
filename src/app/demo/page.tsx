import type { Metadata } from "next";
import DemoLoginForm from "./DemoLoginForm";
import { Bell, Settings, Users, Activity, UserPlus, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Demo — Welzijnsklik",
  description: "Verken Welzijnsklik met een demo-account. Coordinator, vrijwilliger of familie.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center">
      {/* Top bar — exact als AppShell */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-b border-warm-200 h-14 flex items-center px-4 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2 flex-1">
          <img src="/logo.png" alt="Welzijnsklik" className="w-7 h-7" />
          <span className="font-semibold text-warm-900 text-[15px] tracking-tight">Welzijnsklik</span>
        </div>
        <div className="flex items-center gap-0.5">
          <div className="w-9 h-9 flex items-center justify-center rounded-full text-warm-300">
            <Bell size={18} />
          </div>
          <div className="w-9 h-9 flex items-center justify-center rounded-full text-warm-300">
            <Settings size={18} />
          </div>
          <div className="ml-1 w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>
      </header>

      {/* Content — zelfde padding als coordinator dashboard */}
      <main className="flex-1 max-w-app mx-auto w-full pt-14">
        <div className="px-4 py-6 space-y-6">

          {/* Greeting */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Verken Welzijnsklik</h1>
            <p className="text-sm text-warm-500 mt-0.5">Kies een rol en ontdek de app</p>
          </div>

          {/* Stat cards — zoals coordinator dashboard */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
                <Users size={17} className="text-violet-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">3</p>
              <p className="text-xs text-warm-500 mt-0.5 font-medium">Bewoners</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <UserCheck size={17} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">1</p>
              <p className="text-xs text-warm-500 mt-0.5 font-medium">Vrijwilliger</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                <Activity size={17} className="text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">14</p>
              <p className="text-xs text-warm-500 mt-0.5 font-medium">Activiteiten</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
                <UserPlus size={17} className="text-violet-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">1</p>
              <p className="text-xs text-warm-500 mt-0.5 font-medium">Aanmelding</p>
            </div>
          </div>

          {/* Kies een rol */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <h2 className="font-semibold text-gray-900 text-[15px]">Klik en ontdek</h2>
            </div>
            <DemoLoginForm />
          </div>

          {/* Rol beschrijvingen */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { rol: "Coordinator", desc: "Dashboard, bewoners, rapportages", kleur: "text-violet-600" },
              { rol: "Vrijwilliger", desc: "Activiteiten, fotos, notities", kleur: "text-emerald-600" },
              { rol: "Familie", desc: "Tijdlijn, meehelpen", kleur: "text-sky-600" },
            ].map((r) => (
              <div key={r.rol} className="bg-white rounded-xl p-3 border border-neutral-100">
                <p className={`font-bold text-xs ${r.kleur}`}>{r.rol}</p>
                <p className="text-[10px] text-warm-400 mt-0.5">{r.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-warm-400">
            Welzijnsklik &middot; De Meerwende &middot; Badhoevedorp
          </p>
        </div>
      </main>
    </div>
  );
}
