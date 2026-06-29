/**
 * Genereer een proxy-URL voor een foto zodat toegangscontrole wordt afgedwongen.
 * Gebruik dit in plaats van directe Vercel Blob URLs naar de client te sturen.
 */
export function getFotoUrl(blobUrl: string | null | undefined, bewonerId: string): string | null {
  if (!blobUrl || !bewonerId) return null;

  // Alleen proxie voor Vercel Blob URLs
  if (!blobUrl.includes(".public.blob.vercel-storage.com")) {
    return blobUrl; // fallback voor andere URLs
  }

  const params = new URLSearchParams({ url: blobUrl, bewonerId });
  return `/api/fotos?${params.toString()}`;
}
