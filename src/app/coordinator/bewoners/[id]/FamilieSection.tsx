"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, Loader2, X, Phone, Mail, Pencil, Save } from "lucide-react";
import { nodigGebruikerUit, updateFamilielid } from "@/lib/actions/gebruikers";
import { signIn } from "next-auth/react";

interface Familielid {
  id: string;
  naam: string;
  email: string;
  telefoon: string | null;
  relatie: string;
}

const RELATIE_OPTIES = ["Kind", "Kleinkind", "Partner", "Broer/Zus", "Vriend/Vriendin", "Anders"];

function FamilieEditModal({
  bewonerId,
  lid,
  onClose,
}: {
  bewonerId: string;
  lid: Familielid;
  onClose: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const RELATIE_OPTIES = ["Kind", "Kleinkind", "Partner", "Broer/Zus", "Vriend/Vriendin", "Anders"];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateFamilielid(formData);
        onClose();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Familielid bewerken</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" name="gebruikerId" value={lid.id} />
          <input type="hidden" name="bewonerId" value={bewonerId} />
          {error && <p className="text-red-600 text-xs bg-red-50 rounded-xl p-3 border border-red-100">{error}</p>}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">Naam <span className="text-red-400">*</span></label>
            <input name="naam" required defaultValue={lid.naam}
              className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">Telefoonnummer</label>
            <input name="telefoon" type="tel" defaultValue={lid.telefoon ?? ""}
              className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">Relatie</label>
            <select name="relatie" defaultValue={lid.relatie}
              className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50">
              {RELATIE_OPTIES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button type="submit" disabled={isPending}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <><Save size={15} />Opslaan</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export function FamilieSection({
  bewonerId,
  familieleden,
}: {
  bewonerId: string;
  familieleden: Familielid[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editLid, setEditLid] = useState<Familielid | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("rol", "FAMILIE");
    formData.set("bewonerId", bewonerId);
    const email = formData.get("email") as string;

    startTransition(async () => {
      try {
        await nodigGebruikerUit(formData);
        // Stuur magic link via Auth.js
        await signIn("resend", { email, redirect: false });
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          router.refresh();
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-neutral-400" />
          <h2 className="font-semibold text-gray-900 text-[15px]">Familie</h2>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
        >
          <UserPlus size={13} />
          Toevoegen
        </button>
      </div>

      {familieleden.length === 0 ? (
        <p className="text-sm text-neutral-400">Nog geen familieleden gekoppeld.</p>
      ) : (
        <div className="divide-y divide-neutral-50 -mx-5">
          {familieleden.map((f) => (
            <div key={f.id} className="px-5 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sky-700 font-bold text-xs">
                  {f.naam.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{f.naam}</p>
                <p className="text-xs text-neutral-400">{f.relatie}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {f.telefoon && (
                  <a href={`tel:${f.telefoon}`} className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-700">
                    <Phone size={10} />
                    {f.telefoon}
                  </a>
                )}
                <a href={`mailto:${f.email}`} className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-600">
                  <Mail size={10} />
                  {f.email}
                </a>
              </div>
              <button
                onClick={() => setEditLid(f)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
              >
                <Pencil size={12} className="text-neutral-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Familielid uitnodigen</h2>
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
                  <span className="text-2xl">✓</span>
                </div>
                <p className="font-semibold text-gray-900">Uitnodiging verstuurd!</p>
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
                  <input name="naam" required placeholder="bijv. Anna de Vries"
                    className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    E-mailadres <span className="text-red-400">*</span>
                  </label>
                  <input name="email" type="email" required placeholder="anna@email.nl"
                    className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Telefoonnummer
                  </label>
                  <input name="telefoon" type="tel" placeholder="06-12345678"
                    className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Relatie <span className="text-red-400">*</span>
                  </label>
                  <select name="relatie" required
                    className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-neutral-50">
                    <option value="">Kies relatie…</option>
                    {RELATIE_OPTIES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
                >
                  {isPending ? <Loader2 size={15} className="animate-spin" /> : <>
                    <UserPlus size={15} />
                    Uitnodigen
                  </>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {editLid && (
        <FamilieEditModal
          bewonerId={bewonerId}
          lid={editLid}
          onClose={() => setEditLid(null)}
        />
      )}
    </div>
  );
}
