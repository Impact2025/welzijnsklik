import { auth } from "@/auth";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const rl = checkRateLimit(`upload-hulp:${session.user.gebruikerId}`, { max: 20, windowSeconds: 300 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Te veel uploads. Probeer het later opnieuw." }, { status: 429 });
  }

  const blob = await request.blob();

  if (!blob || blob.size === 0) {
    return NextResponse.json({ error: "Geen bestand ontvangen" }, { status: 400 });
  }

  if (blob.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Foto te groot (max 5 MB)" }, { status: 413 });
  }

  const timestamp = Date.now();
  const filename = `hulp-gevraagd/${session.user.organisatieId}/${timestamp}.jpg`;

  let url: string;
  try {
    ({ url } = await put(filename, blob, { access: "public", contentType: "image/jpeg" }));
  } catch (err) {
    console.error("[upload-hulp-foto] Vercel Blob put() mislukt:", err);
    return NextResponse.json({ error: "Foto opslaan mislukt. Probeer het opnieuw." }, { status: 500 });
  }

  return NextResponse.json({ url });
}
