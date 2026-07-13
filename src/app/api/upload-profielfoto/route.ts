import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.gebruikerId) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const blob = await request.blob();

  if (!blob || blob.size === 0) {
    return NextResponse.json({ error: "Geen bestand ontvangen" }, { status: 400 });
  }

  if (blob.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Foto te groot (max 5 MB)" }, { status: 413 });
  }

  const timestamp = Date.now();
  const filename = `profielfoto/${session.user.gebruikerId}/${timestamp}.jpg`;

  let url: string;
  try {
    ({ url } = await put(filename, blob, {
      access: "private",
      contentType: "image/jpeg",
      addRandomSuffix: true,
    }));
  } catch (err) {
    console.error("[upload-profielfoto] put() mislukt:", err);
    return NextResponse.json({ error: "Foto opslaan mislukt. Probeer het opnieuw." }, { status: 500 });
  }

  await prisma.gebruiker.update({
    where: { id: session.user.gebruikerId },
    data: { profielFoto: url },
  });

  return NextResponse.json({ url });
}
