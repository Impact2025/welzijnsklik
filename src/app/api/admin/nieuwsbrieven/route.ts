import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const formData = await request.formData();
  const onderwerp = formData.get("onderwerp") as string;
  const titel = formData.get("titel") as string;
  const inhoud = formData.get("inhoud") as string;
  const type = (formData.get("type") as string) || "nieuwsbrief";

  if (!onderwerp || !titel || !inhoud) {
    return NextResponse.json({ error: "Ontbrekende velden" }, { status: 400 });
  }

  try {
    const nieuwsbrief = await prisma.nieuwsbrief.create({
      data: {
        onderwerp,
        titel,
        inhoud,
        doelgroep: "leads",
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
