import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.gebruikerId || session.user.rol !== "VRIJWILLIGER") {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
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

  const { url } = await put(filename, blob, {
    access: "public",
    contentType: "image/jpeg",
  });

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
