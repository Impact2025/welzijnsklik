import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/ai-client";

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user || session.user.rol !== "COORDINATOR") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { prompt } = await request.json();

  try {
    const content = await generateContent({ prompt, type: "blog" });
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("[API] blog generate error:", error);
    return NextResponse.json({ error: "AI generatie fout" }, { status: 500 });
  }
}
