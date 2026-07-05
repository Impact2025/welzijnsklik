import { prisma } from "@/lib/prisma";

export interface ScoreInput {
  name: string;
  snippet?: string;
  domain?: string;
  city?: string;
}

export interface ScoreResult {
  score: number | null;
  rationale: string;
}

// Welzijnsklik scoring context
export const DEFAULT_SCORING_CONTEXT = `Je bent een lead qualifier voor Welzijnsklik. Welzijnsklik is een digitaal platform voor woonorganisaties, zorginstellingen en welzijnsorganisaties om vrijwilligers te koppelen aan bewoners voor sociale activiteiten, eenzaamheid te verminderen en verbinding te creëren.

Ideale klanten (score 8-10): woonzorgcentra, verpleeghuizen, aanleunwoningen, thuiszorgorganisaties, welzijnsstichtingen, maatschappelijke dienstverleners en gemeenten.
Minder relevant (score 0-4): commerciële bedrijven, eenmanszaken, niet-Nederlandse organisaties, organisaties zonder zorg/welzijnscomponent.`;

const BASE_PROMPT = `Geef ALLEEN geldige JSON: {"score": <0-10>, "rationale": "<max 12 woorden in het Nederlands>"}`;

export async function scoreProspect(
  input: ScoreInput,
  scoringContext = DEFAULT_SCORING_CONTEXT,
): Promise<ScoreResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { score: null, rationale: 'Geen OpenRouter key geconfigureerd' };
  }

  const userMsg = [
    `Naam: ${input.name}`,
    input.domain ? `Website: ${input.domain}` : null,
    input.city ? `Stad: ${input.city}` : null,
    input.snippet ? `Beschrijving: ${input.snippet.slice(0, 200)}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://welzijnsklik.nl',
        'X-Title': 'Welzijnsklik Lead Machine',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4.5',
        messages: [
          { role: 'system', content: `${scoringContext}\n\n${BASE_PROMPT}` },
          { role: 'user', content: userMsg },
        ],
        max_tokens: 80,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) return { score: null, rationale: 'API error' };

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    const n = Number(parsed.score);
    return {
      score: Number.isFinite(n) ? Math.max(0, Math.min(10, Math.round(n))) : null,
      rationale: String(parsed.rationale ?? 'Score niet beschikbaar').slice(0, 120),
    };
  } catch {
    return { score: null, rationale: 'Scoren mislukt — handmatig beoordelen' };
  }
}

export async function scoreMany(
  inputs: ScoreInput[],
  scoringContext = DEFAULT_SCORING_CONTEXT,
  concurrency = 5,
): Promise<ScoreResult[]> {
  const results: ScoreResult[] = new Array(inputs.length);
  const queue = inputs.map((input, i) => ({ input, i }));

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift()!;
      results[item.i] = await scoreProspect(item.input, scoringContext);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, inputs.length) }, worker));
  return results;
}
