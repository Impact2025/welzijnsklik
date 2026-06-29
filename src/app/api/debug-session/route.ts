import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Alleen beschikbaar in development — verwijdert zichzelf in productie-build
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Niet beschikbaar" }, { status: 404 });
  }
  const session = await auth();
  return NextResponse.json(session);
}
