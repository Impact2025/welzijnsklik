/**
 * Eenvoudige in-memory rate limiter voor Vercel Edge.
 * In productie vervangen door Vercel KV / Redis.
 * Nota: Edge Runtime heeft geen setInterval - cleanup gebeurt via lazy garbage collection.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Cleanup functie (wordt intern aangeroepen bij elke check)
function cleanupIfNeeded(now: number) {
  // Lazy cleanup: verzamel eerst keys die vervallen, verwijder daarna
  // (direct verwijderen tijdens entries() iteratie kan inconsistent gedrag geven)
  const keysToDelete: string[] = [];
  Array.from(store.entries()).forEach(([key, entry]) => {
    if (entry.resetAt < now) {
      keysToDelete.push(key);
    }
  });
  for (const key of keysToDelete) {
    store.delete(key);
  }
}

export interface RateLimitConfig {
  /** Aantal toegestane requests binnen het venster */
  max: number;
  /** Venster in seconden */
  windowSeconds: number;
}

const DEFAULTS: RateLimitConfig = { max: 5, windowSeconds: 60 };

/**
 * Check of een key (bijv. IP) gerate-limited is.
 * Geeft `{ allowed, remaining, resetAt }` terug.
 * Gebruik in Edge-middleware of server-components.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULTS
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  
  // Lazy cleanup voor Edge Runtime compatibiliteit
  cleanupIfNeeded(now);
  
  const existing = store.get(key);

  if (!existing || existing.resetAt < now) {
    // Nieuw venster
    store.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 });
    return { allowed: true, remaining: config.max - 1, resetAt: now + config.windowSeconds * 1000 };
  }

  if (existing.count >= config.max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: config.max - existing.count, resetAt: existing.resetAt };
}

/**
 * Genereer een consistente key uit een Request (gebruikt IP + path).
 */
export function keyFromRequest(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";
  const path = new URL(request.url).pathname;
  return `${ip}:${path}`;
}
