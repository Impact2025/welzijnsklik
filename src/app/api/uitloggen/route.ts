import { signOut } from "@/auth";
import { NextResponse } from "next/server";

// Forceer uitloggen — wist sessie-cookie
export async function GET() {
  await signOut({ redirect: false });
  return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:8765"));
}
