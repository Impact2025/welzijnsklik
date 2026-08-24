/**
 * Gedeelde rol-helpers voor Welzijnsklik.
 *
 * Een WELZIJNSMEDEWERKER deelt dezelfde rechten en UI als een VRIJWILLIGER
 * (zelfde /vrijwilliger-routes, zelfde acties), met één uitzondering:
 * WELZIJNSMEDEWERKER mag daarnaast bewoners opzoeken via /vrijwilliger/bewoners.
 * Gebruik `isVrijwilligerRol()` bij elke autorisatiecheck in plaats van
 * `rol === "VRIJWILLIGER"`, zodat beide rollen in één keer worden gedekt.
 */

export const VRIJWILLIGER_ROLLEN = ["VRIJWILLIGER", "WELZIJNSMEDEWERKER"] as const;

export type Rol = "COORDINATOR" | "VRIJWILLIGER" | "WELZIJNSMEDEWERKER" | "FAMILIE";

export function isVrijwilligerRol(rol: string | undefined | null): boolean {
  return rol === "VRIJWILLIGER" || rol === "WELZIJNSMEDEWERKER";
}

/** Label voor in de UI (account, coordinator-overzicht, etc.). */
export const ROL_LABELS: Record<string, string> = {
  COORDINATOR: "Coördinator",
  VRIJWILLIGER: "Vrijwilliger",
  WELZIJNSMEDEWERKER: "Welzijnsmedewerker",
  FAMILIE: "Familie",
};

/** Startpagina per rol (voor de / redirect). */
export const ROL_HOME: Record<string, string> = {
  COORDINATOR: "/coordinator",
  VRIJWILLIGER: "/vrijwilliger",
  WELZIJNSMEDEWERKER: "/vrijwilliger",
  FAMILIE: "/familie",
};

/** Navigatie-badge / notificatiepad per rol. */
export const ROL_NOTIFICATIES: Record<string, string> = {
  COORDINATOR: "/coordinator/meldingen",
  VRIJWILLIGER: "/vrijwilliger/meldingen",
  WELZIJNSMEDEWERKER: "/vrijwilliger/meldingen",
  FAMILIE: "/familie/notificaties",
};

/** Rol-kleur voor badges in coordinator-overzichten. */
export const ROL_KLEUR: Record<string, string> = {
  COORDINATOR: "bg-violet-100 text-violet-700",
  VRIJWILLIGER: "bg-emerald-100 text-emerald-700",
  WELZIJNSMEDEWERKER: "bg-teal-100 text-teal-700",
  FAMILIE: "bg-sky-100 text-sky-700",
};
