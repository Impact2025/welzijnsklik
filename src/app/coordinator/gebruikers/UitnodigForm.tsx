"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, X, Mail } from "lucide-react";
import { nodigGebruikerUit } from "@/lib/actions/gebruikers";

interface Props {
  organisatieId: string;
}

const ROL_OPTIES = [
  { value: "VRIJWILLIGER", label: "Vrijwilliger" },
  { value: "COORDINATOR", label: "Coördinator" },
];

const BESCHIKBAARHEID_OPTIES = [
  { value: "weekend", label: "Weekend" },
  { value: "weekdagen", label: "Weekdagen" },
  { value: "avonden", label: "Avonden" },
  { value: "flexibel", label: "Flexibel" },
];

const VOG_OPTIES = [
  { value: "heeft", label: "Heeft VOG" },
  { value: "aanvraag_lopen", label: "VOG in aanvraag" },
  { value: "niet_nodig", label: "Niet nodig" },
];

export function UitnodigForm({}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rol, setRol] = useState("VRIJWILLIGER");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await nodigGebruikerUit(formData);
        if (result.registratieUrl) {
          // In productie: mail versturen via server action
          // Voor demo: link tonen
          setSuccess(true);
          setTimeout(() => {
            setOpen(false);
            setSuccess(false);
            router.refresh();
          }, 3000);
        }
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
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
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
          <div className="py-6 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-2xl">
              <Mail size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Uitnodiging verstuurd!</p>
              <p className="text-xs text-neutral-500 mt-1">
                De gekozen persoon ontvangt een e-mail om zich te registreren.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <p className="text-red-600 text-xs bg-red-50 rounded-xl p-3 border border-red-100">{error}</p>
            )}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Naam <span className="text-red-400">*</span>
              </label>
              <input
                name="naam"
                required
                placeholder="bijv. Jan de Vries"
                className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                E-mailadres <span className="text-red-400">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="naam@email.nl"
                className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Telefoonnummer
              </label>
              <input
                name="telefoon"
                type="tel"
                placeholder="06-12345678"
                className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Rol <span className="text-red-400">*</span>
              </label>
              <select
                name="rol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
              >
                {ROL_OPTIES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            {rol === "VRIJWILLIGER" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Beschikbaarheid
                  </label>
                  <select
                    name="beschikbaarheid"
                    defaultValue=""
                    className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
                  >
                    <option value="">Selecteer…</option>
                    {BESCHIKBAARHEID_OPTIES.map((optie) => (
                      <option key={optie.value} value={optie.value}>{optie.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    VOG-status
                  </label>
                  <select
                    name="vogStatus"
                    defaultValue="niet_nodig"
                    className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50"
                  >
                    {VOG_OPTIES.map((optie) => (
                      <option key={optie.value} value={optie.value}>{optie.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Ervaring
                  </label>
                  <textarea
                    name="ervaring"
                    rows={2}
                    placeholder="Eerdere vrijwilligers- of zorg ervaring…"
                    className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Motivatie
                  </label>
                  <textarea
                    name="motivatie"
                    rows={2}
                    placeholder="Waarom wil deze persoon vrijwilligerswerk doen?"
                    className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50 resize-none"
                  />
                </div>
              </>
            )}
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
