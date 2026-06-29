"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, CheckCircle2, X } from "lucide-react";

interface Props {
  organisatieId: string;
}

const ROL_OPTIES = [
  { value: "VRIJWILLIGER", label: "Vrijwilliger" },
  { value: "FAMILIE", label: "Familie" },
  { value: "COORDINATOR", label: "Coördinator" },
];

export function UitnodigForm({ organisatieId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [naam, setNaam] = useState("");
  const [rol, setRol] = useState("VRIJWILLIGER");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !naam.trim()) {
      setError("Vul alle velden in.");
      return;
    }
    startTransition(async () => {
      try {
        const { koppelGebruikerAanOrganisatie } = await import("@/lib/actions/organisaties");
        // We moeten eerst de user vinden — we laten de uitnodiging via Resend verlopen
        // en de coordinator krijgt een bevestiging.
        // Voor nu gebruiken we signIn om een magic link te sturen.
        const { signIn } = await import("next-auth/react");
        const res = await signIn("resend", {
          email,
          redirect: false,
        });
        if (res?.error) {
          setError(`Kon geen e-mail sturen: ${res.error}`);
          return;
        }
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setEmail("");
          setNaam("");
          setRol("VRIJWILLIGER");
          router.refresh();
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors shadow-sm"
      >
        <UserPlus size={14} />
        Uitnodigen
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Nieuwe gebruiker uitnodigen</h2>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-2xl">
              <CheckCircle2 size={22} className="text-emerald-600" />
            </div>
            <p className="font-semibold text-gray-900">Uitnodiging verstuurd!</p>
            <p className="text-sm text-neutral-500">{email} ontvangt een inloglink.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <p className="text-red-600 text-xs bg-red-50 rounded-xl p-3 border border-red-100">{error}</p>
            )}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                E-mailadres
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@organisatie.nl"
                className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Volledige naam
              </label>
              <input
                type="text"
                required
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                placeholder="bijv. Jan de Vries"
                className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Rol
              </label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
              >
                {ROL_OPTIES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <UserPlus size={15} />
                  Uitnodigen
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
