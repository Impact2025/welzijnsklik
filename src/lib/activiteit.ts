import type { LucideIcon } from "lucide-react";
import {
  MapPin,
  Coffee,
  Users2,
  Gamepad2,
  BookOpen,
  Music,
  ShoppingBag,
  Star,
} from "lucide-react";

// ─── Type ──────────────────────────────────────────────────────────────────

export interface ActiviteitConfig {
  label: string;
  icon: LucideIcon;
  kleur: string;
  bg: string;      // voor de ronde icoon-badge (geen border)
  btn: string;     // voor de inactieve form-knop (wel border)
  actief: string;  // voor de actieve form-knop
}

// ─── Data (single source of truth) ─────────────────────────────────────────

const ALLE_ACTIVITEITEN: ActiviteitConfig[] = [
  {
    label: "Wandelen",
    icon: MapPin,
    kleur: "text-emerald-600",
    bg: "bg-emerald-50",
    btn: "bg-emerald-50 border-emerald-200 text-emerald-600",
    actief: "bg-emerald-600 text-white border-emerald-600",
  },
  {
    label: "Koffiedrinken",
    icon: Coffee,
    kleur: "text-amber-600",
    bg: "bg-amber-50",
    btn: "bg-amber-50 border-amber-200 text-amber-600",
    actief: "bg-amber-600 text-white border-amber-600",
  },
  {
    label: "Gezelschap",
    icon: Users2,
    kleur: "text-sky-600",
    bg: "bg-sky-50",
    btn: "bg-sky-50 border-sky-200 text-sky-600",
    actief: "bg-sky-600 text-white border-sky-600",
  },
  {
    label: "Spelletjes",
    icon: Gamepad2,
    kleur: "text-purple-600",
    bg: "bg-purple-50",
    btn: "bg-purple-50 border-purple-200 text-purple-600",
    actief: "bg-purple-600 text-white border-purple-600",
  },
  {
    label: "Lezen",
    icon: BookOpen,
    kleur: "text-indigo-600",
    bg: "bg-indigo-50",
    btn: "bg-indigo-50 border-indigo-200 text-indigo-600",
    actief: "bg-indigo-600 text-white border-indigo-600",
  },
  {
    label: "Muziek",
    icon: Music,
    kleur: "text-pink-600",
    bg: "bg-pink-50",
    btn: "bg-pink-50 border-pink-200 text-pink-600",
    actief: "bg-pink-600 text-white border-pink-600",
  },
  {
    label: "Boodschappen",
    icon: ShoppingBag,
    kleur: "text-orange-600",
    bg: "bg-orange-50",
    btn: "bg-orange-50 border-orange-200 text-orange-600",
    actief: "bg-orange-600 text-white border-orange-600",
  },
  {
    label: "Anders",
    icon: Star,
    kleur: "text-neutral-500",
    bg: "bg-neutral-100",
    btn: "bg-neutral-100 border-neutral-200 text-neutral-500",
    actief: "bg-neutral-700 text-white border-neutral-700",
  },
];

// Record voor lookup (display-pagina's)
export const ACTIVITEIT_ICON = Object.fromEntries(
  ALLE_ACTIVITEITEN.map((a) => [a.label, { icon: a.icon, kleur: a.kleur, bg: a.bg }])
) as Record<string, { icon: LucideIcon; kleur: string; bg: string }>;

// Array voor de form-component (volledige config)
export const ACTIVITEIT_TYPES = ALLE_ACTIVITEITEN;

// ─── Duren ─────────────────────────────────────────────────────────────────

export const DUUR_OPTIES = ["15", "30", "45", "60", "90", "120"];

export function formatDuur(minuten: number): string {
  return minuten >= 60 ? `${minuten / 60}u` : `${minuten}m`;
}

// ─── Datum helpers ─────────────────────────────────────────────────────────

export function formatDatum(
  d: Date,
  opt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
): string {
  return d.toLocaleDateString("nl-NL", opt);
}

// ─── Periode-groepering (agenda, hulp gevraagd) ────────────────────────────
// Groepeert een chronologisch gesorteerde lijst in "Deze week", "Volgende
// week" en daarna per maand, zodat lange lijsten overzichtelijk blijven.

export interface Periode<T> {
  label: string;
  items: T[];
}

export function groepeerPerPeriode<T>(
  items: T[],
  getDatum: (item: T) => Date
): Periode<T>[] {
  const nu = new Date();
  const vandaag = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
  const dagVanWeek = (vandaag.getDay() + 6) % 7; // maandag = 0
  const startVolgendeWeek = new Date(vandaag);
  startVolgendeWeek.setDate(vandaag.getDate() - dagVanWeek + 7);
  const startWeekDaarna = new Date(startVolgendeWeek);
  startWeekDaarna.setDate(startVolgendeWeek.getDate() + 7);

  const groepen = new Map<string, T[]>();
  const volgorde: string[] = [];

  for (const item of items) {
    const d = getDatum(item);
    let label: string;
    if (d < startVolgendeWeek) {
      label = "Deze week";
    } else if (d < startWeekDaarna) {
      label = "Volgende week";
    } else {
      const maandLabel = d.toLocaleDateString("nl-NL", { month: "long" });
      const naam = maandLabel.charAt(0).toUpperCase() + maandLabel.slice(1);
      label = d.getFullYear() !== nu.getFullYear() ? `${naam} ${d.getFullYear()}` : naam;
    }
    if (!groepen.has(label)) {
      groepen.set(label, []);
      volgorde.push(label);
    }
    groepen.get(label)!.push(item);
  }

  return volgorde.map((label) => ({ label, items: groepen.get(label)! }));
}
