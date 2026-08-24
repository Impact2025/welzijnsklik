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

const CARD_W = 336;
const MARGIN = 16;

function cardPosition(rect: Rect): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardH = 210; // benadering, genoeg om binnen viewport te clampen

  const spaceBelow = vh - (rect.top + rect.height);
  const spaceAbove = rect.top;
  const top =
    spaceBelow > cardH + MARGIN || spaceBelow > spaceAbove
      ? Math.min(rect.top + rect.height + 14, vh - cardH - MARGIN)
      : Math.max(MARGIN, rect.top - cardH - 14);

  let left = rect.left;
  if (left + CARD_W > vw - MARGIN) left = rect.left + rect.width - CARD_W;
  left = Math.max(MARGIN, Math.min(left, vw - CARD_W - MARGIN));

  return { top: Math.max(MARGIN, top), left };
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
    <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-warm-200 p-5 w-full">
      <div className="flex items-center justify-between mb-3">
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
      <p className="text-sm text-warm-600 leading-relaxed mb-4">{step.body}</p>
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
        <div
          className="absolute transition-all duration-300 ease-out"
          style={{ top: cardPosition(rect).top, left: cardPosition(rect).left, width: CARD_W }}
        >
          {card}
        </div>
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
