import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookiebeleid | Welzijnsklik',
  description:
    'Welzijnsklik gebruikt alleen strikt noodzakelijke cookies. Geen tracking-, marketing- of analytische cookies van derden.',
};

const sectionPadding = 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)';

export default function CookiesPage() {
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
              Cookiebeleid
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
                  Wat zijn cookies?
                </h2>
                <p style={{ fontSize: 15, color: '#404751' }}>
                  Cookies zijn kleine tekstbestanden die door een website op uw apparaat worden
                  opgeslagen wanneer u die website bezoekt. Ze worden gebruikt om informatie te
                  onthouden over uw bezoek, zoals uw inlogstatus of taalvoorkeur. Er bestaan
                  verschillende soorten cookies: strikt noodzakelijke cookies (vereist voor het
                  functioneren van de website), functionele cookies en tracking- of
                  marketingcookies.
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
                  Welke cookies gebruiken wij?
                </h2>
                <p style={{ fontSize: 15, color: '#404751', marginBottom: 20 }}>
                  Welzijnsklik maakt uitsluitend gebruik van strikt noodzakelijke cookies die
                  vereist zijn voor de werking van het platform.
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      background: '#f3f4f5',
                      borderRadius: 12,
                      padding: '20px 24px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 2fr 1fr',
                      gap: 12,
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#1D3557',
                    }}
                  >
                    <span>Cookie</span>
                    <span>Doel</span>
                    <span>Verloopt</span>
                  </div>
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 12,
                      border: '1px solid rgba(192,199,211,0.35)',
                      padding: '20px 24px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 2fr 1fr',
                      gap: 12,
                      fontSize: 14,
                      color: '#404751',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#1D3557' }}>Sessie-cookie</span>
                    <span>Authenticatie van uw inlogsessie op het platform</span>
                    <span>Bij sluiten browser</span>
                  </div>
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 12,
                      border: '1px solid rgba(192,199,211,0.35)',
                      padding: '20px 24px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 2fr 1fr',
                      gap: 12,
                      fontSize: 14,
                      color: '#404751',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#1D3557' }}>Veiligheids-cookie</span>
                    <span>CSRF-beveiliging ter bescherming van uw account</span>
                    <span>Bij sluiten browser</span>
                  </div>
                </div>
                <div
                  style={{
                    background: 'rgba(0,94,159,0.06)',
                    borderRadius: 12,
                    padding: '16px 20px',
                    borderLeft: '3px solid #005e9f',
                  }}
                >
                  <p style={{ fontSize: 14, color: '#1D3557', fontWeight: 600, margin: 0 }}>
                    Welzijnsklik gebruikt GEEN tracking-, marketing- of analytische cookies van
                    derden.
                  </p>
                </div>
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
                  Cookies van derden
                </h2>
                <p style={{ fontSize: 15, color: '#404751' }}>
                  Wij maken geen gebruik van advertentie- of analysecookies van derden. Wij
                  gebruiken geen Google Analytics, Facebook Pixel of vergelijkbare diensten. Uw
                  gedrag op het Welzijnsklik platform wordt niet gevolgd of gedeeld met externe
                  partijen voor commerciële doeleinden.
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
                  Cookiebeheer
                </h2>
                <p style={{ fontSize: 15, color: '#404751' }}>
                  Omdat wij alleen strikt noodzakelijke cookies plaatsen, is er geen toestemming
                  vereist op grond van de Telecommunicatiewet of de AVG. U kunt cookies via uw
                  browserinstellingen bekijken en verwijderen. Houd er rekening mee dat het
                  verwijderen van sessie-cookies ertoe leidt dat u opnieuw moet inloggen op het
                  platform.
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
                  Heeft u vragen over ons cookiebeleid? Neem dan contact op via{' '}
                  <a
                    href="mailto:v.munster@weareimpact.nl"
                    style={{ color: '#005e9f', textDecoration: 'none', fontWeight: 500 }}
                  >
                    v.munster@weareimpact.nl
                  </a>
                  .
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
