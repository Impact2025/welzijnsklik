import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { optimizeSEO } from "@/lib/ai-client";
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

  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });

  if (!post) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const formData = await request.formData();
  const titel = formData.get("titel") as string;
  const slug = formData.get("slug") as string;
  const inhoud = formData.get("inhoud") as string;
  const samenvatting = (formData.get("samenvatting") as string) || null;
  const focusKeyword = (formData.get("focusKeyword") as string) || null;
  const seoTitle = (formData.get("seoTitle") as string) || null;
  const seoDescription = (formData.get("seoDescription") as string) || null;
  const publish = formData.get("publish") === "true";

  if (!titel || !slug || !inhoud) {
    return NextResponse.json({ error: "Ontbrekende verplichte velden" }, { status: 400 });
  }

  let seoData = null;
  if (!seoTitle && !seoDescription && focusKeyword) {
    try {
      seoData = await optimizeSEO({ titel, inhoud, focusKeyword });
    } catch {
      // SEO optimalisatie is optioneel
    }
  }

  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        titel,
        slug,
        inhoud,
        samenvatting,
        focusKeyword,
        seoTitle: seoTitle || seoData?.seoTitle || null,
        seoDescription: seoDescription || seoData?.seoDescription || null,
        status: publish ? "GEPUBLICEERD" : "CONCEPT",
        gepubliceerdOp: publish ? new Date() : null,
        updatedBy: session.user.naam ?? session.user.email ?? "onbekend",
      },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error("[API] blog update error:", error);
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
    await prisma.blogPost.delete({
      where: { id },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Database fout" }, { status: 500 });
  }
}
