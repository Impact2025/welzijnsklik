import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * AVG-recht op inzage: exporteer alle data van de ingelogde gebruiker.
 * GET /api/data-export
 *
 * Retourneert een JSON-bestand met alle persoonlijke gegevens.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.gebruikerId) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const userId = session.user.gebruikerId;

  const gebruiker = await prisma.gebruiker.findUnique({
    where: { id: userId },
    include: {
      organisatie: { select: { id: true, naam: true, plaats: true } },
      activiteiten: {
        include: { bewoner: { select: { naam: true } } },
        orderBy: { createdAt: "desc" },
      },
      familieVan: {
        include: { bewoner: { select: { naam: true } } },
      },
      wervingsInteresses: {
        orderBy: { createdAt: "desc" },
      },
      user: {
        select: { email: true, name: true, emailVerified: true },
      },
    },
  });

  if (!gebruiker) {
    return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
  }

  const exportData = {
    exportDatum: new Date().toISOString(),
    gebruiker: {
      id: gebruiker.id,
      naam: gebruiker.naam,
      email: gebruiker.email,
      rol: gebruiker.rol,
      aangemaaktOp: gebruiker.createdAt,
    },
    organisatie: gebruiker.organisatie,
    auth: gebruiker.user,
    activiteiten: gebruiker.activiteiten.map((a) => ({
      type: a.type,
      duurMinuten: a.duurMinuten,
      notities: a.notities,
      fotoUrl: a.fotoUrl,
      bewoner: a.bewoner.naam,
      datum: a.createdAt,
    })),
    familieKoppelingen: gebruiker.familieVan.map((f) => ({
      bewoner: f.bewoner.naam,
      relatie: f.relatie,
    })),
    wervingsInteresses: gebruiker.wervingsInteresses,
  };

  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="mijn-gegevens-${gebruiker.id}.json"`,
    },
  });
}
