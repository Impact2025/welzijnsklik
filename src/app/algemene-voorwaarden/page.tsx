import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden | Welzijnsklik',
  description:
    'Algemene voorwaarden van WeAreImpact B.V. voor het gebruik van het Welzijnsklik platform door zorgorganisaties.',
};

const sectionPadding = 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)';

const h2Style: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: '#1D3557',
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: '1px solid rgba(192,199,211,0.4)',
};

const pStyle: React.CSSProperties = { fontSize: 15, color: '#404751' };
const sectionStyle: React.CSSProperties = { marginBottom: 36 };
const liStyle: React.CSSProperties = { marginBottom: 8 };

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
            <p style={{ fontSize: 14, color: '#404751', marginBottom: 24 }}>
              Versie 2.0 — 3 juli 2026 &middot; van toepassing op alle overeenkomsten met WeAreImpact B.V.
            </p>

            <div
              style={{
                background: 'rgba(0,94,159,0.06)',
                borderRadius: 12,
                padding: '18px 20px',
                marginBottom: 40,
                fontSize: 14,
                color: '#1D3557',
                lineHeight: 1.7,
              }}
            >
              <strong>WeAreImpact B.V.</strong>, statutair gevestigd te Amsterdam
              <br />
              Heintje Hoeksteeg 11a, 1012 GR Amsterdam
              <br />
              KvK: 70285888 &nbsp;·&nbsp; BTW: NL858236369B01
              <br />
              hierna: &ldquo;<strong>WeAreImpact</strong>&rdquo; of &ldquo;<strong>wij</strong>&rdquo;
            </div>

            <article style={{ lineHeight: 1.75 }}>
              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 1 — Definities</h2>
                <ul style={{ fontSize: 15, color: '#404751', paddingLeft: 20 }}>
                  <li style={liStyle}>
                    <strong style={{ color: '#1D3557' }}>Welzijnsklik:</strong> het SaaS-platform
                    ontwikkeld en aangeboden door WeAreImpact, inclusief bijbehorende webapplicatie,
                    documentatie en ondersteunende diensten.
                  </li>
                  <li style={liStyle}>
                    <strong style={{ color: '#1D3557' }}>Opdrachtgever:</strong> de zorgorganisatie
                    die een Overeenkomst sluit met WeAreImpact voor het gebruik van Welzijnsklik.
                  </li>
                  <li style={liStyle}>
                    <strong style={{ color: '#1D3557' }}>Overeenkomst:</strong> de tussen WeAreImpact
                    en Opdrachtgever gesloten overeenkomst voor het gebruik van Welzijnsklik,
                    waaronder begrepen een Pilotovereenkomst of vervolgabonnement, met deze algemene
                    voorwaarden en de verwerkersovereenkomst als integraal onderdeel.
                  </li>
                  <li style={liStyle}>
                    <strong style={{ color: '#1D3557' }}>Gebruiker:</strong> elke natuurlijke persoon
                    die namens Opdrachtgever toegang heeft tot Welzijnsklik, waaronder coördinatoren,
                    vrijwilligers en familieleden van bewoners.
                  </li>
                  <li style={liStyle}>
                    <strong style={{ color: '#1D3557' }}>Bewonersgegevens:</strong> persoonsgegevens
                    van bewoners van Opdrachtgever die binnen Welzijnsklik worden vastgelegd, waaronder
                    naam, kamernummer, geboortedatum, notities en foto&apos;s.
                  </li>
                  <li style={liStyle}>
                    <strong style={{ color: '#1D3557' }}>Pilot:</strong> de evaluatieperiode van twee
                    maanden waarin Opdrachtgever Welzijnsklik test op één afdeling, locatie of team.
                  </li>
                  <li style={liStyle}>
                    <strong style={{ color: '#1D3557' }}>Vertrouwelijke Informatie:</strong> alle
                    informatie die partijen in het kader van de Overeenkomst aan elkaar verstrekken en
                    die als vertrouwelijk is aangemerkt of waarvan de vertrouwelijkheid redelijkerwijs
                    voortvloeit uit de aard van de informatie, waaronder in ieder geval Bewonersgegevens.
                  </li>
                </ul>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 2 — Toepasselijkheid</h2>
                <p style={pStyle}>
                  2.1 Deze algemene voorwaarden zijn van toepassing op elk aanbod van WeAreImpact en
                  op elke Overeenkomst tussen WeAreImpact en Opdrachtgever, inclusief de Pilot en
                  eventuele vervolgabonnementen.
                </p>
                <p style={pStyle}>
                  2.2 Afwijkingen van deze voorwaarden zijn uitsluitend geldig indien schriftelijk
                  tussen partijen overeengekomen.
                </p>
                <p style={pStyle}>
                  2.3 Eventuele inkoop- of andere algemene voorwaarden van Opdrachtgever worden
                  uitdrukkelijk van de hand gewezen.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 3 — Totstandkoming van de overeenkomst</h2>
                <p style={pStyle}>
                  3.1 Een Overeenkomst komt tot stand op het moment dat Opdrachtgever een aanbod van
                  WeAreImpact schriftelijk (waaronder per e-mail) aanvaardt, of op het moment dat
                  Opdrachtgever daadwerkelijk gebruikmaakt van Welzijnsklik na uitnodiging door
                  WeAreImpact.
                </p>
                <p style={pStyle}>
                  3.2 Opdrachtgever staat ervoor in dat de gegevens die zij bij het aangaan van de
                  Overeenkomst verstrekt, juist en volledig zijn.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 4 — De dienst en beschikbaarheid</h2>
                <p style={pStyle}>
                  4.1 Welzijnsklik ondersteunt zorgorganisaties bij de registratie van activiteiten,
                  communicatie met familie en de coördinatie van vrijwilligers. De dienst omvat
                  toegang tot het webplatform en technische ondersteuning door WeAreImpact.
                </p>
                <p style={pStyle}>
                  4.2 WeAreImpact spant zich in voor een beschikbaarheid van het platform van
                  minimaal 99% op maandbasis, met uitzondering van gepland onderhoud waarover
                  Opdrachtgever vooraf wordt geïnformeerd, en omstandigheden buiten de invloedssfeer
                  van WeAreImpact.
                </p>
                <p style={pStyle}>
                  4.3 WeAreImpact mag Welzijnsklik van tijd tot tijd aanpassen om de dienst te
                  verbeteren, wettelijke vereisten na te leven of beveiligingsredenen, mits dit de
                  functionaliteit voor Opdrachtgever niet wezenlijk vermindert.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 5 — Pilotperiode</h2>
                <p style={pStyle}>
                  5.1 De Pilot heeft een vaste looptijd van twee maanden en is uitdrukkelijk bedoeld
                  als evaluatiefase, gebaseerd op concrete evaluatiecriteria die partijen vooraf
                  schriftelijk vastleggen.
                </p>
                <p style={pStyle}>
                  5.2 Na afloop van de Pilot wordt de Overeenkomst niet automatisch omgezet in een
                  betaald abonnement. Partijen treden na de evaluatie met elkaar in overleg over een
                  eventueel vervolg.
                </p>
                <p style={pStyle}>
                  5.3 Gedurende de Pilot is geen vergoeding verschuldigd, tenzij partijen schriftelijk
                  anders zijn overeengekomen.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 6 — Vervolgabonnement, prijzen en betaling</h2>
                <p style={pStyle}>
                  6.1 Zet Opdrachtgever het gebruik van Welzijnsklik na de Pilot voort, dan gelden de
                  prijzen en betalingsvoorwaarden zoals vastgelegd in de vervolgovereenkomst of
                  offerte tussen partijen.
                </p>
                <p style={pStyle}>
                  6.2 Facturen dienen te worden voldaan binnen 30 dagen na factuurdatum. Bij
                  overschrijding van deze termijn is Opdrachtgever van rechtswege in verzuim en is de
                  wettelijke handelsrente verschuldigd over het openstaande bedrag.
                </p>
                <p style={pStyle}>
                  6.3 Prijzen zijn exclusief btw en overige heffingen van overheidswege, tenzij anders
                  vermeld.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 7 — Verplichtingen van Opdrachtgever</h2>
                <p style={pStyle}>Opdrachtgever staat ervoor in dat:</p>
                <ul style={{ fontSize: 15, color: '#404751', paddingLeft: 20 }}>
                  <li style={liStyle}>
                    zij, waar wettelijk vereist, toestemming van bewoners of hun wettelijk
                    vertegenwoordiger verkrijgt voordat Bewonersgegevens of foto&apos;s in Welzijnsklik
                    worden vastgelegd;
                  </li>
                  <li style={liStyle}>
                    alleen bevoegde Gebruikers toegang krijgen tot Welzijnsklik, en dat
                    inloggegevens niet met derden worden gedeeld;
                  </li>
                  <li style={liStyle}>
                    zij WeAreImpact onverwijld informeert bij een vermoeden van onbevoegde toegang tot
                    een account of Bewonersgegevens;
                  </li>
                  <li style={liStyle}>
                    het gebruik van Welzijnsklik voldoet aan toepasselijke wet- en regelgeving,
                    waaronder de AVG.
                  </li>
                </ul>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 8 — Gebruiksregels</h2>
                <p style={pStyle}>
                  8.1 Opdrachtgever en Gebruikers onthouden zich van gebruik van Welzijnsklik dat
                  inbreuk maakt op rechten van derden, in strijd is met de wet, of de beschikbaarheid
                  of integriteit van het platform in gevaar brengt, waaronder het reverse-engineeren
                  van de dienst, het omzeilen van beveiligingsmaatregelen of geautomatiseerd
                  bevragen van het platform buiten de daarvoor bedoelde functionaliteit.
                </p>
                <p style={pStyle}>
                  8.2 WeAreImpact mag de toegang van een Gebruiker opschorten bij een gegrond
                  vermoeden van misbruik, met onmiddellijke kennisgeving aan Opdrachtgever.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 9 — Persoonsgegevens</h2>
                <p style={pStyle}>
                  9.1 WeAreImpact treedt op als verwerker van persoonsgegevens in de zin van de
                  Algemene Verordening Gegevensbescherming (AVG). Opdrachtgever is de
                  verwerkingsverantwoordelijke voor Bewonersgegevens en gegevens van haar Gebruikers.
                </p>
                <p style={pStyle}>
                  9.2 Partijen sluiten een verwerkersovereenkomst die integraal onderdeel uitmaakt van
                  de Overeenkomst. Bij tegenstrijdigheid tussen deze algemene voorwaarden en de
                  verwerkersovereenkomst, prevaleert de verwerkersovereenkomst voor wat betreft de
                  verwerking van persoonsgegevens.
                </p>
                <p style={pStyle}>
                  9.3 Persoonsgegevens worden uitsluitend verwerkt ten behoeve van de in artikel 4
                  beschreven dienst en, waar redelijkerwijs mogelijk, opgeslagen op servers binnen de
                  Europese Economische Ruimte. WeAreImpact maakt gebruik van subverwerkers voor
                  hosting, opslag en e-mailverkeer; een actueel overzicht hiervan is opgenomen in de{' '}
                  <a href="/privacy" style={{ color: '#005e9f' }}>privacyverklaring</a>.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 10 — Geheimhouding</h2>
                <p style={pStyle}>
                  Partijen verplichten zich tot geheimhouding van Vertrouwelijke Informatie die zij
                  van elkaar ontvangen, en zullen deze informatie niet aan derden verstrekken of
                  gebruiken voor een ander doel dan de uitvoering van de Overeenkomst. Deze
                  verplichting geldt onverkort na beëindiging van de Overeenkomst.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 11 — Intellectueel eigendom</h2>
                <p style={pStyle}>
                  Alle intellectuele eigendomsrechten op Welzijnsklik, waaronder begrepen doch niet
                  beperkt tot broncode, ontwerpen, logo&apos;s, teksten en datastructuren, berusten
                  uitsluitend bij WeAreImpact. Opdrachtgever verkrijgt uitsluitend een
                  niet-exclusief, niet-overdraagbaar gebruiksrecht voor de duur van de Overeenkomst.
                  Het is Opdrachtgever niet toegestaan Welzijnsklik te kopiëren, te reverse-engineeren,
                  door te verkopen of anderszins te exploiteren zonder voorafgaande schriftelijke
                  toestemming van WeAreImpact.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 12 — Aansprakelijkheid</h2>
                <p style={pStyle}>
                  12.1 De totale aansprakelijkheid van WeAreImpact voor directe schade uit hoofde van
                  de Overeenkomst is per gebeurtenis (een reeks samenhangende gebeurtenissen geldt als
                  één gebeurtenis) beperkt tot het bedrag dat Opdrachtgever in de drie maanden
                  voorafgaand aan de schadeveroorzakende gebeurtenis aan WeAreImpact heeft betaald,
                  met een maximum van &euro;10.000.
                </p>
                <p style={pStyle}>
                  12.2 WeAreImpact is niet aansprakelijk voor indirecte schade, gevolgschade,
                  gederfde winst, gemiste besparingen of schade door bedrijfsstagnatie.
                </p>
                <p style={pStyle}>
                  12.3 Het bepaalde in dit artikel geldt niet voor schade die het gevolg is van opzet
                  of bewuste roekeloosheid van WeAreImpact, en laat aansprakelijkheid voor schade door
                  overlijden of letsel onverlet.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 13 — Duur, opzegging en beëindiging</h2>
                <p style={pStyle}>
                  13.1 De Pilot eindigt van rechtswege na afloop van de in artikel 5 genoemde periode,
                  tenzij partijen schriftelijk een vervolgovereenkomst sluiten.
                </p>
                <p style={pStyle}>
                  13.2 Een vervolgabonnement kan door elk der partijen worden opgezegd met inachtneming
                  van de opzegtermijn zoals vastgelegd in de betreffende overeenkomst.
                </p>
                <p style={pStyle}>
                  13.3 Elk der partijen mag de Overeenkomst met onmiddellijke ingang schriftelijk
                  ontbinden indien de andere partij, ook na schriftelijke ingebrekestelling met
                  redelijke termijn, in gebreke blijft een wezenlijke verplichting na te komen, of in
                  geval van faillissement, surseance van betaling of beëindiging van de
                  bedrijfsactiviteiten van de andere partij.
                </p>
                <p style={pStyle}>
                  13.4 Bij beëindiging van de Overeenkomst stelt WeAreImpact Opdrachtgever in staat om
                  gedurende 30 dagen de eigen gegevens te exporteren, waarna WeAreImpact deze gegevens
                  verwijdert conform de verwerkersovereenkomst, tenzij een wettelijke bewaarplicht
                  langere opslag vereist.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 14 — Overmacht</h2>
                <p style={pStyle}>
                  Geen van partijen is gehouden tot nakoming van enige verplichting indien zij
                  daartoe verhinderd is als gevolg van overmacht, waaronder begrepen storingen bij
                  hostingpartijen of andere leveranciers van WeAreImpact, internetstoringen,
                  cyberaanvallen, stroomstoringen en overheidsmaatregelen.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 15 — Wijziging van deze voorwaarden</h2>
                <p style={pStyle}>
                  WeAreImpact mag deze algemene voorwaarden wijzigen. Wijzigingen worden ten minste 30
                  dagen voordat zij van kracht worden schriftelijk aan Opdrachtgever bekendgemaakt.
                  Wijzigingen die een wezenlijke, voor Opdrachtgever nadelige verandering inhouden,
                  geven Opdrachtgever het recht de Overeenkomst tegen de ingangsdatum van de wijziging
                  op te zeggen.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 16 — Overdracht van rechten en verplichtingen</h2>
                <p style={pStyle}>
                  Opdrachtgever mag rechten en verplichtingen uit de Overeenkomst niet zonder
                  voorafgaande schriftelijke toestemming van WeAreImpact aan een derde overdragen.
                  WeAreImpact mag de Overeenkomst overdragen aan een aan haar gelieerde onderneming of
                  in het kader van een overname van haar bedrijfsactiviteiten, en zal Opdrachtgever
                  hierover vooraf informeren.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>Artikel 17 — Toepasselijk recht en geschillen</h2>
                <p style={pStyle}>
                  Op alle overeenkomsten tussen WeAreImpact en Opdrachtgever is uitsluitend Nederlands
                  recht van toepassing. Geschillen die voortvloeien uit of verband houden met de
                  Overeenkomst worden voorgelegd aan de bevoegde rechter in Amsterdam, tenzij dwingend
                  recht een andere rechter voorschrijft.
                </p>
              </section>

              <section
                style={{
                  marginBottom: 0,
                  paddingTop: 28,
                  borderTop: '1px solid rgba(192,199,211,0.4)',
                }}
              >
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1D3557', marginBottom: 12 }}>
                  Contact
                </h2>
                <p style={pStyle}>
                  WeAreImpact B.V. &middot; Heintje Hoeksteeg 11a, 1012 GR Amsterdam
                  <br />
                  KvK 70285888 &middot; BTW NL858236369B01
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
