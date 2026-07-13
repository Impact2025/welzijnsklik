import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.gebruikerId || session.user.rol !== "VRIJWILLIGER") {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  // Rate limit: max 10 uploads per 5 minuten per vrijwilliger
  const rl = checkRateLimit(`upload:${session.user.gebruikerId}`, { max: 10, windowSeconds: 300 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Te veel uploads. Probeer het over 5 minuten opnieuw." },
      {
        status: 429,
        headers: { "Retry-After": "300", "X-RateLimit-Remaining": "0" },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const bewonerId = searchParams.get("bewonerId");

  if (!bewonerId) {
    return NextResponse.json({ error: "bewonerId ontbreekt" }, { status: 400 });
  }

  // Server-side toestemmingscheck — wordt altijd uitgevoerd, ongeacht wat de client stuurt
  const bewoner = await prisma.bewoner.findFirst({
    where: {
      id: bewonerId,
      organisatieId: session.user.organisatieId,
    },
    select: { toestemmingFotos: true },
  });

  if (!bewoner) {
    return NextResponse.json(
      { error: "Bewoner niet gevonden" },
      { status: 404 }
    );
  }

  if (!bewoner.toestemmingFotos) {
    // Hard weigeren — niet alleen UI verbergen
    return NextResponse.json(
      { error: "Geen toestemming voor foto-opslag voor deze bewoner" },
      { status: 403 }
    );
  }

  const blob = await request.blob();

  if (!blob || blob.size === 0) {
    return NextResponse.json({ error: "Geen bestand ontvangen" }, { status: 400 });
  }

  // Max 5 MB
  if (blob.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Foto te groot (max 5 MB)" }, { status: 413 });
  }

  const timestamp = Date.now();
  const filename = `activiteiten/${bewonerId}/${timestamp}.jpg`;

  let url: string;
  try {
    ({ url } = await put(filename, blob, {
      access: "private",
      contentType: "image/jpeg",
      addRandomSuffix: true,
    }));
  } catch (err) {
    console.error("[upload-foto] Vercel Blob put() mislukt:", err);
    const errorMsg = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.json(
      { error: "Foto opslaan mislukt. Probeer het opnieuw.", details: errorMsg },
      { status: 500 }
    );
  }

  // AVG: log elke fotoupload
  await prisma.activiteitLog.create({
    data: {
      bewonerId,
      vrijwilligerId: session.user.gebruikerId!,
      actie: "FOTO_UPLOAD",
      details: url,
    },
  }).catch(() => {
    // Loggen mag niet de upload breken
    console.warn("[upload-foto] Kon activiteitLog niet aanmaken");
  });

  return NextResponse.json({ url });
}
