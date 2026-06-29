import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Tijdelijk debug endpoint — verwijder vóór productie
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "alleen in development" }, { status: 403 });
  }
  const session = await auth();
  return NextResponse.json(session);
}
