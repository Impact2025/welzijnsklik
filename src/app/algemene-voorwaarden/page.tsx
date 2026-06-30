import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden | Welzijnsklik',
  description:
    'Lees de algemene voorwaarden van WeAreImpact B.V. voor het gebruik van het Welzijnsklik platform.',
};

const sectionPadding = 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)';

export default function AlgemeneVoorwaardenPage() {
  return (
    <div
      style={{
        fontFamily: 'var(--font-outfit, Outfit, sans-serif)',
        color: '#191c1d',
        background: '#f8f9fa',
      }}
    >
      <MarketingHeader />
      <main style={{ paddingTop: 64 }}>
        <section style={{ padding: sectionPadding }}>
          <div
            style={{
              maxWidth: 800,
              margin: '0 auto',
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid rgba(192,199,211,0.25)',
              boxShadow: '0px 4px 20px rgba(29,53,87,0.05)',
              padding: 'clamp(32px,4vw,48px)',
            }}
          >
            <h1
              style={{
                fontSize: 'clamp(28px,4vw,40px)',
                fontWeight: 800,
                color: '#1D3557',
                marginBottom: 8,
              }}
            >
              Algemene Voorwaarden
            </h1>
            <p style={{ fontSize: 14, color: '#404751', marginBottom: 48 }}>
              Versie 1.0 — juni 2026
            </p>

            <article style={{ lineHeight: 1.75 }}>
              <section style={{ marginBottom: 36 }}>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1D3557',
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: '1px solid rgba(192,199,211,0.4)',
                  }}
                >
                  Artikel 1 — Definities
                </h2>
                <p style={{ fontSize: 15, color: '#404751' }}>
                  In deze algemene voorwaarden worden de volgende definities gehanteerd:
                </p>
                <ul style={{ fontSize: 15, color: '#404751', paddingLeft: 20, marginTop: 12 }}>
                  <li style={{ marginBottom: 8 }}>
                    <strong style={{ color: '#1D3557' }}>Welzijnsklik:</strong> het SaaS-platform
                    ontwikkeld en aangeboden door WeAreImpact B.V.
                  </li>
                  <li style={{ marginBottom: 8 }}>
                    <strong style={{ color: '#1D3557' }}>Opdrachtgever:</strong> de
                    zorgorganisatie die een overeenkomst sluit met WeAreImpact B.V. voor het
                    gebruik van Welzijnsklik.
                  </li>
                  <li style={{ marginBottom: 8 }}>
                    <strong style={{ color: '#1D3557' }}>Gebruiker:</strong> elke persoon die
                    namens de opdrachtgever toegang heeft tot het platform, waaronder coördinatoren,
                    vrijwilligers en familieleden van bewoners.
                  </li>
                  <li style={{ marginBottom: 8 }}>
                    <strong style={{ color: '#1D3557' }}>Pilot:</strong> de evaluatieperiode van
                    twee maanden waarin de opdrachtgever het platform test op één afdeling, locatie
                    of team.
                  </li>
                </ul>
              </section>

              <section style={{ marginBottom: 36 }}>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1D3557',
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: '1px solid rgba(192,199,211,0.4)',
                  }}
                >
                  Artikel 2 — Toepasselijkheid
                </h2>
                <p style={{ fontSize: 15, color: '#404751' }}>
                  Deze algemene voorwaarden zijn van toepassing op alle overeenkomsten tussen
                  WeAreImpact B.V. en opdrachtgevers die gebruik maken van het Welzijnsklik
                  platform, inclusief de pilotperiode en eventuele vervolgabonnementen. Afwijkingen
                  van deze voorwaarden zijn uitsluitend geldig indien schriftelijk overeengekomen.
                </p>
              </section>

              <section style={{ marginBottom: 36 }}>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1D3557',
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: '1px solid rgba(192,199,211,0.4)',
                  }}
                >
                  Artikel 3 — De dienst
                </h2>
                <p style={{ fontSize: 15, color: '#404751' }}>
                  Welzijnsklik is een SaaS-platform dat zorgorganisaties ondersteunt bij de
                  registratie van activiteiten, communicatie met familie en de coördinatie van
                  vrijwilligers. De dienst omvat toegang tot het webplatform, technische
                  ondersteuning door WeAreImpact B.V. en, tijdens de pilotperiode, begeleiding bij
                  de implementatie op de werkvloer. WeAreImpact B.V. streeft naar een beschikbaar-
                  heid van het platform van minimaal 99% op maandbasis.
                </p>
              </section>

              <section style={{ marginBottom: 36 }}>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1D3557',
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: '1px solid rgba(192,199,211,0.4)',
                  }}
                >
                  Artikel 4 — Pilotperiode
                </h2>
                <p style={{ fontSize: 15, color: '#404751' }}>
                  De pilot heeft een vaste looptijd van twee maanden en is uitdrukkelijk bedoeld
                  als evaluatiefase. Na afloop van de pilot wordt de overeenkomst niet automatisch
                  omgezet in een betaald abonnement. Partijen treden na de evaluatie met elkaar in
                  overleg over een eventueel vervolg. De pilot is gebaseerd op concrete
                  evaluatiecriteria die vooraf schriftelijk worden vastgelegd.
                </p>
              </section>

              <section style={{ marginBottom: 36 }}>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1D3557',
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: '1px solid rgba(192,199,211,0.4)',
                  }}
                >
                  Artikel 5 — Persoonsgegevens
                </h2>
                <p style={{ fontSize: 15, color: '#404751' }}>
                  WeAreImpact B.V. treedt op als verwerker van persoonsgegevens in de zin van de
                  Algemene Verordening Gegevensbescherming (AVG). De opdrachtgever is de
                  verwerkingsverantwoordelijke. Partijen sluiten een verwerkersovereenkomst die
                  integraal onderdeel uitmaakt van de pilotovereenkomst. Persoonsgegevens worden
                  uitsluitend verwerkt ten behoeve van de in artikel 3 beschreven dienst en worden
                  opgeslagen op servers binnen de Europese Economische Ruimte.
                </p>
              </section>

              <section style={{ marginBottom: 36 }}>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1D3557',
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: '1px solid rgba(192,199,211,0.4)',
                  }}
                >
                  Artikel 6 — Aansprakelijkheid
                </h2>
                <p style={{ fontSize: 15, color: '#404751' }}>
                  De aansprakelijkheid van WeAreImpact B.V. is beperkt tot directe schade en
                  bedraagt nooit meer dan het factuurbedrag van de drie maanden voorafgaand aan de
                  schadeveroorzakende gebeurtenis. WeAreImpact B.V. is niet aansprakelijk voor
                  indirecte schade, gevolgschade, gederfde winst of schade als gevolg van
                  bedrijfsstagnatie.
                </p>
              </section>

              <section style={{ marginBottom: 36 }}>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1D3557',
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: '1px solid rgba(192,199,211,0.4)',
                  }}
                >
                  Artikel 7 — Intellectueel eigendom
                </h2>
                <p style={{ fontSize: 15, color: '#404751' }}>
                  Alle intellectuele eigendomsrechten op het Welzijnsklik platform, inclusief maar
                  niet beperkt tot broncode, ontwerpen, logo's, teksten en datastructuren, berusten
                  uitsluitend bij WeAreImpact B.V. Het is de opdrachtgever niet toegestaan het
                  platform te kopiëren, reverse engineeren, door te verkopen of op enige andere
                  wijze te exploiteren zonder uitdrukkelijke schriftelijke toestemming van
                  WeAreImpact B.V.
                </p>
              </section>

              <section style={{ marginBottom: 36 }}>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1D3557',
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: '1px solid rgba(192,199,211,0.4)',
                  }}
                >
                  Artikel 8 — Toepasselijk recht
                </h2>
                <p style={{ fontSize: 15, color: '#404751' }}>
                  Op alle overeenkomsten tussen WeAreImpact B.V. en de opdrachtgever is Nederlands
                  recht van toepassing. Geschillen die voortvloeien uit of verband houden met deze
                  overeenkomst worden voorgelegd aan de bevoegde rechter in Amsterdam.
                </p>
              </section>

              <section
                style={{
                  marginBottom: 0,
                  paddingTop: 28,
                  borderTop: '1px solid rgba(192,199,211,0.4)',
                }}
              >
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1D3557',
                    marginBottom: 12,
                  }}
                >
                  Contact
                </h2>
                <p style={{ fontSize: 15, color: '#404751' }}>
                  WeAreImpact B.V.
                  <br />
                  <a
                    href="mailto:v.munster@weareimpact.nl"
                    style={{ color: '#005e9f', textDecoration: 'none', fontWeight: 500 }}
                  >
                    v.munster@weareimpact.nl
                  </a>
                </p>
              </section>
            </article>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
