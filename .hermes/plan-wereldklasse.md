# Welzijnsklik: MVP → Wereldklasse

## Fase 1 — Codekwaliteit & DRY (nu)
- [x] Centraliseer ACTIVITEIT_ICON in `src/lib/activiteit-icon.tsx`
- [x] Hardcoded "De Meerwende" → DB query
- [x] Error/loading states per segment
- [x] Debug-endpoint productie-proof maken
- [x] Security headers (CSP) in next.config.ts

## Fase 2 — AVG & Security
- [ ] Toestemmingslogboek (ToestemmingLog model)
- [ ] Foto toegangscontrole (signed URLs / proxy)
- [ ] Audit trail: wie bekeek wat
- [ ] Rate limiting op login

## Fase 3 — Testen
- [ ] Vitest unit tests voor server actions
- [ ] Playwright E2E voor alle rollen

## Fase 4 — Multi-tenant
- [ ] Organisatie-selectie bij login
- [ ] Dynamische organisatie door hele app
