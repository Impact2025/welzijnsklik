import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { optimizeSEO } from "@/lib/ai-client";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
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
  const samenvatting = formData.get("samenvatting") as string;
  const tagsInput = formData.get("tags") as string;
  const focusKeyword = formData.get("focusKeyword") as string;

  if (!titel || !slug || !inhoud) {
    return NextResponse.json({ error: "Ontbrekende verplichte velden" }, { status: 400 });
  }

  try {
    let seoData = null;
    try {
      seoData = await optimizeSEO({ titel, inhoud, focusKeyword });
    } catch (e) {
      console.log("[API] SEO optimalisatie overgeslagen");
    }

    const blogPost = await prisma.blogPost.create({
      data: {
        organisatieId: session.user.organisatieId!,
        titel,
        slug,
        inhoud,
        samenvatting: samenvatting || undefined,
        status: "CONCEPT",
        seoTitle: (formData.get("seoTitle") as string) || seoData?.seoTitle,
        seoDescription: (formData.get("seoDescription") as string) || seoData?.seoDescription,
        seoKeywords: tagsInput 
          ? tagsInput.split(",").map(t => t.trim()).filter(Boolean)
          : seoData?.seoKeywords || [],
        focusKeyword: focusKeyword || seoData?.seoKeywords?.[0],
        updatedBy: session.user.naam ?? session.user.email ?? "onbekend",
      },
    });

    if (tagsInput) {
      const tagNamen = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
      for (const tagNaam of tagNamen) {
        const slugTag = tagNaam.toLowerCase().replace(/\s+/g, "-");
        const tag = await prisma.blogTag.upsert({
          where: { slug: slugTag },
          update: {},
          create: {
            organisatieId: session.user.organisatieId!,
            naam: tagNaam,
            slug: slugTag,
          },
        });

        await prisma.blogPostTag.create({
          data: {
            postId: blogPost.id,
            tagId: tag.id,
          },
        });
      }
    }

    return NextResponse.json(blogPost, { status: 201 });
  } catch (error) {
    console.error("[API] blog create error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Database fout" }, { status: 500 });
  }
}
