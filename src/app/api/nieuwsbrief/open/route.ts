import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Open-tracking pixel voor nieuwsbrieven.
 * GET /api/nieuwsbrief/open?id=<abonnementId>
 * Markeert het abonnement als geopend (best-effort, geen persoonlijke data).
 * Retourneert een 1x1 transparante GIF.
 */
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    await prisma.nieuwsbriefAbonnement
      .updateMany({
        where: { id, actief: true, geopend: false },
        data: { geopend: true, geopendOp: new Date() },
      })
      .catch(() => {});
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Content-Length": String(PIXEL.length),
    },
  });
}
