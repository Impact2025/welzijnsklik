-- AlterTable
ALTER TABLE "User" ADD COLUMN "password" TEXT;

-- CreateTable
CREATE TABLE "RegistratieToken" (
    "id" TEXT NOT NULL,
    "gebruikerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistratieToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistratieToken_token_key" ON "RegistratieToken"("token");

-- CreateIndex
CREATE INDEX "RegistratieToken_token_idx" ON "RegistratieToken"("token");

-- AddForeignKey
ALTER TABLE "RegistratieToken" ADD CONSTRAINT "RegistratieToken_gebruikerId_fkey" FOREIGN KEY ("gebruikerId") REFERENCES "Gebruiker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
