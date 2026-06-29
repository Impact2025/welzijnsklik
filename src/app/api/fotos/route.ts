import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Fotoproxy — serveert foto's alleen als de ingelogde gebruiker er recht op heeft.
 *
 * Dit vervangt directe Vercel Blob URLs naar de client door een gecontroleerd endpoint.
 * URL-formaat: /api/fotos?url=<blob-url>&bewonerId=<id>
 *
 * Toegangsregels:
 * - VRIJWILLIGER: mag foto's zien van bewoners binnen eigen organisatie met toestemming
 * - COORDINATOR: mag alle foto's van eigen organisatie zien
 * - FAMILIE: mag foto's zien van gekoppelde bewoners
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.gebruikerId) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const blobUrl = searchParams.get("url");
  const bewonerId = searchParams.get("bewonerId");

  if (!blobUrl || !bewonerId) {
    return NextResponse.json({ error: "url en bewonerId zijn verplicht" }, { status: 400 });
  }

  // Alleen Vercel Blob URLs toestaan
  if (!blobUrl.startsWith("https://") || !blobUrl.includes(".public.blob.vercel-storage.com")) {
    return NextResponse.json({ error: "Ongeldige URL" }, { status: 400 });
  }

  // Organisatie van de ingelogde gebruiker
  const gebruiker = await prisma.gebruiker.findUnique({
    where: { id: session.user.gebruikerId },
    select: { organisatieId: true, rol: true },
  });

  if (!gebruiker) {
    return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
  }

  const { organisatieId, rol } = gebruiker;

  // Check of bewoner in dezelfde organisatie zit
  const bewoner = await prisma.bewoner.findFirst({
    where: { id: bewonerId, organisatieId },
    select: { toestemmingFotos: true },
  });

  if (!bewoner) {
    return NextResponse.json({ error: "Bewoner niet gevonden" }, { status: 404 });
  }

  // Coördinators en vrijwilligers mogen bij bewoners met toestemming
  if (rol === "COORDINATOR" || rol === "VRIJWILLIGER") {
    if (!bewoner.toestemmingFotos && rol === "VRIJWILLIGER") {
      return NextResponse.json({ error: "Toestemming ingetrokken" }, { status: 403 });
    }
    // Proxy: haal de blob op en stuur door
    return proxyBlob(blobUrl);
  }

  // Familie: check koppeling
  if (rol === "FAMILIE") {
    const koppeling = await prisma.familieKoppeling.findFirst({
      where: { gebruikerId: session.user.gebruikerId, bewonerId },
    });
    if (!koppeling) {
      return NextResponse.json({ error: "Geen toegang tot deze bewoner" }, { status: 403 });
    }
    if (!bewoner.toestemmingFotos) {
      return NextResponse.json({ error: "Toestemming ingetrokken" }, { status: 403 });
    }
    return proxyBlob(blobUrl);
  }

  return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
}

async function proxyBlob(blobUrl: string) {
  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      return NextResponse.json({ error: "Foto niet beschikbaar" }, { status: 404 });
    }

    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "image/jpeg",
        "Content-Length": response.headers.get("content-length") ?? String(blob.size),
        "Cache-Control": "private, max-age=3600",
        // Voorkom dat de blob URL in de browser-navigatie blijft hangen
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return NextResponse.json({ error: "Foto kon niet worden opgehaald" }, { status: 502 });
  }
}
