import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Voeg de nieuwe NieuwsbriefAbonnement-kolommen toe zonder de rest van het schema te raken.
  // IF NOT EXISTS voorkomt fouten bij heruitvoeren.
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "NieuwsbriefAbonnement"
      ADD COLUMN IF NOT EXISTS "actief" BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "afmeldToken" TEXT,
      ADD COLUMN IF NOT EXISTS "geopendOp" TIMESTAMP(3);
  `);
  // Unieke index op afmeldToken (Postgres negeert dubbele indexnamen niet automatisch,
  // dus via een probeersel in een DO-block).
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'NieuwsbriefAbonnement_afmeldToken_key'
      ) THEN
        ALTER TABLE "NieuwsbriefAbonnement" ADD CONSTRAINT "NieuwsbriefAbonnement_afmeldToken_key" UNIQUE ("afmeldToken");
      END IF;
    END $$;
  `);
  console.log("NieuwsbriefAbonnement-kolommen (actief, afmeldToken, geopendOp) toegevoegd indien nodig.");
}

main()
  .catch((e) => {
    console.error("Mislukt:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
