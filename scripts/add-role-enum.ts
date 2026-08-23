import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Voeg de nieuwe enum-waarde toe zonder de rest van het schema te raken.
  await prisma.$executeRawUnsafe(`ALTER TYPE "Rol" ADD VALUE IF NOT EXISTS 'WELZIJNSMEDEWERKER';`);
  console.log("Enum 'Rol' uitgebreid met WELZIJNSMEDEWERKER (indien nog niet bestond).");
}

main()
  .catch((e) => {
    console.error("Mislukt:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
