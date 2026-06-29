import type { Metadata } from "next";
import DemoLoginForm from "./DemoLoginForm";
import { Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Demo — Welzijnsklik",
  description: "Verken Welzijnsklik met een demo-account. Coordinator, vrijwilliger of familie.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 max-w-app mx-auto w-full">
        <div className="px-5 py-10 space-y-10">

          {/* Hero */}
          <div className="flex flex-col items-center text-center pt-4">
            <img
              src="/logo.png"
              alt="Welzijnsklik"
              className="w-20 h-20 rounded-3xl shadow-md mb-5"
            />
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welzijnsklik</h1>
            <p className="text-warm-500 text-[15px] mt-2 leading-relaxed max-w-[240px]">
              Verbindt vrijwilligers, bewoners en familie met één klik
            </p>
          </div>

          {/* Klik en ontdek */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star size={17} className="text-amber-400 fill-amber-400 flex-shrink-0" />
              <h2 className="font-bold text-gray-900 text-[17px]">Klik en ontdek</h2>
            </div>
            <DemoLoginForm />
          </div>

          <p className="text-center text-xs text-warm-400 pb-4">
            Welzijnsklik &middot; De Meerwende &middot; Badhoevedorp
          </p>
        </div>
      </main>
    </div>
  );
}
