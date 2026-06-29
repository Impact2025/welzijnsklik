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
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    email: "coordinator@demeerwende.nl",
    label: "Coördinator",
    beschrijving: "Dashboard, bewoners beheren, briefjes, team",
    naam: "Petra van den Berg",
    icon: LayoutDashboard,
    bg: "bg-violet-50 border-violet-200",
    hoverBg: "hover:bg-violet-100",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    badge: "bg-violet-600",
  },
  {
    email: "vrijwilliger@demeerwende.nl",
    label: "Vrijwilliger",
    beschrijving: "Activiteiten registreren, foto's maken",
    naam: "Jan de Vries",
    icon: Heart,
    bg: "bg-emerald-50 border-emerald-200",
    hoverBg: "hover:bg-emerald-100",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badge: "bg-emerald-600",
  },
  {
    email: "familie@example.nl",
    label: "Familie",
    beschrijving: "Tijdlijn van activiteiten, meehelpen",
    naam: "Maria Jansen",
    icon: UserCheck,
    bg: "bg-sky-50 border-sky-200",
    hoverBg: "hover:bg-sky-100",
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
      const res = await signIn("dev-login", {
        email,
        redirect: false,
      });
      if (res?.error) {
        setError(`Fout: ${res.error}`);
        setLoading(null);
        return;
      }
      router.push("/");
    } catch (err) {
      setError(`Onverwachte fout: ${err}`);
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-red-700 text-sm font-medium">{error}</p>
          <p className="text-red-500 text-xs mt-1">
            Zijn de demo-accounts al ingezaaid? Draai <code className="bg-red-100 px-1.5 py-0.5 rounded">npm run db:seed</code>.
          </p>
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
              className={`w-full flex items-center gap-4 border-2 rounded-2xl p-4 text-left transition-all disabled:opacity-60 ${acc.bg} ${acc.hoverBg} hover:shadow-md group`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl ${acc.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                {isLoading ? (
                  <Loader2 size={22} className={`${acc.iconColor} animate-spin`} />
                ) : (
                  <Icon size={22} className={acc.iconColor} />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900">{acc.naam}</p>
                  <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${acc.badge}`}>
                    {acc.label}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">{acc.beschrijving}</p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 text-neutral-300 group-hover:text-neutral-500 transition-colors">
                <ArrowRight size={18} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#faf8f5] px-3 text-xs text-neutral-400 font-medium">
            of
          </span>
        </div>
      </div>

      <a
        href="/login"
        className="w-full flex items-center justify-center gap-2 bg-white border-2 border-neutral-200 hover:border-amber-300 hover:bg-amber-50 text-neutral-600 hover:text-amber-700 font-semibold py-3.5 rounded-2xl text-sm transition-all"
      >
        <LogIn size={15} />
        Inloggen met e-mail
      </a>
    </div>
  );
}
