# Fase A — Uitvoerbare taak-lijst: AVG-hardening & Security

> **Voor Hermes:** Voer taak voor taak uit (subagent-driven-development). Elke taak is
> 2-5 min tot enkele uur werk, heeft een failing test-stap, implementatie met
> copy-paste code, en een verificatiestap. Commit na elke taak.
>
> **Geverifieerde stand van zaken (gelezen uit de echte code, juli 2026):**
> - `src/lib/actions/bewoners.ts:8` `updateToestemming` schrijft **al** een
>   `ToestemmingLog` (binnen `$transaction`, actie AAN/UIT + door + uitgevoerdDoor)
>   én verstuurt een mail naar familieleden. De detailpagina
>   `coordinator/bewoners/[id]/page.tsx` toont de log al (`toestemmingsLog`).
>   → Toestemmingslogboek is dus WÉL aanwezig. Geen A3 "van nul opbouwen".
> - **ECHTE AVG-knobbel:** alle 3 upload-routes zetten `access: "public"`:
>   `upload-foto` (regel 74), `upload-hulp-foto` (regel 33), `upload-profielfoto`
>   (regel 28). De foto-proxy (`/api/fotos`) verstopt de URL wel voor de client,
>   maar de onderliggende Vercel Blob blijft **publiek raadpleegbaar** als iemand
>   de URL raadt → géén echte AVG-bescherming. Dit is de prioriteit.
> - `ToegangLog` (inzage-audit: wie bekeek een foto) bestaat nergens → moet nieuw.
> - Rate-limit zit op `/login`, `/demo`, `upload-foto`, `upload-hulp-foto`; niet op
>   `upload-profielfoto` en niet op `/register`.
> - CSP in `next.config.ts` staat `unsafe-inline` + `unsafe-eval` toe.

**Doel Fase A:** foto's niet meer publiek raadpleegbaar (private + proxy), inzage-audit-trail
toegevoegd, CSP aangescherpt, rate-limit volledig, purge-script productieproof.

---

## A0. Voorbereiding — bevestig de veronderstellingen

**Files (reeds gelezen, samenvatting):**
- `src/lib/actions/bewoners.ts:8-74` → `updateToestemming` schrijft ToestemmingLog ✅
- `src/app/api/upload-foto/route.ts:74` → `access: "public"` ❌
- `src/app/api/upload-hulp-foto/route.ts:33` → `access: "public"` ❌
- `src/app/api/upload-profielfoto/route.ts:28` → `access: "public"` ❌
- `src/app/api/fotos/route.ts` → proxy met auth+rol+toestemming check ✅ (maar lekt publieke URL)

**Step 1:** Bevestig mondeling: "Toestemmingslog bestaat al; focus ligt op private foto's + inzage-log."
Geen code-wijziging in A0.

---

## A1. Private foto-uploads (verwijder `access: "public"`)

**Objective:** Foto's worden private opgeslagen; de client krijgt een tokenized Blob-URL
die alleen via onze server-proxy leesbaar is.

**Files (alle drie dezelfde wijziging):**
- Modify: `src/app/api/upload-foto/route.ts` (regel ~73-76)
- Modify: `src/app/api/upload-hulp-foto/route.ts` (regel ~32-34)
- Modify: `src/app/api/upload-profielfoto/route.ts` (regel ~27-30)

**Step 1 (upload-foto):** vervang
```ts
({ url } = await put(filename, blob, {
  access: "public",
  contentType: "image/jpeg",
}));
```
door:
```ts
({ url } = await put(filename, blob, {
  access: "private",
  contentType: "image/jpeg",
  addRandomSuffix: true,
}));
```
De `url` bij `access: "private"` is een **tokenized** URL (bevat `?...token=`), niet
publiek raadpleegbaar. De client gebruikt hem alleen als input voor `/api/fotos?url=...`.

**Step 2:** Pas `upload-hulp-foto` en `upload-profielfoto` identiek aan.

**Step 3:** Run `npm run build` — verwacht: slaagt (typecheck OK).

**Commit:**
```bash
git add src/app/api/upload-foto/route.ts src/app/api/upload-hulp-foto/route.ts src/app/api/upload-profielfoto/route.ts
git commit -m "fix(avg): foto-uploads private i.p.v. public blob"
```

---

## A2. Foto-proxy: tokenized URL + bredere validatie

**Objective:** Proxy haalt de foto op via de tokenized blob-URL; onderliggende blob is
niet publiek raadpleegbaar.

**Files:**
- Modify: `src/lib/foto.ts` (URL-check voor tokenized URLs)
- Modify: `src/app/api/fotos/route.ts` (URL-validatie regel ~31)

**Step 1 (foto.ts):** private/tokenized URLs bevatten `blob.vercel-storage.com` (zonder
`public`). Pas de check aan:
```ts
export function getFotoUrl(blobUrl: string | null | undefined, bewonerId: string): string | null {
  if (!blobUrl || !bewonerId) return null;
  const isBlob = blobUrl.includes("blob.vercel-storage.com");
  if (!isBlob) return blobUrl; // fallback voor niet-blob URLs
  const params = new URLSearchParams({ url: blobUrl, bewonerId });
  return `/api/fotos?${params.toString()}`;
}
```

**Step 2 (fotos/route.ts):** pas de validatie (regel ~31) aan zodat tokenized URLs
toegestaan zijn:
```ts
if (!blobUrl.startsWith("https://") || !blobUrl.includes("blob.vercel-storage.com")) {
  return NextResponse.json({ error: "Ongeldige URL" }, { status: 400 });
}
```

**Step 3 (test):** Schrijf `src/app/api/fotos/route.test.ts` met gemockte `auth`,
`prisma`, `fetch`. Asserties:
- Ongeautoriseerd → 401
- Vrijwilliger + bewoner zonder toestemming → 403
- Familie zonder koppeling → 403
- Geldige aanvraag → 200 + `image/*`

Gebruik `vi.mock("@/auth")`, `vi.mock("@/lib/prisma")`, `vi.stubGlobal("fetch", ...)`.
Spiek bij `src/lib/rate-limit.test.ts` voor het mock-patroon in deze repo.

**Step 4:** Run `npm test -- fotos/route.test.ts` — verwacht: groen.

**Commit:**
```bash
git add src/lib/foto.ts src/app/api/fotos/route.ts src/app/api/fotos/route.test.ts
git commit -m "fix(avg): foto-proxy gebruikt tokenized blob URL"
```

---

## A3. Toestemmingslog — controle + zichtbaarheid (geen nieuwbouw)

**Objective:** Bevestigen dat de bestaande log correct is en zichtbaar in de coördinator-UI.

**Files (alleen lezen + eventueel kleine UI-toevoeging):**
- Read: `src/lib/actions/bewoners.ts:8-74` (reeds gelezen — log schrijft correct)
- Read: `src/app/coordinator/bewoners/[id]/page.tsx` (toont `toestemmingsLog` al)

**Step 1 (verificatie):** Controleer dat `updateToestemming` de log schrijft én de
detailpagina hem rendert. Indien de pagina de log nog niet toont, voeg een sectie toe
onder de ToestemmingForm die `bewoner.toestemmingsLog` itereert (actie, door,
uitgevoerdDoor, createdAt).

**Step 2 (test):** Voeg aan `src/lib/actions/bewoners.test.ts` toe (nieuw bestand):
- Mock `auth` (coordinator) + `prisma` met `$transaction` spy + `sendEmail` no-op.
- Roep `updateToestemming("b1", true, "Maria")` aan.
- Assert: `$transaction` bevat een `toestemmingLog.create` met `actie: "AAN"`.

**Step 3:** Run `npm test -- bewoners.test.ts` — verwacht: groen.

**Commit (alleen als er een wijziging is):**
```bash
git add src/lib/actions/bewoners.test.ts src/app/coordinator/bewoners/[id]/page.tsx
git commit -m "test(avg): toestemmingslog geschreven + zichtbaar"
```

---

## A4. Inzage-audit-trail (ToegangLog) — NIEUW

**Objective:** Loggen wie een bewoner-foto opvraagt (AVG-inzageregister).

**Files:**
- Modify: `prisma/schema.prisma` (nieuw model `ToegangLog`)
- Modify: `src/app/api/fotos/route.ts` (schrijf log na succesvolle check)
- Modify: `src/app/api/fotos/route.test.ts` (breid A2-test uit)

**Step 1 (schema):** voeg toe aan `schema.prisma`:
```prisma
model ToegangLog {
  id          String   @id @default(cuid())
  organisatieId String
  gebruikerId String
  bewonerId   String
  actie       String   @default("FOTO_BEKEKEN")
  createdAt   DateTime @default(now())
  @@index([bewonerId])
  @@index([organisatieId])
}
```
Voer uit: `npx prisma db push` (snel, geen migratie-bestand nodig voor MVP) of
`npx prisma migrate dev --name toegang_log`. Daarna `npm run build` (hergenereert client).

**Step 2 (fotos/route.ts):** vlak vóór `return proxyBlob(blobUrl);` in de coordinator/
vrijwilliger/familie-branches, schrijf best-effort log:
```ts
await prisma.toegangLog.create({
  data: {
    organisatieId,
    gebruikerId: session.user.gebruikerId!,
    bewonerId,
    actie: "FOTO_BEKEKEN",
  },
}).catch(() => {});
return proxyBlob(blobUrl);
```
(Plaats het direct na de laatste toestemmingscheck, vóór elke `return proxyBlob`.)

**Step 3 (test):** breid `fotos/route.test.ts` uit: bij geldige aanvraag assert dat
`prisma.toegangLog.create` is aangeroepen met `actie: "FOTO_BEKEKEN"`.

**Step 4:** Run `npm test -- fotos/route.test.ts` — verwacht: groen.

**Commit:**
```bash
git add prisma/schema.prisma src/app/api/fotos/route.ts src/app/api/fotos/route.test.ts
git commit -m "feat(avg): inzage-audit-trail voor bewonerfoto's (ToegangLog)"
```

---

## A5. CSP aanscherpen (verwijder unsafe-eval)

**Objective:** Minder XSS-aanvalsoppervlak.

**Files:**
- Modify: `next.config.ts` (CSP-array)

**Step 1:** Verwijder `'unsafe-eval'` (Next.js productie heeft dit normaal niet nodig):
```ts
const csp = [
  `default-src 'self'`,
  `script-src 'self'`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://*.blob.vercel-storage.com https://lh3.googleusercontent.com`,
  `font-src 'self'`,
  `connect-src 'self' https://*.neon.tech wss://*.neon.tech`,
  `frame-src 'none'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
].join("; ");
```
> Nota: als dev/build breekt door verwijderde `'unsafe-inline'` op scripts, gebruik
> nonce-strategie of ticket als vervolg. Check in browser (DevTools → Console) op
> CSP-violations in de portalen.

**Step 2:** Run `npm run build` + lokaal `npm run dev`, open een portaal, kijk op
console-CSP-fouten. Los eventuele inline-script bronnen op of ticket ze.

**Step 3 (optioneel test):** `next.config.test.ts` parsed CSP en assert geen `'unsafe-eval'`.

**Commit:**
```bash
git add next.config.ts
git commit -m "sec: CSP aangescherpt — unsafe-eval verwijderd"
```

---

## A6. Rate-limit op ontbrekende routes

**Objective:** Brute-force/abuse afremmen op `upload-profielfoto` en `/register`.

**Files:**
- Modify: `src/proxy.ts` (breid rate-limit-block uit)

**Step 1 (proxy.ts):** na de bestaande login/demo-check, vóór de sessie-check:
```ts
const writeRoutes = [
  "/api/upload-foto",
  "/api/upload-hulp-foto",
  "/api/upload-profielfoto",
  "/register",
];
for (const wr of writeRoutes) {
  if (pathname.startsWith(wr)) {
    const rl = checkRateLimit(keyFromRequest(req), { max: 20, windowSeconds: 60 });
    if (!rl.allowed) {
      return new NextResponse("Te veel verzoeken.", {
        status: 429,
        headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" },
      });
    }
  }
}
```
> Let op: middleware draait op Edge; de in-memory Map werkt per Edge-instance. Voor
> productie: vervang door Vercel KV/Upstash Redis (ticket Fase C). De check is al
> een verbetering.

**Step 2:** Run `npm run build` — verwacht: slaagt.

**Commit:**
```bash
git add src/proxy.ts
git commit -m "sec: rate-limit op upload-profielfoto en /register"
```

---

## A7. foto-purge script productieproof + dry-run

**Objective:** Foto's van bewoners zonder toestemming automatisch verwijderen.

**Files:**
- Read + Modify: `scripts/foto-purge.ts`

**Step 1:** Lees `scripts/foto-purge.ts`. Controleer dat het:
1. Bewoners met `toestemmingFotos = false` + activiteit met `fotoUrl` ophaalt.
2. Blob verwijdert via `@vercel/blob` `del(url)` (tokenized URL werkt nu foto's private zijn).
3. `fotoUrl` leegmaakt + een `ActiviteitLog`/audit-regel schrijft.

**Step 2:** Voeg een `--dry-run` flag toe die alleen logt, niet verwijdert:
```ts
const dryRun = process.argv.includes("--dry-run");
// ... bij elke verwijdering: if (dryRun) { console.log("[dry-run]", url); continue; }
```

**Step 3:** Test: `npx tsx scripts/foto-purge.ts --dry-run` — verwacht: lijst te
verwijderen foto's, geen wijzigingen.

**Commit:**
```bash
git add scripts/foto-purge.ts
git commit -m "fix(avg): foto-purge script met dry-run + logging"
```

---

## A8. Acceptatie-test Fase A (Playwright)

**Objective:** Bewijzen dat de AVG-knobbels dichtzitten.

**Files:**
- Create: `e2e/avg.spec.ts`

**Step 1:** Schrijf test die:
1. Inlogt als vrijwilliger bij De Meerwende.
2. Uploadt foto voor bewoner mét toestemming → 200 + URL.
3. Opent de teruggegeven blob-URL direct in een fetch zónder sessie → verwacht 401/403
   (niet de blote afbeelding — bewijst private storage).
4. Coördinator zet toestemming uit → DB-check dat `ToestemmingLog` een `UIT`-regel heeft.
5. Vrijwilliger uploadt voor bewoner zónder toestemming → verwacht 403.

**Step 2:** Run `npm run test:e2e -- avg.spec.ts` — verwacht: groen.

**Commit:**
```bash
git add e2e/avg.spec.ts
git commit -m "test(e2e): AVG-acceptatietest foto-privacy + toestemmingslog"
```

---

## DEFINITION OF DONE — Fase A

- [ ] Alle foto-uploads `private` (geen publieke blob-URLs meer in de client).
- [ ] `/api/fotos` proxy haalt op via tokenized URL; onderliggende blob niet publiek.
- [ ] Toestemmingslog bestaat + zichtbaar (reeds aanwezig — geverifieerd in A3).
- [ ] Elke succesvolle foto-inzage schrijft een `ToegangLog`.
- [ ] CSP zonder `unsafe-eval`; geen console-CSP-violations in portalen.
- [ ] Rate-limit op alle upload-routes + `/register`.
- [ ] foto-purge script heeft `--dry-run` + logging, draait zonder fout.
- [ ] Unit-tests (foto-proxy, bewoners-action) groen; Playwright AVG-test groen in CI.
- [ ] Alles gepusht naar `main`, getagged `v1.1-avg-hardening`.

**Geschatte omvang:** ~70u (8 taken; A3 is nu klein omdat de log al bestond).
**Volgende fase:** B — Self-service onboarding + Stripe billing (blokker 2).
