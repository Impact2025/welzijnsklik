import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user || session.user.rol !== "COORDINATOR") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const formData = await request.formData();
  const onderwerp = formData.get("onderwerp") as string;
  const titel = formData.get("titel") as string;
  const inhoud = formData.get("inhoud") as string;
  const doelgroep = formData.get("doelgroep") as string;
  const type = (formData.get("type") as string) || "nieuwsbrief";

  if (!onderwerp || !titel || !inhoud) {
    return NextResponse.json({ error: "Ontbrekende velden" }, { status: 400 });
  }

  try {
    const nieuwsbrief = await prisma.nieuwsbrief.create({
      data: {
        organisatieId: session.user.organisatieId!,
        onderwerp,
        titel,
        inhoud,
        doelgroep,
        type,
        createdBy: session.user.naam ?? session.user.email ?? "onbekend",
        status: "CONCEPT",
      },
    });

    return NextResponse.json(nieuwsbrief, { status: 201 });
  } catch (error) {
    console.error("[API] nieuwsbrieven create error:", error);
    return NextResponse.json({ error: "Database fout" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user || session.user.rol !== "COORDINATOR") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const abonnees = await prisma.gebruiker.findMany({
    where: {
      organisatieId: session.user.organisatieId!,
    },
    select: { id: true, naam: true, email: true, rol: true },
  });

  return NextResponse.json(abonnees);
}
