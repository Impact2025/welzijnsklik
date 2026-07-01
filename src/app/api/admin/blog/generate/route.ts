import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/ai-client";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { prompt } = await request.json();

  try {
    const content = await generateContent({ prompt, type: "blog" });
    return NextResponse.json({ content });
  } catch (error) {
    console.error("[API] blog generate error:", error);
    return NextResponse.json({ error: "AI generatie fout" }, { status: 500 });
  }
}
