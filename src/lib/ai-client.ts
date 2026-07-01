interface OpenRouterResponse {
  choices: { message: { content: string } }[];
}

export async function optimizeSEO({
  titel,
  inhoud,
  focusKeyword,
}: {
  titel: string;
  inhoud: string;
  focusKeyword?: string;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is niet ingesteld");
  }

  const prompt = `Je bent een SEO-expert voor een welzijnsorganisatie. Optimaliseer deze blogpost voor zoekmachines.

Titel: ${titel}
Focus keyword: ${focusKeyword || "geen specifiek woord"}

Inhoud (eerste 1000 tekens): ${inhoud.slice(0, 1000)}

Geef suggestions voor:
1. SEO title (max 60 tekens)
2. SEO description (max 160 tekens)
3. Keywords (comma-gescheiden)
4. Content tips (max 5)

Antwoord in JSON formaat:
{
  "seoTitle": "...",
  "seoDescription": "...",
  "seoKeywords": ["...", "..."],
  "contentTips": ["...", "..."]
}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://welzijnsklik.nl",
      "X-Title": "Welzijnsklik Admin",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data: OpenRouterResponse = await response.json();
  const content = data.choices[0]?.message?.content;
  
  try {
    return JSON.parse(content || "{}");
  } catch {
    return {
      seoTitle: titel.slice(0, 60),
      seoDescription: (inhoud.slice(0, 160) || "") + "...",
      seoKeywords: [],
      contentTips: ["Controleer focus keyword in eerste alinea"],
    };
  }
}

export async function generateContent({
  prompt,
  type = "blog",
}: {
  prompt: string;
  type?: "blog" | "social" | "email";
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is niet ingesteld");
  }

  const systemPrompt = type === "blog" 
    ? "Je bent een ervaren blog schrijver voor een welzijnsorganisatie. Schrijf heldere, empathische content in het Nederlands."
    : type === "social"
    ? "Schrijf een korte, pakkende social media post in het Nederlands."
    : "Schrijf een professionele nieuwsbrief in het Nederlands.";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://welzijnsklik.nl",
      "X-Title": "Welzijnsklik Admin",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data: OpenRouterResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}
