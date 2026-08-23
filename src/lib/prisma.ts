import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

// WebSockets nodig voor Neon in Node.js-omgeving (niet in edge runtimes)
if (typeof WebSocket === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require("ws");
}

// Losse (niet-transactionele) queries via HTTP fetch i.p.v. de gepoolde
// WebSocket sturen. De Pool-WebSocket bleek tussen serverless-invocations
// in te kunnen doodlopen (Vercel freeze/Neon idle-timeout); een warme lambda
// hergebruikte daarna een dode connectie, wat "Connection closed" gaf en het
// dashboard oneindig liet hangen op de loading-skeleton. Transacties
// (prisma.$transaction) blijven de Pool/WebSocket gebruiken.
neonConfig.poolQueryViaFetch = true;

function makePrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is niet ingesteld");
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof makePrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
