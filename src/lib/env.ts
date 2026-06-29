/**
 * Valideer verplichte environment variabelen bij startup.
 */

const VERPLICHT: Record<string, string> = {
  DATABASE_URL: "Neon PostgreSQL connection string",
  AUTH_SECRET: "Genereer met: openssl rand -base64 32",
  NEXTAUTH_URL: "Bijv. http://localhost:3000 of https://welzijnsklik.nl",
};

const PRODUCTIE_VERPLICHT: Record<string, string> = {
  RESEND_API_KEY: "Haal op via resend.com/api-keys",
  RESEND_FROM_EMAIL: "Bijv. noreply@welzijnsklik.nl",
};

let gevalideerd = false;

export async function validateEnv(): Promise<string[]> {
  if (gevalideerd) return [];
  gevalideerd = true;

  const warnings: string[] = [];
  const isDev = process.env.NODE_ENV === "development";

  for (const [key, hint] of Object.entries(VERPLICHT)) {
    if (!process.env[key]) {
      warnings.push(`[MISS] ${key} ontbreekt — ${hint}`);
    }
  }

  if (!isDev) {
    for (const [key, hint] of Object.entries(PRODUCTIE_VERPLICHT)) {
      if (!process.env[key]) {
        warnings.push(`[MISS] ${key} ontbreekt — ${hint}`);
      }
    }
  }

  if (warnings.length > 0) {
    console.warn("\nEnvironment validatie:\n" + warnings.map((w) => `  ${w}`).join("\n") + "\n");
  } else {
    console.log("[env] Environment validatie geslaagd");
  }

  return warnings;
}
