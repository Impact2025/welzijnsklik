-- ─── Handmatige migratie: activiteiten-agenda ───────────────────────────────
-- (Het project heeft geen werkende `migrate dev`-historie; DB is ooit via db push
--  gevuld. Deze SQL is idempotent waar mogelijk en behoudt bestaande data.)

-- 1) HulpReactie: vrijwilligerId -> gebruikerId (generiek, zodat ook familie kan reageren)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'HulpReactie' AND column_name = 'vrijwilligerId'
  ) THEN
    ALTER TABLE "HulpReactie" RENAME COLUMN "vrijwilligerId" TO "gebruikerId";
  END IF;
END $$;

-- 2) Nieuwe tabel: GeplandeActiviteit (de echte agenda-events)
CREATE TABLE IF NOT EXISTS "GeplandeActiviteit" (
  "id"            TEXT PRIMARY KEY,
  "organisatieId" TEXT NOT NULL,
  "titel"         TEXT NOT NULL,
  "type"          TEXT,
  "beschrijving"  TEXT,
  "locatie"       TEXT,
  "datum"         TIMESTAMP(3) NOT NULL,
  "duurMinuten"   INTEGER NOT NULL DEFAULT 60,
  "aangemaaktDoor" TEXT NOT NULL,
  "hulpGevraagdId" TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GeplandeActiviteit_organisatieId_fkey"
    FOREIGN KEY ("organisatieId") REFERENCES "Organisatie"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "GeplandeActiviteit_hulpGevraagdId_fkey"
    FOREIGN KEY ("hulpGevraagdId") REFERENCES "HulpGevraagd"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Unieke koppeling: een activiteit koppelt aan hoogstens één hulp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'GeplandeActiviteit_hulpGevraagdId_key'
  ) THEN
    ALTER TABLE "GeplandeActiviteit" ADD CONSTRAINT "GeplandeActiviteit_hulpGevraagdId_key" UNIQUE ("hulpGevraagdId");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "GeplandeActiviteit_organisatieId_idx" ON "GeplandeActiviteit"("organisatieId");
CREATE INDEX IF NOT EXISTS "GeplandeActiviteit_datum_idx" ON "GeplandeActiviteit"("datum");
