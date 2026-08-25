"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { getTourSteps, TOUR_VERSION } from "./tourSteps";

const RESTART_EVENT = "welzijnsklik:start-tour";

/** Herstart de welkomsttour handmatig, bijv. vanuit een vraagteken-knop. */
export function startWelcomeTour() {
  window.dispatchEvent(new Event(RESTART_EVENT));
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function findVisibleTarget(href: string): HTMLElement | null {
  const els = document.querySelectorAll<HTMLElement>(`[data-tour-href="${href}"]`);
  for (const el of Array.from(els)) {
    if (el.offsetWidth > 0 && el.offsetHeight > 0) return el;
  }
  return null;
}

const CARD_W = 296;
const CARD_H = 190; // benadering, genoeg om binnen viewport te clampen
const MARGIN = 16;
const GAP = 14; // ruimte tussen kaart en gemarkeerd element
const ARROW = 9; // halve diagonaal van het pijltje

type Side = "right" | "left" | "bottom" | "top";

interface Placement {
  top: number;
  left: number;
  side: Side;
  /** Positie van het pijltje langs de kaartrand (px vanaf top/left, geclampt). */
  arrowOffset: number;
}

/**
 * Plaatst de kaart als een callout náást het gemarkeerde element (rechts voor
 * de sidebar, links voor iconen rechtsboven) in plaats van er zomaar overheen
 * — dat houdt het element zelf vrij en dekt minder van de pagina af. Valt
 * terug op onder/boven wanneer er zijwaarts geen ruimte is.
 */
function computePlacement(rect: Rect): Placement {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const spaceRight = vw - (rect.left + rect.width);
  const spaceLeft = rect.left;
  const spaceBelow = vh - (rect.top + rect.height);

  const need = CARD_W + GAP + MARGIN;
  let side: Side;
  if (spaceRight >= need) side = "right";
  else if (spaceLeft >= need) side = "left";
  else if (spaceBelow >= CARD_H + GAP + MARGIN) side = "bottom";
  else side = "top";

  let top: number;
  let left: number;
  if (side === "right") {
    left = rect.left + rect.width + GAP;
    top = rect.top + rect.height / 2 - CARD_H / 2;
  } else if (side === "left") {
    left = rect.left - GAP - CARD_W;
    top = rect.top + rect.height / 2 - CARD_H / 2;
  } else if (side === "bottom") {
    left = rect.left + rect.width / 2 - CARD_W / 2;
    top = rect.top + rect.height + GAP;
  } else {
    left = rect.left + rect.width / 2 - CARD_W / 2;
    top = rect.top - GAP - CARD_H;
  }

  const clampedTop = Math.max(MARGIN, Math.min(top, vh - CARD_H - MARGIN));
  const clampedLeft = Math.max(MARGIN, Math.min(left, vw - CARD_W - MARGIN));

  const arrowOffset =
    side === "right" || side === "left"
      ? Math.max(20, Math.min(rect.top + rect.height / 2 - clampedTop, CARD_H - 20))
      : Math.max(20, Math.min(rect.left + rect.width / 2 - clampedLeft, CARD_W - 20));

  return { top: clampedTop, left: clampedLeft, side, arrowOffset };
}

export function WelcomeTour({
  rol,
  naam,
  gebruikerId,
}: {
  rol: string;
  naam?: string;
  gebruikerId?: string | null;
}) {
  const steps = getTourSteps(rol, naam);
  const storageKey = gebruikerId ? `welzijnsklik:tour:${gebruikerId}:v${TOUR_VERSION}` : null;

  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  // Automatisch openen bij eerste bezoek van deze gebruiker.
  useEffect(() => {
    if (!storageKey || steps.length === 0) return;
    let seen: string | null = null;
    try {
      seen = window.localStorage.getItem(storageKey);
    } catch {
      // localStorage niet beschikbaar (privémodus e.d.) — sla de tour dan gewoon over.
      return;
    }
    if (!seen) {
      const t = setTimeout(() => {
        setStepIndex(0);
        setOpen(true);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [storageKey, steps.length]);

  // Handmatig herstarten (vraagteken-knop in de header).
  useEffect(() => {
    function onRestart() {
      setStepIndex(0);
      setOpen(true);
    }
    window.addEventListener(RESTART_EVENT, onRestart);
    return () => window.removeEventListener(RESTART_EVENT, onRestart);
  }, []);

  const measure = useCallback(() => {
    const step = steps[stepIndex];
    if (!step || !step.target) {
      setRect(null);
      return;
    }
    const el = findVisibleTarget(step.target);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [steps, stepIndex]);

  useLayoutEffect(() => {
    if (!open) return;
    let tries = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    // Eerste meting via rAF (niet synchroon in de effect-body) — daarna nog een
    // paar keer opnieuw meten, want layout/fonts kunnen net na openen schuiven.
    const rafId = requestAnimationFrame(() => {
      measure();
      intervalId = setInterval(() => {
        tries += 1;
        measure();
        if (tries > 6 && intervalId) clearInterval(intervalId);
      }, 150);
    });
    return () => {
      cancelAnimationFrame(rafId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [open, stepIndex, measure]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, measure]);

  const finish = useCallback(() => {
    setOpen(false);
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, String(Date.now()));
      } catch {
        // negeren
      }
    }
  }, [storageKey]);

  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i >= steps.length - 1) {
        finish();
        return i;
      }
      return i + 1;
    });
  }, [steps.length, finish]);

  const prev = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), []);

  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!openRef.current) return;
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish, next, prev]);

  if (!open || steps.length === 0) return null;

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const PAD = 8;

  const highlightStyle = rect
    ? {
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
        boxShadow: "0 0 0 9999px rgba(26,23,20,0.6)",
      }
    : undefined;

  const card = (
    <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-warm-200 p-4 w-full">
      <div className="flex items-center justify-between mb-2.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-600">
          <Sparkles size={13} />
          Stap {stepIndex + 1} van {steps.length}
        </span>
        <button
          onClick={finish}
          aria-label="Tour sluiten"
          className="text-warm-400 hover:text-warm-600 p-1 rounded-lg hover:bg-warm-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1.5">{step.title}</h3>
      <p className="text-sm text-warm-600 leading-relaxed mb-3.5">{step.body}</p>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === stepIndex ? "w-5 bg-brand-500" : "w-1.5 bg-warm-200"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isFirst && (
            <button
              onClick={prev}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-warm-600 hover:bg-warm-100 transition-colors"
            >
              Vorige
            </button>
          )}
          <button
            onClick={next}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors"
          >
            {isLast ? "Aan de slag" : "Volgende"}
            {!isLast && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label="Welkomsttour">
      {/* Volledige-pagina blocker: houdt de rest van de app inert tijdens de tour. */}
      <div className="absolute inset-0" />

      {rect ? (
        <div
          className="absolute rounded-2xl outline outline-2 outline-brand-500 outline-offset-2 pointer-events-none transition-all duration-300 ease-out"
          style={highlightStyle}
        />
      ) : (
        <div className="absolute inset-0 bg-warm-900/60 pointer-events-none transition-opacity duration-300" />
      )}

      {rect ? (
        (() => {
          const placement = computePlacement(rect);
          const arrowStyle: React.CSSProperties = { width: ARROW * 2, height: ARROW * 2 };
          if (placement.side === "right") {
            Object.assign(arrowStyle, {
              left: -ARROW,
              top: placement.arrowOffset - ARROW,
              borderLeft: "1px solid var(--color-warm-200)",
              borderBottom: "1px solid var(--color-warm-200)",
            });
          } else if (placement.side === "left") {
            Object.assign(arrowStyle, {
              right: -ARROW,
              top: placement.arrowOffset - ARROW,
              borderRight: "1px solid var(--color-warm-200)",
              borderTop: "1px solid var(--color-warm-200)",
            });
          } else if (placement.side === "bottom") {
            Object.assign(arrowStyle, {
              top: -ARROW,
              left: placement.arrowOffset - ARROW,
              borderTop: "1px solid var(--color-warm-200)",
              borderLeft: "1px solid var(--color-warm-200)",
            });
          } else {
            Object.assign(arrowStyle, {
              bottom: -ARROW,
              left: placement.arrowOffset - ARROW,
              borderBottom: "1px solid var(--color-warm-200)",
              borderRight: "1px solid var(--color-warm-200)",
            });
          }
          return (
            <div
              className="absolute transition-all duration-300 ease-out"
              style={{ top: placement.top, left: placement.left, width: CARD_W }}
            >
              <div className="relative">
                <div className="absolute bg-white rotate-45 pointer-events-none" style={arrowStyle} />
                {card}
              </div>
            </div>
          );
        })()
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div style={{ maxWidth: CARD_W }} className="w-full">
            {card}
          </div>
        </div>
      )}
    </div>
  );
}
