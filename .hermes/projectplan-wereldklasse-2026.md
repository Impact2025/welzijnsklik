# Welzijnsklik — Projectplan MVP → Wereldklasse (incl. begroting)

> **Voor Hermes:** Dit is het hoofdplan. Voer fasegewijs uit (subagent-driven-development).
> Elke fase heeft eigen acceptance criteria en een eigen deel-budget.

**Doel:** Van werkende MVP (pilot De Meerwende) naar een productieklare, AVG-robuste,
commercieel sluitende multi-tenant B2B SaaS voor de Nederlandse ouderenzorg.

**Architectuur:** Bestaande Next.js 16 (App Router) + Prisma + Neon + NextAuth v5 + Vercel Blob.
We bouwen verder op de bestaande 3 portalen en de AI lead-machine; we voegen toe:
self-service onboarding, betalingen, signed foto-URLs, audit-trail, push, PWA,
volledige test/CI-dekking en monitoring. Geen rewrites — evolutionair.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma 7, Neon Postgres (EU),
NextAuth v5 (JWT), Vercel Blob, Resend, OpenRouter (Claude Haiku), Stripe (nieuw),
Sentry/Logtail (nieuw), Playwright + Vitest.

---

## 0. EERLIJKE STATUSBEOORDELING (nu: 7.5 / 10)

**Wat al goed staat**
- Schone, consistente architectuur; rolgebaseerde toegang centraal afgedwongen in middleware.
- AVG-by-design denkwijze: camera-only foto-opname, dubbele client+server controle op toestemming.
- Correct gebruik van Server Actions + React Server Components.
- Slimme AI lead-machine (Brave → DuckDuckGo fallback, scraping, LLM-scoring met concurrency).
- Consistent design system (Outfit, blauw/goud, 8px-grid, geen emoji in UI).
- Professionele e-mailtemplates (uitnodiging, activiteit, digest, toestemming).

**Wat ontbreekt / risico (waarom geen 9+)**
1. Foto-URLs zijn **publieke** Vercel Blob-links → bij lekken van de link is de foto vrij
   toegankelijk. Geen signed URLs met expiry. Reëel AVG-risico bij "foto's van bewoners".
2. `ToestemmingLog` model bestaat, maar ik zie niet dat het overal wordt geschreven
   (alleen het model). Controle + invulling op elke toestemmingswijziging ontbreekt.
3. Geen "wie bekeek wat" audit-trail (inzage-logboek).
4. Geen **self-service onboarding**: een nieuwe organisatie gaat via seed/DB, niet via een
   registratie-flow. Blokkeert schaal.
5. Geen **betalingen** → geen commercieel sluitende SaaS (verkoop zonder facturatie).
6. Testdekking minimaal: 1 Vitest-file (activiteit), 1 (rate-limit), 1 Playwright-spec.
7. Geen monitoring/error-tracking in productie (Sentry staat zelfs in scraper-skip-patronen).
8. Geen push-notificaties; vrijwilligers werken mobiel en e-mail is te traag.
9. Lead-machine is hardcoded admin-only; niet schaalbaar als verkoopmotor per instelling.

**Conclusie:** Sterke basis, maar 4 harde blokkers voor productie/verkoop:
foto-privacy (1), self-service onboarding (4), betalingen (5), test/monitoring (6+7).

---

## 1. DEFINITIE VAN "WERELDKLASSE" (acceptatie op hoofdniveau)

- [ ] AVG-robust: signed foto-URLs (expiry), volledig toestemmingslogboek, inzage-audit-trail.
- [ ] Self-service multi-tenant: een instelling meldt zich aan, betaalt, is live zonder handwerk.
- [ ] Betalingen werken (Stripe): proefperiode, maandabonnement, automatische verlenging.
- [ ] Tests: Vitest unit ≥ 80% kritieke paden, Playwright E2E voor alle 3 rollen groen in CI.
- [ ] Monitoring: Sentry in productie, /api/health groen, error-rate dashboard.
- [ ] Performance: Lighthouse ≥ 90 (mobiel) op portalen.
- [ ] Toegankelijkheid: WCAG 2.1 AA op de hoofdstromen.
- [ ] Push-notificaties voor vrijwilliger/familie op mobiel.
- [ ] PWA-installable voor vrijwilligers (offline-leesbaar deel).
- [ ] Lead-machine bruikbaar als verkoopmotor met export/CRM-webhook.

---

## 2. FASE-OVERZICHT & TIJDLIJN

| Fase | Omvang | Uren | Doorlooptijd* |
|------|--------|------|--------------|
| A. AVG-hardening & security | Blokker 1 | 70u | 2 weken |
| B. Self-service onboarding + billing | Blokker 4+5 | 130u | 4 weken |
| C. Test/CI/monitoring/perf/a11y | Blokker 6+7 | 90u | 3 weken |
| D. Mobiel PWA + push | Uitbreiding | 100u | 3 weken |
| E. Lead-machine → verkoopmotor | Uitbreiding | 45u | 1,5 week |
| F. Polish, docs, support, launch | Afronding | 65u | 2 weken |
| **TOTAAL** | | **500u** | **~15,5 weken** |

\* Bij 1 senior dev (32u/wk effectief) ≈ 15-16 weken. Bij 2 devs ≈ 8 weken.
Spreiding over 4-6 maanden met pilot-iteraties is realistischer voor een eenmanszaak.

---

## 3. FASE A — AVG-HARDENING & SECURITY (70u, €6.650)

**Doel:** Foto-privacy en toestemming productieklaar maken.

Taken:
1. Signed foto-URLs: Vercel Blob `getSignedUrl` (expiry 1u) + proxy-route `/api/fotos/[id]`.
   Alle `<img src>` in portalen wijzen naar proxy. Verwijder publieke Blob-URLs uit DB-leespad.
2. `ToestemmingLog` invullen bij elke wijziging (ToestemmingForm + API). Unit-test.
3. Inzage-audit-trail: `ToegangLog` model + middleware/logging wie bewoner-data opvraagt.
4. CSP aanscherpen (nu `unsafe-inline`/`unsafe-eval` toegestaan — verwijder of nonce).
5. Rate-limit uitbreiden naar alle auth/schrijf-routes (niet alleen /login).
6. `scripts/foto-purge.ts` productieproof + cron-ready (verwijder foto's zonder toestemming).

**Acceptance:** Pen-test checklist groen; foto-URL opent niet meer zonder geldige sessie +
geldige signature; toestemmingswijziging schrijft altijd een log-regel.

---

## 4. FASE B — SELF-SERVICE ONBOARDING + BILLING (130u, €12.350)

**Doel:** Een instelling kan zonder handwerk registreren, betalen en live gaan.

Taken:
1. Organisatie-registratie-flow (`/aanmelden`): naam/plaats → Stripe Checkout (proef 14 dagen).
2. Stripe-integratie: `Subscription`, `Plan` modellen; webhook `/api/stripe/webhook`
   zet organisatie op `actief`/`opgeschort`.
3. Multi-tenant isolatie controleren: elke query scoped op `organisatieId` (audit van
   alle server actions — geen enkele mag data van andere org lekken).
4. Eerste coördinator wordt aangemaakt bij registratie (geen seed meer nodig).
5. Admin-overzicht klanten: status, abonnement, usage (actieve bewoners/vrijwilligers).
6. `DEMO_MODE` verfijnen voor openbare pilot zonder betaling.

**Acceptance:** Nieuwe instelling doorloopt registratie → betaling → eigen portal, volledig
zonder DB-handwerk. Tweede instelling ziet 0 data van de eerste.

---

## 5. FASE C — TEST / CI / MONITORING / PERF / A11Y (90u, €8.550)

**Doel:** Voorspelbare kwaliteit en zichtbaarheid in productie.

Taken:
1. Vitest unit voor: server actions (activiteiten, bewoners, leads, facturatie),
   scraper, scorer (mock fetch), rate-limit, foto-proxy.
2. Playwright E2E per rol: login → core flow → logout (coordinator/vrijwilliger/familie).
3. CI (bestaande ci.yml) uitbreiden: lint + typecheck + vitest + playwright bij elke PR.
4. Sentry integreren (client + server); `/api/health` uitbreiden met DB-ping.
5. Performance: RSC-caching op dashboard, image optimalisatie, Lighthouse ≥ 90.
6. a11y: focus-states, aria-labels op formulieren, contrast-check op design tokens.

**Acceptance:** CI groen bij elke PR; Lighthouse ≥ 90 mobiel; Sentry toont errors in productie.

---

## 6. FASE D — MOBIEL PWA + PUSH (100u, €9.500)

**Doel:** Vrijwilliger werkt primair op mobiel, met push bij nieuwe "hulp gevraagd".

Taken:
1. PWA: manifest + service worker (offline-leesbaar deel vrijwilliger-portaal).
2. Push: Web Push (of Expo/VAPID) voor "hulp gevraagd" + nieuwe activiteit bij familie.
3. Vrijwilliger-portaal mobile-first audit (touch targets ≥ 44px, bottom-nav).
4. Camera-flow mobiel testen op iOS/Android (getUserMedia permissies).

**Acceptance:** Vrijwilliger installeert PWA, krijgt push bij nieuwe hulp-vraag, logt activiteit
offline die later synchroniseert.

---

## 7. FASE E — LEAD-MACHINE → VERKOOPMOTOR (45u, €4.275)

**Doel:** De interne lead-machine bruikbaar maken als schaalbare acquisitie-tool.

Taken:
1. Per-organisatie scoring-context (elke instelling scant eigen regio/doelgroep).
2. Export naar CSV + webhook naar CRM (of e-mail naar coördinator).
3. Cache van zoekresultaten (niet elke refresh opnieuw scrapen + scoren).
4. Brave API-key centraal beheren in admin-instellingen.

**Acceptance:** Admin start een scan, krijgt gescoorde leads, exporteert naar CSV/CRM.

---

## 8. FASE F — POLISH, DOCS, SUPPORT, LAUNCH (65u, €6.175)

**Doel:** Verkoopklaar en onderhoudbaar.

Taken:
1. Klant-docs (handleiding coördinator/vrijwilliger/familie) + in-app help.
2. Support-flow (contact, statuspagina, changelog).
3. Marketing-site uitbouw (/sectoren, /prijzen, testimonials De Meerwende).
4. Launch-checklist: domein, SSL, privacyverklaring, verwerkersovereenkomst template.
5. Backup-strategie Neon (PITR) + disaster-recovery runbook.

**Acceptance:** Een nieuwe instelling kan zelfstandig starten op basis van docs + site.

---

## 9. BEGROTING

### 9.1 Eenmalige ontwikkelinvestering

| Post | Uren | Tarief | Bedrag (ex BTW) |
|------|------|--------|----------------|
| Fase A — AVG-hardening | 70 | €95 | € 6.650 |
| Fase B — Onboarding + billing | 130 | €95 | € 12.350 |
| Fase C — Test/CI/monitoring | 90 | €95 | € 8.550 |
| Fase D — PWA + push | 100 | €95 | € 9.500 |
| Fase E — Lead-machine | 45 | €95 | € 4.275 |
| Fase F — Polish/launch | 65 | €95 | € 6.175 |
| **Subtotaal development** | **500** | | **€ 47.500** |
| Projectleiding/QA (15%) | | | € 7.125 |
| **TOTAAL eenmalig** | | | **€ 54.625** |

*Tarief €95/u = realistisch NL-zzp senior (ex BTW). Bij een bureau/team van 2-3 is dit
2-3× (€110k-165k). Zelf bouwen = alleen je eigen urenkosten; reken dan je eigen uurloon.*

### 9.2 Maandelijkse lopende kosten (infrastructuur & diensten)

Bij < 10 actieve organisaties:
| Dienst | Gebruik | Kosten/mnd |
|--------|---------|-----------|
| Neon Postgres | Free tier → Scale (EU) | € 0 → € 19 |
| Vercel Pro | hosting + Blob | € 20 |
| Resend | 3k→10k mails/mnd | € 0 → € 20 |
| OpenRouter | lead-scoring + blog-gen | € 10 → € 50 |
| Vercel Blob | foto-opslag | € 0 → € 15 |
| Sentry | error tracking | € 0 (free) |
| Domein + DNS | welzijnsklik.nl | € 1 |
| **Totaal bij kleine schaal** | | **≈ € 31 → € 125 /mnd** |

Bij 50 organisaties schaalt dit naar ≈ € 200-400/mnd (Neon Scale, Resend hoger, Blob groter).

### 9.3 Commercieel model & terugverdienste (ROI)

**Prijsmodel (per instelling, ex BTW):**
- Proef: 14 dagen gratis.
- Basis: € 99/mnd (≤ 40 bewoners).
- Standaard: € 149/mnd (≤ 120 bewoners) — meest gekozen.
- Premium: € 249/mnd (onbeperkt + prior support).

**Break-even berekening:**
- Vaste lasten ≈ € 125/mnd (kleine schaal) + amortisatie dev € 54.625 over 24 mnd = € 2.275/mnd.
- Totaal maandlast bij start ≈ € 2.400/mnd.
- Break-even bij ~16-17 Stadard-klanten (€ 149) — of ~11 Premium (€ 249).
- Bij **25 klanten** (gemiddeld € 149): € 3.725/mnd omzet → netto ≈ € 1.300/mnd na lasten
  (ex eigen uren). Jaar 2 (dev afgeschreven): ≈ € 43k netto marge.

**Realistische landing:** pilot → 3-5 referenties jaar 1, 15-25 betalende klanten jaar 2.
De eenmalige investering is terugverdiend zodra ~20 klanten een jaar meedraaien.

---

## 10. RISICO'S & MITIGATIE

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| AVG-lek via publieke foto-URL | Hoog/blokker | Fase A eerst; signed URLs verplicht voor launch |
| Stripe-webhook betrouwbaarheid | Hoog | Idempotente verwerking; retry; handmatige fallback in admin |
| Multi-tenant data-lek | Hoog | Fase B audit van alle queries op organisatieId-scoping |
| OpenRouter-kosten lopen op | Middel | Cache + maxResults-cap + per-org budget |
| Vrijwilliger adoptie laag | Middel | PWA + push (Fase D); pilot De Meerwende als proof |
| Eenmanszaak capaciteit | Middel | Fases spreiden over 4-6 mnd; Fase A+B prioriteit |

---

## 11. DEFINITION OF DONE (per fase)

- Code gereviewd + groen in CI.
- Acceptance criteria hierboven allemaal aangevinkt.
- Relevante tests toegevoegd en groen.
- Kortelijk gedocumenteerd in repo (README/runbook).
- Gepusht naar `main` + getagged (bv. `v1.1-avg-hardening`).

---

## 12. VOLGORDE-AANBEVELING (realistisch voor eenmanszaak)

1. **Nu doen (blokkers):** Fase A (AVG) + Fase B (onboarding+billing).
   Zonder deze twee kun je niet legaal en commercieel verkopen.
2. **Direct daarna:** Fase C (test/monitoring) — anders wordt verkoop onhoudbaar.
3. **Dan:** Fase D (mobiel) — adoptie-driver voor vrijwilligers.
4. **Parallel/daarna:** Fase E (lead-machine) als je zelf acquisitie doet.
5. **Afronding:** Fase F (launch).

Geschat: blokkers (A+B) ≈ 200u ≈ € 19k eenmalig, klaar om te verkopen in ~6 weken.
