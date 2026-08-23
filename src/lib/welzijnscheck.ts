import type { WelzijnscheckStemming } from "@/generated/prisma/client";

// ─── Welzijnscheck domeinlogica (gedeeld tussen coordinator + vrijwilliger) ──
// Score 1..5 → stemming, label, kleur (badge) en een korte omschrijving.
// De coördinator wil in één oogopslag zien wie aandacht nodig heeft.

export type CheckNiveau = "kritiek" | "aandacht" | "ok";

export interface WelzijnsScoreInfo {
  score: number;
  stemming: WelzijnscheckStemming;
  label: string;
  kort: string;
  // Badge variant uit ui.tsx (default|success|warning|danger|info|violet)
  variant: "danger" | "warning" | "info" | "success";
  // Tailwind-klassen voor de grote score-chip
  chipBg: string;
  chipText: string;
  niveau: CheckNiveau;
}

export function scoreNaarStemming(score: number): WelzijnscheckStemming {
  switch (score) {
    case 1:
      return "ZEER_LAAG";
    case 2:
      return "LAAG";
    case 3:
      return "NEUTRAAL";
    case 4:
      return "GOED";
    default:
      return "UITSTEKEND";
  }
}

const SCORE_INFO: Record<number, Omit<WelzijnsScoreInfo, "score" | "stemming">> = {
  1: {
    label: "Niet goed",
    kort: "Heeft direct aandacht nodig",
    variant: "danger",
    chipBg: "bg-red-50",
    chipText: "text-red-600",
    niveau: "kritiek",
  },
  2: {
    label: "Matig",
    kort: "Even checken hoe het gaat",
    variant: "warning",
    chipBg: "bg-amber-50",
    chipText: "text-amber-600",
    niveau: "aandacht",
  },
  3: {
    label: "Gaat wel",
    kort: "Neutraal — geen actie nodig",
    variant: "info",
    chipBg: "bg-sky-50",
    chipText: "text-sky-600",
    niveau: "ok",
  },
  4: {
    label: "Goed",
    kort: "Loopt lekker",
    variant: "success",
    chipBg: "bg-emerald-50",
    chipText: "text-emerald-600",
    niveau: "ok",
  },
  5: {
    label: "Uitstekend",
    kort: "Top — stralend!",
    variant: "success",
    chipBg: "bg-emerald-50",
    chipText: "text-emerald-700",
    niveau: "ok",
  },
};

export function welzijnsInfo(score: number): WelzijnsScoreInfo {
  const clamped = Math.min(5, Math.max(1, Math.round(score)));
  const base = SCORE_INFO[clamped];
  return {
    score: clamped,
    stemming: scoreNaarStemming(clamped),
    ...base,
  };
}

// Aandachtspunten die een vrijwilliger kan aanvinken (meerkeuze).
export const AANDACHTSPUNTEN = [
  "Werkdruk / te weinig tijd",
  "Weinig contact met bewoners",
  "Mijn motivatie daalt",
  "Persoonlijke omstandigheden",
  "Onduidelijkheid over taken",
  "Behoefte aan een praatje",
] as const;

// Wordt de vrijwilliger als "aandacht nodig" beschouwd voor de coördinator?
// Score ≤ 2 = direct aandacht, score 3 = neutraal (wel zichtbaar, geen actie).
export function heeftAandachtNodig(score: number): boolean {
  return score <= 2;
}

// Hoe lang geleden mag een check zijn voordat de coördinator een nudge wil?
export const VERLOOP_DAGEN = 14;
