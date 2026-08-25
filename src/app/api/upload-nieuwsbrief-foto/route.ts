import { auth } from "@/auth";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Coördinator-only upload voor nieuwsbrief-afbeeldingen.
 * Slaat op als PUBLIEKE blob (access: "public") zodat de foto direct
 * in de verzonden e-mail getoond kan worden — géén private-proxy nodig.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.gebruikerId || session.user.rol !== "COORDINATOR") {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const blob = await request.blob();
  if (!blob || blob.size === 0) {
    return NextResponse.json({ error: "Geen bestand ontvangen" }, { status: 400 });
  }
  if (blob.size > MAX_BYTES) {
    return NextResponse.json({ error: "Afbeelding te groot (max 5 MB)" }, { status: 413 });
  }
  if (!ALLOWED.includes(blob.type)) {
    return NextResponse.json(
      { error: "Alleen JPG, PNG, WebP of GIF toegestaan" },
      { status: 415 }
    );
  }

  const orgId = session.user.organisatieId ?? "org";
  const timestamp = Date.now();
  const ext = blob.type.split("/")[1] ?? "jpg";
  const filename = `nieuwsbrieven/${orgId}/${timestamp}.${ext}`;

  try {
    const { url } = await put(filename, blob, {
      access: "public",
      contentType: blob.type,
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN_PUBLIC,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload-nieuwsbrief-foto] Blob put() mislukt:", err);
    return NextResponse.json(
      { error: "Opslaan mislukt. Probeer het opnieuw." },
      { status: 500 }
    );
  }
}
