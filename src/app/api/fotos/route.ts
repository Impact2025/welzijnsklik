import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Fotoproxy — serveert foto's alleen als de ingelogde gebruiker er recht op heeft.
 *
 * Foto's worden private opgeslagen in Vercel Blob; de onderliggende blob is niet
 * publiek raadpleegbaar. Deze proxy haalt de foto server-side op via de tokenized
 * Blob-URL en stuurt hem door na een autorisatiecheck.
 *
 * URL-formaat: /api/fotos?url=<tokenized-blob-url>&kind=<activiteit|hulp|profiel>&id=<ownerId>
 *
 * Toegangsregels (allemaal binnen de eigen organisatie):
 * - kind=activiteit: id = bewonerId
 *     - COORDINATOR: alle foto's van eigen organisatie
 *     - VRIJWILLIGER: alleen als bewoner toestemmingFotos heeft
 *     - FAMILIE: alleen bij gekoppelde bewoner + toestemming
 * - kind=hulp: id = hulpGevraagdId
 *     - COORDINATOR / VRIJWILLIGER: eigen organisatie
 *     - FAMILIE: geen toegang (intern bord)
 * - kind=profiel: id = gebruikerId
 *     - Iedereen binnen dezelfde organisatie mag de profielfoto zien
 */

type FotoKind = "activiteit" | "hulp" | "profiel";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.gebruikerId) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const blobUrl = searchParams.get("url");
  const kind = (searchParams.get("kind") ?? "activiteit") as FotoKind;
  const id = searchParams.get("id");

  if (!blobUrl || !id) {
    return NextResponse.json({ error: "url en id zijn verplicht" }, { status: 400 });
  }

  // Alleen tokenized/private Vercel Blob URLs toestaan
  if (!blobUrl.startsWith("https://") || !blobUrl.includes("blob.vercel-storage.com")) {
    return NextResponse.json({ error: "Ongeldige URL" }, { status: 400 });
  }

  const gebruiker = await prisma.gebruiker.findUnique({
    where: { id: session.user.gebruikerId },
    select: { organisatieId: true, rol: true },
  });

  if (!gebruiker) {
    return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
  }

  const { organisatieId, rol } = gebruiker;
  const isVrijwilliger = rol === "VRIJWILLIGER";
  const isFamilie = rol === "FAMILIE";

  if (kind === "activiteit") {
    const bewoner = await prisma.bewoner.findFirst({
      where: { id, organisatieId },
      select: { toestemmingFotos: true },
    });
    if (!bewoner) {
      return NextResponse.json({ error: "Bewoner niet gevonden" }, { status: 404 });
    }
    if (isVrijwilliger && !bewoner.toestemmingFotos) {
      return NextResponse.json({ error: "Toestemming ingetrokken" }, { status: 403 });
    }
    if (isFamilie) {
      const koppeling = await prisma.familieKoppeling.findFirst({
        where: { gebruikerId: session.user.gebruikerId, bewonerId: id },
      });
      if (!koppeling) {
        return NextResponse.json({ error: "Geen toegang tot deze bewoner" }, { status: 403 });
      }
      if (!bewoner.toestemmingFotos) {
        return NextResponse.json({ error: "Toestemming ingetrokken" }, { status: 403 });
      }
    }
    return serve(blobUrl, organisatieId, session.user.gebruikerId!, id);
  }

  if (kind === "hulp") {
    const hulp = await prisma.hulpGevraagd.findFirst({
      where: { id, organisatieId },
      select: { id: true },
    });
    if (!hulp) {
      return NextResponse.json({ error: "Hulp-vraag niet gevonden" }, { status: 404 });
    }
    if (isFamilie) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }
    return serve(blobUrl, organisatieId, session.user.gebruikerId!, id);
  }

  if (kind === "profiel") {
    const eigenaar = await prisma.gebruiker.findFirst({
      where: { id, organisatieId },
      select: { id: true },
    });
    if (!eigenaar) {
      return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
    }
    return serve(blobUrl, organisatieId, session.user.gebruikerId!, id);
  }

  return NextResponse.json({ error: "Onbekend foto-type" }, { status: 400 });
}

async function serve(blobUrl: string, organisatieId: string, gebruikerId: string, bewonerId?: string) {
  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      return NextResponse.json({ error: "Foto niet beschikbaar" }, { status: 404 });
    }

    // Inzage-audit-trail (best-effort)
    await prisma.toegangLog
      .create({
        data: { organisatieId, gebruikerId, bewonerId, actie: "FOTO_BEKEKEN", pad: blobUrl.slice(0, 200) },
      })
      .catch(() => {});

    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "image/jpeg",
        "Content-Length": response.headers.get("content-length") ?? String(blob.size),
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return NextResponse.json({ error: "Foto kon niet worden opgehaald" }, { status: 502 });
  }
}
