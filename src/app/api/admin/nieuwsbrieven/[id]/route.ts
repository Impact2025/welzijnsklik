import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const item = await prisma.nieuwsbrief.findUnique({ where: { id } });

  if (!item) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin();
  } catch {
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
    const item = await prisma.nieuwsbrief.update({
      where: { id },
      data: { onderwerp, titel, inhoud, doelgroep, type },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("[API] nieuwsbrief update error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Database fout" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    await prisma.nieuwsbrief.delete({
      where: { id },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Database fout" }, { status: 500 });
  }
}
