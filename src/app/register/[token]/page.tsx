"use client";

import { Check, Loader2, Lock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { voltooiRegistratie } from "@/lib/actions/gebruikers";

export default function RegisterPage() {
  const router = useRouter();
  const { token } = useParams<{ token: string }>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const wachtwoord = formData.get("wachtwoord") as string;

    startTransition(async () => {
      try {
        await voltooiRegistratie(token, wachtwoord);
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      }
    });
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl">
            <Check size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Registratie voltooid!</h1>
          <p className="text-neutral-500">Je wordt doorgestuurd naar de login...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center mx-auto">
            <img src="/logo.png" alt="Welzijnsklik" className="w-16 h-16 rounded-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welzijnsklik</h1>
            <p className="text-neutral-500 text-sm mt-1">Stel je wachtwoord in</p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 space-y-4">
          {error && (
            <p className="text-red-600 text-xs bg-red-50 rounded-xl p-3 border border-red-100">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Wachtwoord <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  name="wachtwoord"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimaal 6 tekens"
                  className="w-full border border-neutral-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
            >
              {isPending ? <Loader2 size={15} className="animate-spin" /> : "Account activeren"}
            </button>
          </form>

          <p className="text-xs text-neutral-400 text-center">
            Na het activeren kun je inloggen met je e-mail en dit wachtwoord.
          </p>
        </div>
      </div>
    </main>
  );
}