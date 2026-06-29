"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

interface Props {
  error?: string;
  callbackUrl?: string;
  isDev?: boolean;
}

const DEV_ACCOUNTS = [
  {
    email: "coordinator@demeerwende.nl",
    label: "Coördinator",
    naam: "Petra van den Berg",
    kleur: "bg-violet-50 border-violet-200 text-violet-700",
    dot: "bg-violet-400",
  },
  {
    email: "vrijwilliger@demeerwende.nl",
    label: "Vrijwilliger",
    naam: "Jan de Vries",
    kleur: "bg-emerald-50 border-emerald-200 text-emerald-700",
    dot: "bg-emerald-400",
  },
  {
    email: "familie@example.nl",
    label: "Familie",
    naam: "Maria Jansen",
    kleur: "bg-sky-50 border-sky-200 text-sky-700",
    dot: "bg-sky-400",
  },
];

export default function LoginForm({ error: _error, callbackUrl, isDev }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLoading, setDevLoading] = useState<string | null>(null);
  const [devError, setDevError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("resend", {
      email,
      callbackUrl: callbackUrl ?? "/",
      redirect: false,
    });
    setSent(true);
    setLoading(false);
  }

  async function handleDevLogin(devEmail: string) {
    setDevLoading(devEmail);
    setDevError(null);
    try {
      const res = await signIn("dev-login", {
        email: devEmail,
        redirect: false,
      });
      if (res?.error) {
        setDevError(`Fout: ${res.error}`);
        setDevLoading(null);
        return;
      }
      router.push(callbackUrl ?? "/");
    } catch (err) {
      setDevError(`Onverwachte fout: ${err}`);
      setDevLoading(null);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4 space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-2xl">
          <Mail size={22} className="text-amber-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Check je e-mail</h2>
          <p className="text-neutral-500 text-sm mt-1">
            We hebben een inloglink gestuurd naar{" "}
            <span className="font-medium text-gray-800">{email}</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {isDev && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest px-0.5">
            Demo accounts
          </p>
          {devError && (
            <p className="text-red-600 text-xs bg-red-50 rounded-xl p-3 border border-red-100">{devError}</p>
          )}
          {DEV_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              disabled={devLoading !== null}
              onClick={() => handleDevLogin(acc.email)}
              className={`w-full flex items-center gap-3 border rounded-2xl px-4 py-3 text-sm transition-all disabled:opacity-50 hover:shadow-sm ${acc.kleur}`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${acc.dot}`} />
              <span className="font-semibold flex-1 text-left">{acc.naam}</span>
              <span className="text-xs opacity-70 font-medium">
                {devLoading === acc.email ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  acc.label
                )}
              </span>
            </button>
          ))}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-100" />
            </div>
            <div className="relative flex justify-center text-xs text-neutral-400 bg-white px-2">
              of log in met e-mail
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {_error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-xl p-3 border border-red-100">
            Er is iets misgegaan. Probeer opnieuw.
          </p>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            E-mailadres
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@organisatie.nl"
              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-neutral-50"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-2xl text-sm transition-colors disabled:opacity-60 shadow-sm"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Stuur inloglink
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
