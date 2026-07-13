/**
 * Genereer een proxy-URL voor een foto zodat toegangscontrole wordt afgedwongen.
 * Gebruik dit in plaats van directe Vercel Blob URLs naar de client te sturen.
 *
 * Foto's worden private opgeslagen; de onderliggende blob is niet publiek
 * raadpleegbaar. De proxy haalt de foto server-side op na een autorisatiecheck.
 */
export type FotoKind = "activiteit" | "hulp" | "profiel";

export function getFotoUrl(
  blobUrl: string | null | undefined,
  id: string,
  kind: FotoKind = "activiteit",
): string | null {
  if (!blobUrl || !id) return null;

  // Alleen Vercel Blob URLs door de proxy; andere URLs ongewijzigd teruggeven
  if (!blobUrl.includes("blob.vercel-storage.com")) return blobUrl;

  const params = new URLSearchParams({ url: blobUrl, kind, id });
  return `/api/fotos?${params.toString()}`;
}
