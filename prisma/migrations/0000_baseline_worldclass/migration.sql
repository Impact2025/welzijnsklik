-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE IF NOT EXISTS "Rol" AS ENUM ('COORDINATOR', 'VRIJWILLIGER', 'WELZIJNSMEDEWERKER', 'FAMILIE');

-- CreateEnum
CREATE TYPE IF NOT EXISTS "WelzijnscheckStemming" AS ENUM ('ZEER_LAAG', 'LAAG', 'NEUTRAAL', 'GOED', 'UITSTEKEND');

-- CreateTable
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Organisatie" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "plaats" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organisatie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Gebruiker" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "organisatieId" TEXT NOT NULL,
    "telefoon" TEXT,
    "voorkeurActiviteiten" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interneNotities" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "profielFoto" TEXT,
    "beschikbaarheid" TEXT,
    "ervaring" TEXT,
    "motivatie" TEXT,
    "vogStatus" TEXT,

    CONSTRAINT "Gebruiker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EmailVoorkeur" (
    "id" TEXT NOT NULL,
    "gebruikerId" TEXT NOT NULL,
    "activiteiten" BOOLEAN NOT NULL DEFAULT true,
    "wekelijkseDigest" BOOLEAN NOT NULL DEFAULT true,
    "gewijzigdOp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVoorkeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Bewoner" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "organisatieId" TEXT NOT NULL,
    "kamer" TEXT,
    "geboortedatum" TIMESTAMP(3),
    "notities" TEXT,
    "toestemmingFotos" BOOLEAN NOT NULL DEFAULT false,
    "toestemmingDoor" TEXT,
    "toestemmingDatum" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bewoner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ToestemmingLog" (
    "id" TEXT NOT NULL,
    "bewonerId" TEXT NOT NULL,
    "actie" TEXT NOT NULL,
    "door" TEXT NOT NULL,
    "uitgevoerdDoor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToestemmingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ToegangLog" (
    "id" TEXT NOT NULL,
    "organisatieId" TEXT NOT NULL,
    "gebruikerId" TEXT NOT NULL,
    "bewonerId" TEXT,
    "actie" TEXT NOT NULL DEFAULT 'FOTO_BEKEKEN',
    "pad" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToegangLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FamilieKoppeling" (
    "id" TEXT NOT NULL,
    "bewonerId" TEXT NOT NULL,
    "gebruikerId" TEXT NOT NULL,
    "relatie" TEXT NOT NULL,

    CONSTRAINT "FamilieKoppeling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Activiteit" (
    "id" TEXT NOT NULL,
    "bewonerId" TEXT NOT NULL,
    "vrijwilligerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "duurMinuten" INTEGER NOT NULL,
    "notities" TEXT,
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activiteit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Reactie" (
    "id" TEXT NOT NULL,
    "activiteitId" TEXT NOT NULL,
    "gebruikerId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "bericht" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reactie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ActiviteitLog" (
    "id" TEXT NOT NULL,
    "bewonerId" TEXT NOT NULL,
    "vrijwilligerId" TEXT NOT NULL,
    "actie" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActiviteitLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "HulpGevraagd" (
    "id" TEXT NOT NULL,
    "organisatieId" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "omschrijving" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "duurMinuten" INTEGER NOT NULL,
    "aantalNodig" INTEGER NOT NULL DEFAULT 1,
    "fotoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "aangemaaktDoor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HulpGevraagd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "HulpReactie" (
    "id" TEXT NOT NULL,
    "hulpGevraagdId" TEXT NOT NULL,
    "gebruikerId" TEXT NOT NULL,
    "bericht" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aangemeld',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HulpReactie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GeplandeActiviteit" (
    "id" TEXT NOT NULL,
    "organisatieId" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "type" TEXT,
    "beschrijving" TEXT,
    "locatie" TEXT,
    "datum" TIMESTAMP(3) NOT NULL,
    "duurMinuten" INTEGER NOT NULL DEFAULT 60,
    "aangemaaktDoor" TEXT NOT NULL,
    "hulpGevraagdId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeplandeActiviteit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Bericht" (
    "id" TEXT NOT NULL,
    "organisatieId" TEXT NOT NULL,
    "vanId" TEXT NOT NULL,
    "aanId" TEXT NOT NULL,
    "inhoud" TEXT NOT NULL,
    "gelezen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bericht_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Wervingsinteresse" (
    "id" TEXT NOT NULL,
    "gebruikerId" TEXT,
    "naam" TEXT,
    "email" TEXT,
    "activiteitId" TEXT,
    "bericht" TEXT,
    "beschikbaarheid" TEXT,
    "ervaring" TEXT,
    "motivatie" TEXT,
    "vogStatus" TEXT,
    "status" TEXT NOT NULL DEFAULT 'nieuw',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wervingsinteresse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "RegistratieToken" (
    "id" TEXT NOT NULL,
    "gebruikerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistratieToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Welzijnscheck" (
    "id" TEXT NOT NULL,
    "organisatieId" TEXT NOT NULL,
    "vrijwilligerId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "stemming" "WelzijnscheckStemming" NOT NULL,
    "notitie" TEXT,
    "aandachtspunten" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "anoniem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Welzijnscheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AdminInstellingen" (
    "id" TEXT NOT NULL,
    "organisatieId" TEXT NOT NULL,
    "nieuwsbriefEnabled" BOOLEAN NOT NULL DEFAULT true,
    "nieuwsbriefFrom" TEXT,
    "logoUrl" TEXT,
    "primaireKleur" TEXT,
    "gewijzigdOp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminInstellingen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Nieuwsbrief" (
    "id" TEXT NOT NULL,
    "organisatieId" TEXT,
    "onderwerp" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "inhoud" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'nieuwsbrief',
    "doelgroep" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'concept',
    "verzendDatum" TIMESTAMP(3),
    "verzondenOp" TIMESTAMP(3),
    "verstuurtAantal" INTEGER NOT NULL DEFAULT 0,
    "geopendAantal" INTEGER NOT NULL DEFAULT 0,
    "gekliktAantal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Nieuwsbrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "NieuwsbriefAbonnement" (
    "id" TEXT NOT NULL,
    "nieuwsbriefId" TEXT NOT NULL,
    "gebruikerId" TEXT,
    "email" TEXT NOT NULL,
    "naam" TEXT,
    "status" TEXT NOT NULL DEFAULT 'verzonden',
    "actief" BOOLEAN NOT NULL DEFAULT true,
    "afmeldToken" TEXT,
    "geopend" BOOLEAN NOT NULL DEFAULT false,
    "geopendOp" TIMESTAMP(3),
    "geklikt" BOOLEAN NOT NULL DEFAULT false,
    "gekliktOp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NieuwsbriefAbonnement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "NieuwsbriefDraft" (
    "id" TEXT NOT NULL,
    "organisatieId" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "intro" TEXT,
    "doelgroep" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'concept',
    "verzondenOp" TIMESTAMP(3),
    "verstuurtAantal" INTEGER NOT NULL DEFAULT 0,
    "gemaaktDoor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NieuwsbriefDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "NieuwsbriefBlok" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "bronActiviteitId" TEXT,
    "kop" TEXT,
    "tekst" TEXT,
    "volgorde" INTEGER NOT NULL DEFAULT 0,
    "activiteitType" TEXT,
    "vrijwilligerNaam" TEXT,
    "bewonerNaam" TEXT,
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NieuwsbriefBlok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" TEXT NOT NULL,
    "organisatieId" TEXT,
    "titel" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "inhoud" TEXT NOT NULL,
    "samenvatting" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "focusKeyword" TEXT,
    "status" TEXT NOT NULL DEFAULT 'concept',
    "gepubliceerdOp" TIMESTAMP(3),
    "featuredImage" TEXT,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "BlogTag" (
    "id" TEXT NOT NULL,
    "organisatieId" TEXT,
    "naam" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kleur" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "BlogPostTag" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL,
    "naam" TEXT,
    "organisatie" TEXT,
    "email" TEXT NOT NULL,
    "telefoon" TEXT,
    "website" TEXT,
    "kvkNummer" TEXT,
    "sbiCode" TEXT,
    "sbiBeschrijving" TEXT,
    "plaats" TEXT,
    "postcode" TEXT,
    "adres" TEXT,
    "contactPersoon" TEXT,
    "notitie" TEXT,
    "aiScore" INTEGER,
    "aiRationale" TEXT,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'nieuw',
    "scrapedAt" TIMESTAMP(3),
    "scoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "organisatieId" TEXT NOT NULL,
    "eventNaam" TEXT NOT NULL,
    "gebruikerId" TEXT,
    "metaData" TEXT,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "referrer" TEXT,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Gebruiker_email_key" ON "Gebruiker"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Gebruiker_userId_key" ON "Gebruiker"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EmailVoorkeur_gebruikerId_key" ON "EmailVoorkeur"("gebruikerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ToegangLog_bewonerId_idx" ON "ToegangLog"("bewonerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ToegangLog_organisatieId_idx" ON "ToegangLog"("organisatieId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Reactie_activiteitId_gebruikerId_emoji_key" ON "Reactie"("activiteitId", "gebruikerId", "emoji");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "HulpReactie_hulpGevraagdId_gebruikerId_key" ON "HulpReactie"("hulpGevraagdId", "gebruikerId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "GeplandeActiviteit_hulpGevraagdId_key" ON "GeplandeActiviteit"("hulpGevraagdId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GeplandeActiviteit_organisatieId_idx" ON "GeplandeActiviteit"("organisatieId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GeplandeActiviteit_datum_idx" ON "GeplandeActiviteit"("datum");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "RegistratieToken_token_key" ON "RegistratieToken"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RegistratieToken_token_idx" ON "RegistratieToken"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Welzijnscheck_organisatieId_idx" ON "Welzijnscheck"("organisatieId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Welzijnscheck_vrijwilligerId_idx" ON "Welzijnscheck"("vrijwilligerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Welzijnscheck_createdAt_idx" ON "Welzijnscheck"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AdminInstellingen_organisatieId_key" ON "AdminInstellingen"("organisatieId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "NieuwsbriefAbonnement_afmeldToken_key" ON "NieuwsbriefAbonnement"("afmeldToken");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "NieuwsbriefDraft_organisatieId_idx" ON "NieuwsbriefDraft"("organisatieId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "NieuwsbriefBlok_draftId_idx" ON "NieuwsbriefBlok"("draftId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BlogTag_slug_key" ON "BlogTag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BlogPostTag_postId_tagId_key" ON "BlogPostTag"("postId", "tagId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gebruiker" ADD CONSTRAINT "Gebruiker_organisatieId_fkey" FOREIGN KEY ("organisatieId") REFERENCES "Organisatie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gebruiker" ADD CONSTRAINT "Gebruiker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVoorkeur" ADD CONSTRAINT "EmailVoorkeur_gebruikerId_fkey" FOREIGN KEY ("gebruikerId") REFERENCES "Gebruiker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bewoner" ADD CONSTRAINT "Bewoner_organisatieId_fkey" FOREIGN KEY ("organisatieId") REFERENCES "Organisatie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToestemmingLog" ADD CONSTRAINT "ToestemmingLog_bewonerId_fkey" FOREIGN KEY ("bewonerId") REFERENCES "Bewoner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilieKoppeling" ADD CONSTRAINT "FamilieKoppeling_bewonerId_fkey" FOREIGN KEY ("bewonerId") REFERENCES "Bewoner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilieKoppeling" ADD CONSTRAINT "FamilieKoppeling_gebruikerId_fkey" FOREIGN KEY ("gebruikerId") REFERENCES "Gebruiker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activiteit" ADD CONSTRAINT "Activiteit_bewonerId_fkey" FOREIGN KEY ("bewonerId") REFERENCES "Bewoner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activiteit" ADD CONSTRAINT "Activiteit_vrijwilligerId_fkey" FOREIGN KEY ("vrijwilligerId") REFERENCES "Gebruiker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reactie" ADD CONSTRAINT "Reactie_activiteitId_fkey" FOREIGN KEY ("activiteitId") REFERENCES "Activiteit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reactie" ADD CONSTRAINT "Reactie_gebruikerId_fkey" FOREIGN KEY ("gebruikerId") REFERENCES "Gebruiker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HulpGevraagd" ADD CONSTRAINT "HulpGevraagd_organisatieId_fkey" FOREIGN KEY ("organisatieId") REFERENCES "Organisatie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HulpReactie" ADD CONSTRAINT "HulpReactie_hulpGevraagdId_fkey" FOREIGN KEY ("hulpGevraagdId") REFERENCES "HulpGevraagd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HulpReactie" ADD CONSTRAINT "HulpReactie_gebruikerId_fkey" FOREIGN KEY ("gebruikerId") REFERENCES "Gebruiker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeplandeActiviteit" ADD CONSTRAINT "GeplandeActiviteit_organisatieId_fkey" FOREIGN KEY ("organisatieId") REFERENCES "Organisatie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeplandeActiviteit" ADD CONSTRAINT "GeplandeActiviteit_hulpGevraagdId_fkey" FOREIGN KEY ("hulpGevraagdId") REFERENCES "HulpGevraagd"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bericht" ADD CONSTRAINT "Bericht_vanId_fkey" FOREIGN KEY ("vanId") REFERENCES "Gebruiker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bericht" ADD CONSTRAINT "Bericht_aanId_fkey" FOREIGN KEY ("aanId") REFERENCES "Gebruiker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wervingsinteresse" ADD CONSTRAINT "Wervingsinteresse_gebruikerId_fkey" FOREIGN KEY ("gebruikerId") REFERENCES "Gebruiker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistratieToken" ADD CONSTRAINT "RegistratieToken_gebruikerId_fkey" FOREIGN KEY ("gebruikerId") REFERENCES "Gebruiker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Welzijnscheck" ADD CONSTRAINT "Welzijnscheck_organisatieId_fkey" FOREIGN KEY ("organisatieId") REFERENCES "Organisatie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Welzijnscheck" ADD CONSTRAINT "Welzijnscheck_vrijwilligerId_fkey" FOREIGN KEY ("vrijwilligerId") REFERENCES "Gebruiker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInstellingen" ADD CONSTRAINT "AdminInstellingen_organisatieId_fkey" FOREIGN KEY ("organisatieId") REFERENCES "Organisatie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nieuwsbrief" ADD CONSTRAINT "Nieuwsbrief_organisatieId_fkey" FOREIGN KEY ("organisatieId") REFERENCES "Organisatie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NieuwsbriefAbonnement" ADD CONSTRAINT "NieuwsbriefAbonnement_nieuwsbriefId_fkey" FOREIGN KEY ("nieuwsbriefId") REFERENCES "Nieuwsbrief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NieuwsbriefAbonnement" ADD CONSTRAINT "NieuwsbriefAbonnement_gebruikerId_fkey" FOREIGN KEY ("gebruikerId") REFERENCES "Gebruiker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NieuwsbriefDraft" ADD CONSTRAINT "NieuwsbriefDraft_organisatieId_fkey" FOREIGN KEY ("organisatieId") REFERENCES "Organisatie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NieuwsbriefBlok" ADD CONSTRAINT "NieuwsbriefBlok_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "NieuwsbriefDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_organisatieId_fkey" FOREIGN KEY ("organisatieId") REFERENCES "Organisatie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogTag" ADD CONSTRAINT "BlogTag_organisatieId_fkey" FOREIGN KEY ("organisatieId") REFERENCES "Organisatie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_organisatieId_fkey" FOREIGN KEY ("organisatieId") REFERENCES "Organisatie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_gebruikerId_fkey" FOREIGN KEY ("gebruikerId") REFERENCES "Gebruiker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

