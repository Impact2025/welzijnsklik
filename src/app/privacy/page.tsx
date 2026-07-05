import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacyverklaring | Welzijnsklik',
  description:
    'Hoe WeAreImpact B.V. persoonsgegevens verwerkt binnen het Welzijnsklik platform: welke gegevens, met welk doel, hoe lang bewaard en welke rechten u heeft.',
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

const tableWrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  marginTop: 16,
  marginBottom: 20,
};

const tableHead: React.CSSProperties = {
  background: '#f3f4f5',
  borderRadius: 12,
  padding: '16px 20px',
  display: 'grid',
  gridTemplateColumns: '1.2fr 1.6fr 1fr',
  gap: 12,
  fontSize: 12,
  fontWeight: 700,
  color: '#1D3557',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const tableRow: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 12,
  border: '1px solid rgba(192,199,211,0.35)',
  padding: '16px 20px',
  display: 'grid',
  gridTemplateColumns: '1.2fr 1.6fr 1fr',
  gap: 12,
  fontSize: 14,
  color: '#404751',
};

const dataCategories: [string, string, string][] = [
  [
    'Accountgegevens',
    'Naam, e-mailadres en rol (coördinator, vrijwilliger, familielid) van iedere gebruiker met een account.',
    'Zolang account actief',
  ],
  [
    'Bewonersgegevens',
    'Naam, kamernummer en geboortedatum van bewoners, plus eventuele notities die een coördinator of vrijwilliger vastlegt bij een activiteit.',
    'Zolang bewoner bij de zorgorganisatie verblijft',
  ],
  [
    'Toestemming fotografie',
    'Of, door wie en op welke datum toestemming is gegeven voor het maken van foto’s, inclusief een logboek van elke wijziging.',
    'Zolang bewoner bij de zorgorganisatie verblijft',
  ],
  [
    'Foto’s en activiteiten',
    'Foto’s bij geregistreerde activiteiten, het type activiteit, duur en eventuele notities.',
    'Maximaal 90 dagen, of direct bij intrekking van toestemming',
  ],
  [
    'Familiekoppeling',
    'De relatie van een familielid tot een bewoner, om berichten en activiteiten te kunnen delen.',
    'Zolang de koppeling actief is',
  ],
  [
    'Wervingsgegevens vrijwilligers',
    'Ervaring, motivatie en VOG-status bij aanmelding als vrijwilliger.',
    'Maximaal 2 jaar na laatste contact, of korter bij afwijzing',
  ],
  [
    'Berichten',
    'Inhoud van berichten die gebruikers onderling uitwisselen binnen het platform.',
    'Zolang account actief',
  ],
  [
    'Technische gegevens',
    'Gehasht IP-adres, browsertype en verwijzende pagina, uitsluitend voor platformstatistieken.',
    'Maximaal 14 maanden',
  ],
];

export default function PrivacyPage() {
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
              Privacyverklaring
            </h1>
            <p style={{ fontSize: 14, color: '#404751', marginBottom: 24 }}>
              Versie 1.0 — 3 juli 2026
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
              <strong>WeAreImpact B.V.</strong>, Heintje Hoeksteeg 11a, 1012 GR Amsterdam
              <br />
              KvK: 70285888 &nbsp;·&nbsp; BTW: NL858236369B01
              <br />
              Ontwikkelaar en aanbieder van het Welzijnsklik platform
            </div>

            <article style={{ lineHeight: 1.75 }}>
              <section style={sectionStyle}>
                <h2 style={h2Style}>1. Voor wie geldt deze verklaring</h2>
                <p style={pStyle}>
                  Deze verklaring is van toepassing op iedereen die persoonsgegevens invoert of
                  daarin voorkomt binnen het Welzijnsklik platform: coördinatoren, vrijwilligers en
                  familieleden met een account, en bewoners van wie gegevens en foto&apos;s worden
                  vastgelegd door de zorgorganisatie.
                </p>
                <p style={pStyle}>
                  Welzijnsklik wordt afgenomen door zorgorganisaties (de &ldquo;opdrachtgever&rdquo;,
                  bijvoorbeeld uw zorginstelling). Voor gegevens die binnen het platform worden
                  vastgelegd, is die zorgorganisatie de <strong>verwerkingsverantwoordelijke</strong>{' '}
                  in de zin van de AVG. WeAreImpact B.V. treedt op als <strong>verwerker</strong>: wij
                  verwerken deze gegevens uitsluitend in opdracht van en onder verantwoordelijkheid
                  van uw zorgorganisatie, op basis van een verwerkersovereenkomst. Voor vragen over
                  gegevens die uw zorgorganisatie over u of een naaste vastlegt, kunt u zich in eerste
                  instantie tot uw coördinator wenden; wij ondersteunen daarbij als verwerker.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>2. Welke gegevens wij verwerken</h2>
                <p style={pStyle}>
                  Welzijnsklik is opgezet volgens het principe van dataminimalisatie: we leggen alleen
                  vast wat nodig is om activiteiten te registreren, vrijwilligers te coördineren en
                  familie te betrekken.
                </p>
                <div style={tableWrap}>
                  <div style={tableHead}>
                    <span>Categorie</span>
                    <span>Gegevens</span>
                    <span>Bewaartermijn</span>
                  </div>
                  {dataCategories.map(([cat, desc, retention]) => (
                    <div style={tableRow} key={cat}>
                      <span style={{ fontWeight: 600, color: '#1D3557' }}>{cat}</span>
                      <span>{desc}</span>
                      <span>{retention}</span>
                    </div>
                  ))}
                </div>
                <p style={{ ...pStyle, fontSize: 13, color: '#6b7280' }}>
                  Na afloop van een bewaartermijn worden gegevens verwijderd of geanonimiseerd, tenzij
                  een wettelijke bewaarplicht langere opslag vereist.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>3. Grondslag en doel van de verwerking</h2>
                <p style={pStyle}>
                  Accountgegevens, bewonersgegevens en activiteitenregistraties verwerken wij ter{' '}
                  <strong>uitvoering van de overeenkomst</strong> tussen WeAreImpact en uw
                  zorgorganisatie: zonder deze gegevens kan het platform zijn functie — activiteiten
                  registreren, vrijwilligers plannen, familie informeren — niet vervullen. Foto&apos;s
                  van bewoners worden uitsluitend gemaakt en getoond op basis van{' '}
                  <strong>uitdrukkelijke toestemming</strong>, gegeven door de bewoner zelf of diens
                  wettelijk vertegenwoordiger. Technische gegevens (gehasht IP-adres, browsertype)
                  verwerken wij op grond van ons <strong>gerechtvaardigd belang</strong> bij inzicht in
                  het gebruik van het platform, zonder individuele bezoekers te kunnen herleiden.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>4. Toestemming voor foto&apos;s</h2>
                <p style={pStyle}>
                  Foto&apos;s worden alleen gemaakt als de bewoner, of diens wettelijk
                  vertegenwoordiger, daar uitdrukkelijk toestemming voor heeft gegeven. Deze
                  toestemming wordt vastgelegd met datum, naam van de toestemmer en de coördinator die
                  dit heeft geregistreerd. Elke wijziging van deze toestemming wordt bewaard in een
                  toestemmingslogboek, zodat op elk moment aantoonbaar is wanneer en door wie
                  toestemming is gegeven of ingetrokken.
                </p>
                <p style={pStyle}>
                  Toestemming kan te allen tijde worden ingetrokken via de coördinator. Na intrekking
                  worden geen nieuwe foto&apos;s meer gemaakt en worden bestaande foto&apos;s van die
                  bewoner verwijderd. Ook zonder intrekking worden foto&apos;s uiterlijk 90 dagen na
                  plaatsing automatisch verwijderd.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>5. Met wie wij gegevens delen</h2>
                <p style={pStyle}>
                  Wij verkopen geen gegevens en delen deze niet voor marketingdoeleinden. Voor het
                  functioneren van het platform maken wij gebruik van een beperkt aantal
                  zorgvuldig gekozen leveranciers (subverwerkers), met wie wij een
                  verwerkersovereenkomst hebben gesloten:
                </p>
                <ul style={{ fontSize: 15, color: '#404751', paddingLeft: 20, marginTop: 8 }}>
                  <li style={{ marginBottom: 8 }}>
                    <strong style={{ color: '#1D3557' }}>Neon</strong> — hosting van de database, in
                    datacenters binnen de Europese Unie.
                  </li>
                  <li style={{ marginBottom: 8 }}>
                    <strong style={{ color: '#1D3557' }}>Vercel</strong> — hosting van het platform en
                    opslag van geüploade foto&apos;s. Foto&apos;s zijn alleen toegankelijk via een
                    beveiligd controlepunt dat rol, organisatie en toestemming verifieert vóórdat een
                    foto wordt getoond.
                  </li>
                  <li style={{ marginBottom: 8 }}>
                    <strong style={{ color: '#1D3557' }}>Resend</strong> — verzending van
                    inlogmails, meldingen en de wekelijkse samenvatting per e-mail.
                  </li>
                </ul>
                <p style={pStyle}>
                  Wij streven ernaar alle gegevens binnen de Europese Economische Ruimte (EER) te
                  verwerken. Indien een leverancier gegevens buiten de EER verwerkt, zorgen wij voor
                  passende waarborgen zoals modelcontractbepalingen van de Europese Commissie.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>6. Hoe wij uw gegevens beveiligen</h2>
                <ul style={{ fontSize: 15, color: '#404751', paddingLeft: 20 }}>
                  <li style={{ marginBottom: 8 }}>Al het verkeer naar en van het platform is versleuteld via HTTPS.</li>
                  <li style={{ marginBottom: 8 }}>Wachtwoorden worden nooit leesbaar opgeslagen, maar altijd gehasht met een moderne hash-functie.</li>
                  <li style={{ marginBottom: 8 }}>Foto&apos;s worden uitsluitend getoond via een gecontroleerd proxy-endpoint dat rol, organisatie en toestemming controleert.</li>
                  <li style={{ marginBottom: 8 }}>Rolgebaseerde toegang zorgt dat gebruikers alleen data zien binnen hun eigen organisatie en rol.</li>
                  <li style={{ marginBottom: 8 }}>Beveiligingsheaders (waaronder een Content-Security-Policy) beperken bekende webkwetsbaarheden.</li>
                </ul>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>7. Uw rechten</h2>
                <p style={pStyle}>
                  Onder de AVG heeft u recht op inzage, rectificatie, verwijdering, beperking van de
                  verwerking, bezwaar en dataportabiliteit. Voor gegevens die uw zorgorganisatie als
                  verwerkingsverantwoordelijke over u vastlegt, kunt u dit recht rechtstreeks bij ons
                  uitoefenen; wij handelen uw verzoek af in overleg met uw zorgorganisatie en in elk
                  geval binnen de wettelijke termijn van één maand.
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    marginTop: 16,
                  }}
                >
                  <div style={{ ...tableRow, gridTemplateColumns: '1fr', display: 'block' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#1D3557', fontSize: 14 }}>Inzage &amp; dataportabiliteit</p>
                    <p style={{ margin: '4px 0 8px', fontSize: 13.5 }}>
                      Bekijk en exporteer uw eigen gegevens als JSON-bestand via uw accountpagina.
                    </p>
                    <Link href="/account" style={{ color: '#005e9f', fontWeight: 600, fontSize: 13.5, textDecoration: 'none' }}>
                      Naar uw account →
                    </Link>
                  </div>
                  <div style={{ ...tableRow, gridTemplateColumns: '1fr', display: 'block' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#1D3557', fontSize: 14 }}>Rectificatie &amp; verwijdering</p>
                    <p style={{ margin: '4px 0 0', fontSize: 13.5 }}>
                      Neem contact op met uw coördinator, of stuur een e-mail naar onderstaand adres,
                      om onjuiste gegevens te laten corrigeren of uw account en bijbehorende gegevens
                      te laten verwijderen.
                    </p>
                  </div>
                </div>
                <p style={{ ...pStyle, marginTop: 16 }}>
                  Bent u niet tevreden over hoe wij uw verzoek of klacht afhandelen, dan heeft u het
                  recht een klacht in te dienen bij de{' '}
                  <a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noreferrer" style={{ color: '#005e9f' }}>
                    Autoriteit Persoonsgegevens
                  </a>.
                </p>
              </section>

              <section style={sectionStyle}>
                <h2 style={h2Style}>8. Wijzigingen</h2>
                <p style={pStyle}>
                  Wij kunnen deze privacyverklaring aanpassen, bijvoorbeeld bij wijzigingen in het
                  platform of de wetgeving. De datum bovenaan deze pagina geeft aan wanneer de
                  verklaring voor het laatst is bijgewerkt. Bij ingrijpende wijzigingen informeren wij
                  gebruikers via het platform of per e-mail.
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
