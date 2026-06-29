/**
 * Foto purge — cron job script.
 * Loopt dagelijks en markeert/verwijdert foto's waarvan de toestemming
 * is ingetrokken, of die ouder zijn dan 90 dagen bij bewoners zonder
 * actieve toestemming.
 *
 * Dit script draait via Hermes cron:action='create'
 */
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { del } from "@vercel/blob";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("[foto-purge] Start…");

  // Stap 1: vind alle activiteiten met foto's van bewoners zonder toestemming
  const teVerwijderen = await prisma.activiteit.findMany({
    where: {
      fotoUrl: { not: null },
      bewoner: { toestemmingFotos: false },
    },
    select: { id: true, fotoUrl: true, bewonerId: true },
  });

  console.log(`[foto-purge] ${teVerwijderen.length} foto's gevonden voor bewoners zonder toestemming`);

  for (const item of teVerwijderen) {
    if (!item.fotoUrl) continue;

    try {
      // Verwijder uit Vercel Blob
      await del(item.fotoUrl);
      // Verwijder URL uit database
      await prisma.activiteit.update({
        where: { id: item.id },
        data: { fotoUrl: null },
      });
      // Log de purge
      await prisma.activiteitLog.create({
        data: {
          bewonerId: item.bewonerId,
          vrijwilligerId: "__purge__",
          actie: "FOTO_PURGE",
          details: item.fotoUrl,
        },
      });
      console.log(`[foto-purge] Verwijderd: ${item.fotoUrl}`);
    } catch (err) {
      console.error(`[foto-purge] Fout bij ${item.fotoUrl}:`, err);
    }
  }

  // Stap 2: verwijder foto's ouder dan 90 dagen (onafhankelijk van toestemming)
  const grens = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const oudeFotos = await prisma.activiteit.findMany({
    where: {
      fotoUrl: { not: null },
      createdAt: { lt: grens },
    },
    select: { id: true, fotoUrl: true, bewonerId: true },
  });

  console.log(`[foto-purge] ${oudeFotos.length} foto's ouder dan 90 dagen`);

  for (const item of oudeFotos) {
    if (!item.fotoUrl) continue;
    try {
      await del(item.fotoUrl);
      await prisma.activiteit.update({
        where: { id: item.id },
        data: { fotoUrl: null },
      });
      console.log(`[foto-purge] Oude foto verwijderd: ${item.fotoUrl}`);
    } catch (err) {
      console.error(`[foto-purge] Fout bij ${item.fotoUrl}:`, err);
    }
  }

  console.log("[foto-purge] Gereed");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
