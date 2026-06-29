"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  LayoutDashboard,
  Heart,
  UserCheck,
  ArrowRight,
  Loader2,
  LogIn,
  Activity,
  Users,
  UserPlus,
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    email: "coordinator@demeerwende.nl",
    label: "Coordinator",
    beschrijving: "Dashboard, bewoners beheren, team",
    naam: "Virginia van Munster",
    icon: LayoutDashboard,
    bg: "bg-violet-50 border-violet-200",
    hover: "hover:bg-violet-100 hover:border-violet-300",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    badge: "bg-violet-600",
  },
  {
    email: "vrijwilliger@demeerwende.nl",
    label: "Vrijwilliger",
    beschrijving: "Activiteiten registreren, fotos maken",
    naam: "Roderik Smits",
    icon: Heart,
    bg: "bg-emerald-50 border-emerald-200",
    hover: "hover:bg-emerald-100 hover:border-emerald-300",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badge: "bg-emerald-600",
  },
  {
    email: "familie@example.nl",
    label: "Familie",
    beschrijving: "Tijdlijn, meehelpen",
    naam: "Jolanda Kamoschinski",
    icon: UserCheck,
    bg: "bg-sky-50 border-sky-200",
    hover: "hover:bg-sky-100 hover:border-sky-300",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    badge: "bg-sky-600",
  },
];

export default function DemoLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(email: string) {
    setLoading(email);
    setError(null);
    try {
      const res = await signIn("dev-login", { email, redirect: false });
      if (res?.error) {
        setError("Inloggen mislukt. Zijn de demo-accounts al ingezaaid?");
        setLoading(null);
        return;
      }
      router.push("/");
    } catch (err) {
      setError("Onverwachte fout");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid gap-3">
        {DEMO_ACCOUNTS.map((acc) => {
          const Icon = acc.icon;
          const isBusy = loading !== null;
          const isLoading = loading === acc.email;

          return (
            <button
              key={acc.email}
              onClick={() => handleLogin(acc.email)}
              disabled={isBusy}
              className={`w-full flex items-center gap-4 border-2 rounded-2xl p-4 text-left transition-all disabled:opacity-60 ${acc.bg} ${acc.hover} hover:shadow-md group`}
            >
              <div className={`w-12 h-12 rounded-2xl ${acc.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                {isLoading ? (
                  <Loader2 size={22} className={`${acc.iconColor} animate-spin`} />
                ) : (
                  <Icon size={22} className={acc.iconColor} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900">{acc.naam}</p>
                  <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${acc.badge}`}>
                    {acc.label}
                  </span>
                </div>
                <p className="text-xs text-warm-500 mt-0.5">{acc.beschrijving}</p>
              </div>
              <div className="flex-shrink-0 text-warm-300 group-hover:text-warm-500 transition-colors">
                <ArrowRight size={18} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-warm-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-warm-50 px-3 text-xs text-warm-400 font-medium">of</span>
        </div>
      </div>

      <a
        href="/login"
        className="w-full flex items-center justify-center gap-2 bg-white border-2 border-warm-200 hover:border-amber-300 hover:bg-amber-50 text-warm-600 hover:text-brand-700 font-semibold py-3.5 rounded-2xl text-sm transition-all"
      >
        <LogIn size={15} />
        Inloggen met e-mail
      </a>
    </div>
  );
}
