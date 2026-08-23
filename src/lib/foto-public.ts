/**
 * Helper om een private Vercel Blob-foto tijdelijk publiek beschikbaar te maken
 * voor gebruik in een e-mailnieuwsbrief.
 *
 * Activiteit-foto's worden private opgeslagen (access: "private") — de onderliggende
 * blob-URL is niet publiek raadpleegbaar en mag dus niet direct in een <img src>
 * in een e-mail worden geplaatst. Bij het verzenden van een nieuwsbrief kopiëren we
 * de geselecteerde foto's naar een publieke blob (access: "public") met een
 * vervaldatum in de toekomst, zodat de ontvangers ze wél kunnen laden.
 *
 * We kopiëren (i.p.v. de private blob public te maken) zodat de AVG-private
 * bronfoto ongewijzigd beschermd blijft.
 */
import { copy, put } from "@vercel/blob";
import { del } from "@vercel/blob";

const PUBLIC_PREFIX = "nieuwsbrief-public";

/**
 * Maak een publieke kopie van een (private) blob-URL.
 * Gebruikt `copy()` als de URL een Vercel Blob-token-URL is (efficiënt, server-side),
 * anders wordt de bytes alsnog opgehaald en ge-upload.
 * Retourneert de publieke URL, of null als het mislukt (failure-tolerant: de
 * nieuwsbrief verstuurt dan gewoon zonder die foto).
 */
export async function maakPubliekeFotoKopie(
  privateBlobUrl: string,
  organisatieId: string
): Promise<string | null> {
  if (!privateBlobUrl) return null;
  if (!privateBlobUrl.includes("blob.vercel-storage.com")) {
    // Geen blob-URL (bijv. externe/legacy) — gebruik direct.
    return privateBlobUrl;
  }

  const ext = privateBlobUrl.includes(".png") ? "png" : "jpg";
  const pad = `${PUBLIC_PREFIX}/${organisatieId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  try {
    // Probeer eerst een server-side copy (snel, geen download).
    const { url } = await copy(privateBlobUrl, pad, {
      access: "public",
      contentType: ext === "png" ? "image/png" : "image/jpeg",
      addRandomSuffix: true,
    });
    return url;
  } catch {
    // Fallback: download + upload.
    try {
      const res = await fetch(privateBlobUrl);
      if (!res.ok) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      const { url } = await put(pad, buf, {
        access: "public",
        contentType: res.headers.get("content-type") ?? "image/jpeg",
        addRandomSuffix: true,
      });
      return url;
    } catch {
      return null;
    }
  }
}

/** Ruim een eerder aangemaakte publieke kopie op (optioneel, bijv. na verzending bewaartermijn). */
export async function verwijderPubliekeFotoKopie(publicUrl: string): Promise<void> {
  if (!publicUrl || !publicUrl.includes("blob.vercel-storage.com")) return;
  try {
    await del(publicUrl);
  } catch {
    // Best-effort
  }
}
