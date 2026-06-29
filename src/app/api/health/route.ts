import { validateEnv } from "@/lib/env";
import { NextResponse } from "next/server";

/**
 * Health check endpoint.
 * GET /api/health
 *
 * Gebruik door Vercel, monitoring, en load balancers.
 */
export async function GET() {
  const envWarnings = await validateEnv();

  const status = envWarnings.length === 0 ? "healthy" : "degraded";
  const statusCode = envWarnings.length === 0 ? 200 : 200; // nog steeds 200, alleen warnings

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "0.1.0",
      environment: process.env.NODE_ENV ?? "development",
      warnings: envWarnings.length > 0 ? envWarnings : undefined,
    },
    { status: statusCode }
  );
}
