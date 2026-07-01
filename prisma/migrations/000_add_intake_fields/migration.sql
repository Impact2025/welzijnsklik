-- Add intake fields to Gebruiker table
ALTER TABLE "Gebruiker" ADD COLUMN "beschikbaarheid" TEXT;
ALTER TABLE "Gebruiker" ADD COLUMN "ervaring" TEXT;
ALTER TABLE "Gebruiker" ADD COLUMN "motivatie" TEXT;
ALTER TABLE "Gebruiker" ADD COLUMN "vogStatus" TEXT;

-- Set default VOG status for existing records
UPDATE "Wervingsinteresse" SET "beschikbaarheid" = '' WHERE "beschikbaarheid" IS NULL;
UPDATE "Wervingsinteresse" SET "vogStatus" = 'niet_nodig' WHERE "vogStatus" IS NULL;
UPDATE "Wervingsinteresse" SET status = 'nieuw' WHERE status IS NULL;