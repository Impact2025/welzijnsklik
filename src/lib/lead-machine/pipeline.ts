import { discoverOrganizations } from './discovery';
import { scrapeMany } from './scraper';
import { scoreMany, DEFAULT_SCORING_CONTEXT } from './scorer';
import { prisma } from '@/lib/prisma';
import type { SearchResult } from './types';

export interface RunSearchOptions {
  query: string;
  maxResults?: number;
  scoringContext?: string;
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`)
      .hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

export async function runLeadSearch({
  query,
  maxResults = 10,
  scoringContext = DEFAULT_SCORING_CONTEXT,
}: RunSearchOptions): Promise<SearchResult[]> {
  const limit = Math.min(Math.max(Number(maxResults) || 10, 1), 30);

  // 1 — Discover organizations via DuckDuckGo/Brave
  const discovered = await discoverOrganizations(query.trim(), limit);
  if (discovered.length === 0) return [];

  // 2 — Scrape contact info from each website
  const contactMap = await scrapeMany(
    discovered.map((d) => ({ kvkNumber: d.domain, website: d.url })),
    5,
  );

  // 3 — AI score all organizations
  const scores = await scoreMany(
    discovered.map((d) => ({ name: d.name, domain: d.domain, snippet: d.snippet })),
    scoringContext,
    5,
  );

  // 4 — Check which domains are already saved
  const existingLeads = await prisma.lead.findMany({
    where: {
      website: {
        in: discovered.map((d) => d.url),
      },
    },
    select: { website: true },
  });
  const savedDomains = new Set(
    existingLeads.map((l) => hostnameOf(l.website ?? '')).filter(Boolean) as string[],
  );

  // 5 — Assemble + sort by score desc
  const results: SearchResult[] = discovered.map((d, i) => {
    const contact = contactMap.get(d.domain) ?? {};
    const score = scores[i];
    return {
      kvkNumber: d.domain,
      name: d.name,
      website: d.url,
      email: contact.email,
      phone: contact.phone,
      aiScore: score.score ?? undefined,
      aiRationale: score.rationale,
      alreadySaved: savedDomains.has(d.domain),
      sbiDescription: d.snippet?.slice(0, 150),
    };
  });

  results.sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
  return results;
}

// Persist a search result as a lead
export async function saveSearchResult(r: SearchResult): Promise<string | null> {
  if (!r.name) return null;

  try {
    const domain = r.website ? hostnameOf(r.website) : null;

    // Check for existing lead by website domain
    if (domain) {
      const existing = await prisma.lead.findFirst({
        where: {
          website: { contains: domain },
        },
      });

      if (existing) {
        await prisma.lead.update({
          where: { id: existing.id },
          data: {
            email: r.email ?? existing.email,
            telefoon: r.phone ?? existing.telefoon,
            aiScore: r.aiScore ?? existing.aiScore,
            aiRationale: r.aiRationale ?? existing.aiRationale,
            sbiBeschrijving: r.sbiDescription ?? existing.sbiBeschrijving,
            website: r.website ?? existing.website,
          },
        });
        return existing.id;
      }
    }

    const created = await prisma.lead.create({
      data: {
        naam: null,
        organisatie: r.name,
        email: r.email ?? '',
        telefoon: r.phone ?? null,
        website: r.website ?? null,
        aiScore: r.aiScore ?? null,
        aiRationale: r.aiRationale ?? null,
        sbiBeschrijving: r.sbiDescription ?? null,
        status: 'nieuw',
        scrapedAt: r.email || r.phone ? new Date() : null,
        scoredAt: r.aiScore != null ? new Date() : null,
      },
    });

    return created.id;
  } catch (error) {
    console.error('saveSearchResult error:', error);
    return null;
  }
}
