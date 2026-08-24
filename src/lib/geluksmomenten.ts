// ─── Geluksmomenten ────────────────────────────────────────────────────────
// Vertaalt vrijwilligersuren + welzijnscheck-uitkomsten naar één impactcijfer:
// hoeveel van de gedraaide uren waren (naar schatting) een positieve ervaring
// voor zowel vrijwilliger als bewoner.
//
// Bron: de maandelijkse welzijnscheck die vrijwilligers invullen (score 1-5,
// zie src/lib/welzijnscheck.ts). Die score wordt hier vertaald naar een
// rood/oranje/groen-verdeling (RAG), waarna geldt:
//
//   gewogen welzijnsscore = (groen×1.0 + oranje×0.5 + rood×0.0) / totaal
//   geluksmomenten        = totalUren × gewogen welzijnsscore × 5
//
// De schaalfactor 5 betekent: 1 uur vrijwilligerswerk levert maximaal 5
// geluksmomenten op (bij een volledig groene welzijnsscore).

export type RAG = "groen" | "oranje" | "rood";

export interface RAGVerdeling {
  groen: number;
  oranje: number;
  rood: number;
}

const GELUKSMOMENTEN_SCHAALFACTOR = 5;

// Score 1-5 uit de welzijnscheck → RAG-emmer.
// 1-2 = rood (aanpassingsbehoefte), 3 = oranje (mogelijke zorg), 4-5 = groen (positief).
export function scoreNaarRAG(score: number): RAG {
  if (score <= 2) return "rood";
  if (score === 3) return "oranje";
  return "groen";
}

export function totaalRAG(v: RAGVerdeling): number {
  return v.groen + v.oranje + v.rood;
}

// (groen×1.0 + oranje×0.5 + rood×0.0) / totaal — 0 als er geen data is.
export function gewogenWelzijnsscore(v: RAGVerdeling): number {
  const totaal = totaalRAG(v);
  if (totaal === 0) return 0;
  return (v.groen * 1.0 + v.oranje * 0.5 + v.rood * 0.0) / totaal;
}

// geluksmomenten = uren × gewogen welzijnsscore × 5
export function berekenGeluksmomenten(totalUren: number, v: RAGVerdeling): number {
  if (totalUren <= 0) return 0;
  return totalUren * gewogenWelzijnsscore(v) * GELUKSMOMENTEN_SCHAALFACTOR;
}

export interface RAGPercentages {
  groen: number;
  oranje: number;
  rood: number;
}

// Percentages voor de tooltip — 0 over de hele linie als er geen data is.
export function ragPercentages(v: RAGVerdeling): RAGPercentages {
  const totaal = totaalRAG(v);
  if (totaal === 0) return { groen: 0, oranje: 0, rood: 0 };
  return {
    groen: Math.round((v.groen / totaal) * 100),
    oranje: Math.round((v.oranje / totaal) * 100),
    rood: Math.round((v.rood / totaal) * 100),
  };
}

// Voorspelling voor de lopende periode: extrapoleer het tot-nu-toe-tempo
// (uren per verstreken dag) naar de volledige periode, met dezelfde gewogen
// welzijnsscore. Bij een afgeronde periode is voorspeld gelijk aan bereikt.
export function voorspelGeluksmomenten(
  totalUrenTotNu: number,
  v: RAGVerdeling,
  periodeStart: Date,
  periodeEind: Date,
  peildatum: Date = new Date()
): number {
  const totaalDagen = Math.max(1, dagenTussen(periodeStart, periodeEind));
  const verstredenDagen = Math.min(
    totaalDagen,
    Math.max(1, dagenTussen(periodeStart, peildatum))
  );
  const voorspeldeUren = (totalUrenTotNu / verstredenDagen) * totaalDagen;
  return berekenGeluksmomenten(voorspeldeUren, v);
}

function dagenTussen(a: Date, b: Date): number {
  const MS_PER_DAG = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAG);
}
