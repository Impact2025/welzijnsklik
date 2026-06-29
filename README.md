# Welzijnsklik — MVP

B2B SaaS-platform voor de Nederlandse ouderenzorg dat vrijwilligers, bewoners en familie verbindt.

**Pilot-locatie:** De Meerwende, Badhoevedorp

---

## Lokale setup

### Vereisten

- Node.js 20+
- Een Neon-account (neon.tech) — maak een project aan in **eu-west-1 (Frankfurt)** of **eu-central-1** (AVG-vereiste)
- Een Resend-account (resend.com) voor magic-link e-mail
- Een Vercel-account voor Blob-opslag (optioneel lokaal — zie hieronder)

### 1. Dependencies installeren

```bash
npm install
```

### 2. Environment variables instellen

Kopieer `.env.example` naar `.env` en vul alle waarden in:

```bash
cp .env.example .env
```

| Variabele | Beschrijving |
|---|---|
| `DATABASE_URL` | Neon connection string (met `?sslmode=require`) |
| `AUTH_SECRET` | Willekeurige string voor Auth.js (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `http://localhost:3000` (lokaal) of je Vercel-URL in productie |
| `RESEND_API_KEY` | API-key van resend.com |
| `RESEND_FROM_EMAIL` | Afzenderadres (moet geverifieerd zijn in Resend) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (`vercel blob add` of via Vercel-dashboard) |

### 3. Database migreren

```bash
npm run db:push
```

Of met migraties (aangeraden voor productie):

```bash
npm run db:migrate
```

### 4. Testdata seeden

```bash
npm run db:seed
```

Dit maakt aan:
- Organisatie: **De Meerwende** (Badhoevedorp)
- Testaccounts (log in via magic-link op `/login`):
  - Coördinator: `coordinator@demeerwende.nl`
  - Vrijwilliger: `vrijwilliger@demeerwende.nl`
  - Familie: `familie@example.nl`
- 2 bewoners (Annie Smits met foto-toestemming, Henk Bakker zonder)
- 3 voorbeeld-activiteiten

### 5. Lokaal draaien

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — je wordt doorgestuurd naar `/login`.

---

## Naar GitHub pushen

```powershell
# Maak een nieuwe repo aan (vereist GitHub CLI)
gh repo create welzijnsklik --private --source=. --push

# Of handmatig:
git remote add origin https://github.com/JOUWGEBRUIKERSNAAM/welzijnsklik.git
git branch -M main
git push -u origin main
```

---

## Verbinden met Vercel

```bash
# Installeer Vercel CLI als je die nog niet hebt
npm i -g vercel

# Koppel aan Vercel-project
vercel link

# Stel environment variables in via Vercel-dashboard of CLI:
vercel env add DATABASE_URL
vercel env add AUTH_SECRET
vercel env add NEXTAUTH_URL        # je vercel.app URL
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
vercel env add BLOB_READ_WRITE_TOKEN

# Deploy
vercel --prod
```

---

## Privacyarchitectuur (voor AVG-verwerkersovereenkomst)

### Databeschermingsprincipes

**1. Dataminimalisatie**
Enkel noodzakelijke persoonsgegevens worden opgeslagen: naam, e-mail, activiteittype, duur, optionele notities.

**2. Foto's — privacy by design**
- Foto's worden **uitsluitend vastgelegd via `navigator.mediaDevices.getUserMedia()`** in de browser — géén native camera-app of bestandskiezer (`<input capture>`).
- Foto's worden **nooit lokaal opgeslagen** (geen `localStorage`, `IndexedDB`, of browser-cache van het bestand).
- Na vastlegging wordt de afbeelding als blob direct geüpload naar Vercel Blob en is het origineel niet meer aanwezig op het apparaat.

**3. Toestemming dubbel afgedwongen**
- Als `bewoner.toestemmingFotos === false`:
  - De camera-knop wordt **niet gerenderd** in de UI (client-side).
  - De upload-API-route (`/api/upload-foto`) weigert het verzoek met **HTTP 403** (server-side), ongeacht wat de client stuurt.
- Toestemming wordt geregistreerd met naam van de gever en datum.

**4. Rolgebaseerde toegang, server-side afgedwongen**
- Middleware controleert rol vóór elke routeaanvraag.
- Elke server action en API-route hercontroleert sessie en organisatielidmaatschap.
- Een vrijwilliger kan nooit gegevens van bewoners uit een andere organisatie inzien.

**5. Gegevensopslag EU-regio**
- Neon Postgres: **eu-west-1 (Frankfurt)** — vereist voor AVG-conformiteit.
- Vercel Blob: opslag via Vercel's edge-netwerk (data at rest in VS-datacenters van Vercel; overweeg Cloudflare R2 of Supabase Storage als EU-only vereist is voor foto's).

### Relevante onderdelen voor de verwerkersovereenkomst

| Gegeven | Doel | Bewaartermijn |
|---|---|---|
| Naam + e-mail gebruiker | Authenticatie, activiteitenregistratie | Zolang actief |
| Naam bewoner | Koppelen aan activiteiten | Zolang bewoner actief |
| Activiteitgegevens | Rapportage, familieinformatie | Conform zorgdossierbeleid |
| Foto's | Persoonlijk welzijnsverslag | Conform toestemmingsverklaring |
| E-mailadressen (login) | Magic-link authenticatie | Zolang actief |

---

## Mappenstructuur

```
src/
  app/
    coordinator/       # Dashboard, bewoners, briefjes
    vrijwilliger/      # Activiteiten loggen (mobile-first)
    familie/           # Tijdlijn + help-mee formulier
    login/             # Magic-link inlogpagina
    api/
      auth/            # Auth.js handlers
      upload-foto/     # Foto-upload met AVG-checks
  auth.ts              # Auth.js configuratie (Resend provider)
  middleware.ts        # Rolgebaseerde routebescherming
  lib/
    prisma.ts          # Prisma client singleton
    actions/           # Server actions (activiteiten, bewoners, werving)
  components/          # Herbruikbare componenten
  types/               # TypeScript type-uitbreidingen
prisma/
  schema.prisma        # Datamodel
  seed.ts              # Testdata
```
