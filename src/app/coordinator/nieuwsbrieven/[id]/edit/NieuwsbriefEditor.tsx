"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Image as ImageIcon,
  Type,
  Send,
  Check,
  Eye,
  Users,
  AlertTriangle,
} from "lucide-react";
import { getFotoUrl } from "@/lib/foto";
import { markdownNaarHtml } from "@/lib/markdown";
import { RichTextField } from "./RichTextField";
import {
  saveNieuwsbriefDraft,
  addActiviteitBlok,
  addTekstBlok,
  addAfbeeldingBlok,
  updateBlok,
  removeBlok,
  reorderBlok,
  verstuurNieuwsbrief,
  verstuurTestNieuwsbrief,
} from "@/lib/actions/nieuwsbrieven";

interface Blok {
  id: string;
  type: "activiteit" | "tekst" | "afbeelding";
  kop: string;
  tekst: string;
  fotoUrl: string | null;
  vrijwilligerNaam: string | null;
  bewonerNaam: string | null;
  bronActiviteitId: string | null;
}

interface Activiteit {
  id: string;
  type: string;
  notities: string | null;
  fotoUrl: string;
  bewonerNaam: string;
  vrijwilligerNaam: string;
  createdAt: string;
  gekozen: boolean;
}

interface DraftInfo {
  id: string;
  titel: string;
  intro: string;
  doelgroep: string[];
  status: string;
  verstuurtAantal: number;
  verzondenOp: string | null;
}

function mdPreview(src: string): string {
  // Minimal client-side preview mirror of lib/markdown.ts (escaped, no raw HTML)
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc(src)
    .replace(/^###\s+(.*)$/gm, "<strong>$1</strong>")
    .replace(/^##\s+(.*)$/gm, "<strong>$1</strong>")
    .replace(/^&gt;\s?(.*)$/gm, "<em>$1</em>")
    .replace(/^[-*]\s+(.*)$/gm, "• $1")
    .replace(/^\d+\.\s+(.*)$/gm, "• $1")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\n/g, "<br>");
}

export function NieuwsbriefEditor({
  draft: initDraft,
  blokken: initBlokken,
  recenteActiviteiten,
}: {
  draft: DraftInfo;
  blokken: Blok[];
  recenteActiviteiten: Activiteit[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftInfo>(initDraft);
  const [blokken, setBlokken] = useState<Blok[]>(initBlokken);
  const [activiteiten, setActiviteiten] = useState<Activiteit[]>(recenteActiviteiten);
  const [openTab, setOpenTab] = useState<"bewerk" | "preview">("bewerk");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showVerstuur, setShowVerstuur] = useState(false);
  const [verstuurd, setVerstuurd] = useState(false);

  const verzonden = draft.status === "verzonden";

  function toggleDoelgroep(g: string) {
    setDraft((d) => {
      const heeft = d.doelgroep.includes(g);
      return {
        ...d,
        doelgroep: heeft ? d.doelgroep.filter((x) => x !== g) : [...d.doelgroep, g],
      };
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("id", draft.id);
      fd.set("titel", draft.titel);
      fd.set("intro", draft.intro);
      draft.doelgroep.forEach((g) => fd.append("doelgroep", g));
      await saveNieuwsbriefDraft(fd);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  }

  async function voegActiviteitToe(a: Activiteit) {
    setBusyId(a.id);
    setError(null);
    try {
      const blok = await addActiviteitBlok(draft.id, a.id);
      if (blok) setBlokken((list) => [...list, blok as Blok]);
      setActiviteiten((list) => list.map((x) => (x.id === a.id ? { ...x, gekozen: true } : x)));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toevoegen mislukt");
    } finally {
      setBusyId(null);
    }
  }

  async function voegTekstToe() {
    setBusyId("tekst");
    setError(null);
    try {
      const blok = await addTekstBlok(draft.id);
      setBlokken((list) => [...list, blok as Blok]);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toevoegen mislukt");
    } finally {
      setBusyId(null);
    }
  }

  async function voegAfbeeldingToe() {
    setBusyId("afbeelding");
    setError(null);
    try {
      const blok = await addAfbeeldingBlok(draft.id);
      setBlokken((list) => [...list, blok as Blok]);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toevoegen mislukt");
    } finally {
      setBusyId(null);
    }
  }

  // Upload een eigen foto naar een PUBLIEKE blob en koppel die aan een blok.
  async function uploadFotoVoorBlok(b: Blok, file: File) {
    setBusyId(`up-${b.id}`);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload-nieuwsbrief-foto", {
        method: "POST",
        body: file,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Upload mislukt");
      }
      const { url } = await res.json();
      await updateBlokFoto(b.id, url);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload mislukt");
    } finally {
      setBusyId(null);
    }
  }

  async function updateBlokFoto(blokId: string, fotoUrl: string) {
    const fd = new FormData();
    fd.set("fotoUrl", fotoUrl);
    await updateBlok(blokId, fd);
  }

  async function updateBlokVeld(b: Blok, veld: "kop" | "tekst", waarde: string) {
    setBlokken((list) => list.map((x) => (x.id === b.id ? { ...x, [veld]: waarde } : x)));
    const fd = new FormData();
    fd.set("kop", veld === "kop" ? waarde : b.kop);
    fd.set("tekst", veld === "tekst" ? waarde : b.tekst);
    await updateBlok(b.id, fd);
  }

  async function verwijderBlok(b: Blok) {
    setBusyId(b.id);
    try {
      await removeBlok(b.id);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function verplaats(b: Blok, richting: "omhoog" | "omlaag") {
    setBusyId(b.id);
    try {
      await reorderBlok(b.id, richting);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function verstuur() {
    setBusyId("verstuur");
    setError(null);
    try {
      await verstuurNieuwsbrief(draft.id);
      setVerstuurd(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verzenden mislukt");
      setShowVerstuur(false);
    } finally {
      setBusyId(null);
    }
  }

  async function verstuurTest() {
    setBusyId("test");
    setError(null);
    try {
      const res = await verstuurTestNieuwsbrief(draft.id);
      setError(null);
      alert(`Test verzonden naar ${res.naar}. Controleer je inbox (incl. spam).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Test verzenden mislukt");
    } finally {
      setBusyId(null);
    }
  }

  if (verstuurd) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-10 text-center">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Nieuwsbrief verzonden</h2>
        <p className="text-warm-600 mt-1">
          De nieuwsbrief is verstuurd naar {draft.doelgroep.length} doelgroep(en).
        </p>
        <a
          href="/coordinator/nieuwsbrieven"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
        >
          Terug naar overzicht
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 lg:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-warm-500 uppercase tracking-wider mb-1">
              Titel
            </label>
            <input
              value={draft.titel}
              disabled={verzonden}
              onChange={(e) => setDraft((d) => ({ ...d, titel: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-warm-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || verzonden}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-brand-200 text-brand-700 rounded-xl font-semibold text-sm hover:bg-amber-50 transition-colors disabled:opacity-50"
            >
              <Save size={15} /> {saving ? "Bezig…" : "Opslaan"}
            </button>
            <button
              onClick={() => setOpenTab(openTab === "bewerk" ? "preview" : "bewerk")}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-warm-200 text-warm-700 rounded-xl font-semibold text-sm hover:bg-warm-50 transition-colors"
            >
              <Eye size={15} /> {openTab === "bewerk" ? "Preview" : "Bewerken"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-500 uppercase tracking-wider mb-1">
            Intro (optioneel)
          </label>
          <textarea
            value={draft.intro}
            disabled={verzonden}
            onChange={(e) => setDraft((d) => ({ ...d, intro: e.target.value }))}
            rows={2}
            placeholder="Een korte inleiding bovenaan de nieuwsbrief…"
            className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-warm-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-500 uppercase tracking-wider mb-2">
            Verstuur naar
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "FAMILIE", label: "Familie" },
              { key: "VRIJWILLIGER", label: "Vrijwilligers" },
            ].map((g) => {
              const actief = draft.doelgroep.includes(g.key);
              return (
                <button
                  key={g.key}
                  type="button"
                  disabled={verzonden}
                  onClick={() => toggleDoelgroep(g.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                    actief
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-warm-600 border-warm-200 hover:bg-warm-50"
                  }`}
                >
                  <Users size={14} />
                  {g.label}
                  {actief && <Check size={13} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {verzonden && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
          <Check size={15} /> Deze nieuwsbrief is verzonden op{" "}
          {draft.verzondenOp ? new Date(draft.verzondenOp).toLocaleString("nl-NL") : "onbekend"} naar{" "}
          {draft.verstuurtAantal} ontvangers. Bewerken is niet meer mogelijk.
        </div>
      )}

      {openTab === "preview" ? (
        <PreviewPane draft={draft} blokken={blokken} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-[15px]">Inhoud nieuwsbrief</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={voegTekstToe}
                  disabled={verzonden || busyId === "tekst"}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-warm-200 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-50 transition-colors disabled:opacity-50"
                >
                  <Type size={13} /> Tekstblok
                </button>
                <button
                  onClick={voegAfbeeldingToe}
                  disabled={verzonden || busyId === "afbeelding"}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-warm-200 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-50 transition-colors disabled:opacity-50"
                >
                  <ImageIcon size={13} /> Afbeelding
                </button>
              </div>
            </div>

            {blokken.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-warm-200 p-8 text-center">
                <ImageIcon size={22} className="text-warm-300 mx-auto mb-2" />
                <p className="text-sm text-warm-500">
                  Nog geen blokken. Kies hieronder activiteiten van vrijwilligers of voeg een tekstblok toe.
                </p>
              </div>
            )}

            {blokken.map((b, i) => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-warm-400">
                    {b.type === "activiteit" ? "Activiteit met foto" : b.type === "afbeelding" ? "Eigen afbeelding" : "Tekstbericht"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => verplaats(b, "omhoog")}
                      disabled={i === 0 || busyId === b.id || verzonden}
                      className="p-1.5 rounded-lg hover:bg-warm-100 text-warm-500 disabled:opacity-30"
                      title="Omhoog"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      onClick={() => verplaats(b, "omlaag")}
                      disabled={i === blokken.length - 1 || busyId === b.id || verzonden}
                      className="p-1.5 rounded-lg hover:bg-warm-100 text-warm-500 disabled:opacity-30"
                      title="Omlaag"
                    >
                      <ChevronDown size={15} />
                    </button>
                    <button
                      onClick={() => verwijderBlok(b)}
                      disabled={busyId === b.id || verzonden}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-30"
                      title="Verwijderen"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {b.type === "activiteit" && b.fotoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getFotoUrl(b.fotoUrl, b.bronActiviteitId ?? "") ?? ""}
                    alt=""
                    className="w-full h-44 object-cover rounded-xl mb-3 bg-warm-100"
                  />
                )}

                <input
                  value={b.kop}
                  disabled={verzonden}
                  onChange={(e) => updateBlokVeld(b, "kop", e.target.value)}
                  placeholder="Kop (optioneel)"
                  className="w-full px-3 py-1.5 rounded-lg border border-warm-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 mb-2 disabled:bg-warm-50"
                />
                {b.type === "tekst" ? (
                  <RichTextField
                    value={b.tekst}
                    disabled={verzonden}
                    onChange={(v) => updateBlokVeld(b, "tekst", v)}
                    rows={4}
                    placeholder="Schrijf je bericht…"
                  />
                ) : (
                  <textarea
                    value={b.tekst}
                    disabled={verzonden}
                    onChange={(e) => updateBlokVeld(b, "tekst", e.target.value)}
                    rows={2}
                    placeholder="Bijschrift"
                    className="w-full px-3 py-1.5 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-warm-50"
                  />
                )}
                {b.type === "tekst" && b.tekst && (
                  <p
                    className="text-xs text-warm-500 mt-1.5"
                    dangerouslySetInnerHTML={{ __html: mdPreview(b.tekst) }}
                  />
                )}
                {/* Eigen foto uploaden (afbeelding-blok, of optioneel bij tekstblok) */}
                {(b.type === "afbeelding" || b.type === "tekst") && (
                  <div className="mt-2">
                    {b.fotoUrl ? (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.fotoUrl}
                          alt=""
                          className="w-full h-44 object-cover rounded-xl bg-warm-100"
                        />
                        {!verzonden && (
                          <button
                            type="button"
                            onClick={() => updateBlokFoto(b.id, "")}
                            className="absolute top-2 right-2 bg-white/90 rounded-lg p-1.5 text-red-600 hover:bg-white shadow-sm"
                            title="Foto verwijderen"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ) : (
                      !verzonden && (
                        <label className="flex flex-col items-center justify-center gap-1.5 w-full px-3 py-4 rounded-xl border border-dashed border-warm-300 text-warm-500 hover:bg-warm-50 cursor-pointer transition-colors">
                          <ImageIcon size={18} />
                          <span className="text-xs font-medium">
                            {b.type === "afbeelding" ? "Kies een afbeelding" : "Voeg een foto toe"}
                          </span>
                          <span className="text-[10px]">JPG, PNG, WebP of GIF · max 5 MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={busyId === `up-${b.id}`}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadFotoVoorBlok(b, file);
                            }}
                          />
                        </label>
                      )
                    )}
                    {busyId === `up-${b.id}` && (
                      <p className="text-xs text-warm-500 mt-1">Bezig met uploaden…</p>
                    )}
                  </div>
                )}

                {b.type === "activiteit" && (
                  <p className="text-xs text-warm-400 mt-2">
                    {b.vrijwilligerNaam}
                    {b.vrijwilligerNaam && b.bewonerNaam ? " · " : ""}
                    {b.bewonerNaam}
                  </p>
                )}
              </div>
            ))}

            {!verzonden && (
              <>
                <button
                  onClick={() => setShowVerstuur(true)}
                  disabled={blokken.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-500 text-white rounded-2xl font-semibold text-sm hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  <Send size={16} /> Klaar? Verstuur nieuwsbrief
                </button>
                <button
                  onClick={verstuurTest}
                  disabled={blokken.length === 0 || busyId === "test"}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-warm-200 text-warm-700 rounded-2xl font-semibold text-sm hover:bg-warm-50 transition-colors disabled:opacity-50"
                >
                  {busyId === "test" ? "Bezig…" : "Verstuur test naar mijzelf"}
                </button>
              </>
            )}
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-semibold text-gray-900 text-[15px]">Kies activiteiten van vrijwilligers</h2>
            <p className="text-xs text-warm-500">Alleen activiteiten mét foto en met toestemming.</p>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {activiteiten.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-warm-200 p-6 text-center text-sm text-warm-500">
                  Geen activiteiten met foto gevonden.
                </div>
              )}
              {activiteiten.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-neutral-100 p-2.5 flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getFotoUrl(a.fotoUrl, a.id) ?? ""}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-warm-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {a.vrijwilligerNaam} bij {a.bewonerNaam}
                    </p>
                    <p className="text-[11px] text-warm-400 truncate">{a.type}</p>
                    <button
                      onClick={() => voegActiviteitToe(a)}
                      disabled={a.gekozen || busyId === a.id || verzonden}
                      className={`mt-1.5 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        a.gekozen
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-brand-500 text-white hover:bg-brand-600"
                      } disabled:opacity-50`}
                    >
                      {a.gekozen ? (
                        <>
                          <Check size={11} /> Gekozen
                        </>
                      ) : (
                        <>
                          <Plus size={11} /> Kies
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showVerstuur && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowVerstuur(false)}
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={18} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900">Nieuwsbrief versturen?</h3>
            </div>
            <div className="text-sm text-warm-600 space-y-1">
              <p>
                <strong className="text-gray-900">{draft.titel}</strong>
              </p>
              <p>
                Naar:{" "}
                <strong className="text-gray-900">
                  {draft.doelgroep
                    .map((g) => (g === "FAMILIE" ? "Familie" : "Vrijwilligers"))
                    .join(" + ")}
                </strong>
              </p>
              <p>
                {blokken.length} blok{blokken.length !== 1 ? "ken" : ""} · {draft.doelgroep.length} doelgroep
                (en)
              </p>
            </div>
            <p className="text-xs text-warm-500">
              {"Foto's worden tijdelijk publiek gemaakt zodat ontvangers ze in de e-mail kunnen openen. Dit"}
              {"kan niet ongedaan worden gemaakt."}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowVerstuur(false)}
                className="flex-1 px-4 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-semibold text-sm hover:bg-neutral-200 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={verstuur}
                disabled={busyId === "verstuur"}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors disabled:opacity-60"
              >
                <Send size={15} /> {busyId === "verstuur" ? "Bezig…" : "Verstuur nu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewPane({ draft, blokken }: { draft: DraftInfo; blokken: Blok[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
      <div className="bg-brand-500 px-6 py-5 text-center">
        <p className="text-white/80 text-xs">Welzijnsklik</p>
        <h1 className="text-white font-bold text-lg">{draft.titel || "Nieuwsbrief"}</h1>
      </div>
      <div className="p-6 space-y-4">
        {draft.intro && <p className="text-sm text-warm-700 leading-relaxed">{draft.intro}</p>}
        {blokken.length === 0 && (
          <p className="text-sm text-warm-400 italic">Nog geen blokken toegevoegd.</p>
        )}
        {blokken.map((b) => (
          <div key={b.id} className="border-b border-warm-100 pb-4 last:border-0">
            {b.type === "activiteit" && b.fotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getFotoUrl(b.fotoUrl, b.bronActiviteitId ?? "") ?? ""}
                alt=""
                className="w-full h-48 object-cover rounded-xl mb-3 bg-warm-100"
              />
            )}
            {b.type === "afbeelding" && b.fotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.fotoUrl}
                alt=""
                className="w-full h-48 object-cover rounded-xl mb-3 bg-warm-100"
              />
            )}
            {b.type === "tekst" && b.fotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.fotoUrl}
                alt=""
                className="w-full h-40 object-cover rounded-xl mb-3 bg-warm-100"
              />
            )}
            {b.kop && <h2 className="font-semibold text-gray-900 text-[15px] mb-1">{b.kop}</h2>}
            {b.tekst && b.type === "tekst" ? (
              <div
                className="text-sm text-warm-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: markdownNaarHtml(b.tekst) }}
              />
            ) : (
              b.tekst && (
                <p className="text-sm text-warm-700 leading-relaxed whitespace-pre-wrap">{b.tekst}</p>
              )
            )}
            {b.type === "activiteit" && (b.vrijwilligerNaam || b.bewonerNaam) && (
              <p className="text-xs text-warm-400 mt-2">
                {b.vrijwilligerNaam}
                {b.vrijwilligerNaam && b.bewonerNaam ? " · " : ""}
                {b.bewonerNaam}
              </p>
            )}
          </div>
        ))}
        <p className="text-xs text-warm-400 pt-2">Met vriendelijke groet, het team van Welzijnsklik</p>
      </div>
    </div>
  );
}
