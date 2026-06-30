import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support | Welzijnsklik',
  description:
    'Heeft u een vraag over het Welzijnsklik platform of de pilot? Neem direct contact op met Vincent van Munster.',
};

const sectionPadding = 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)';
const maxWidth = 1440;

const faqs = [
  {
    q: 'Hoe werkt de pilot?',
    a: 'De pilot duurt twee maanden en richt zich op één afdeling of team. We testen de zes kernfuncties zonder IT-koppelingen vooraf.',
  },
  {
    q: 'Zijn er kosten verbonden aan de pilot?',
    a: 'De pilot kent geen externe ontwikkelkosten. Voor operationele kosten (hosting, privacy-review) ondersteunen wij u bij fondsenwerving.',
  },
  {
    q: 'Hoe zit het met de AVG?',
    a: 'Welzijnsklik is Privacy-by-Design gebouwd. Data wordt opgeslagen op servers in de EU. Foto\'s worden nooit lokaal opgeslagen op apparaten van vrijwilligers.',
  },
  {
    q: 'Welke technische eisen zijn er?',
    a: 'Geen! De app werkt via de browser op elke smartphone, tablet of computer. Er is geen installatie of IT-afdeling nodig.',
  },
  {
    q: 'Hoe worden medewerkers getraind?',
    a: 'De interface is zo intuïtief dat geen formele training nodig is. Wij leveren een korte introductiehandleiding en zijn beschikbaar voor een kick-off sessie.',
  },
];

export default function SupportPage() {
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
        {/* Hero section */}
        <section style={{ background: '#ffffff', padding: sectionPadding }}>
          <div style={{ maxWidth, margin: '0 auto' }}>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(0,94,159,0.08)',
                color: '#005e9f',
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderRadius: 100,
                padding: '6px 16px',
                marginBottom: 24,
              }}
            >
              Hulp en ondersteuning
            </span>
            <h1
              style={{
                fontSize: 'clamp(32px,5vw,56px)',
                fontWeight: 800,
                color: '#1D3557',
                lineHeight: 1.15,
                marginBottom: 24,
                maxWidth: 720,
              }}
            >
              Hoe kunnen wij u helpen?
            </h1>
            <p
              style={{
                fontSize: 'clamp(16px,2vw,20px)',
                color: '#404751',
                lineHeight: 1.7,
                maxWidth: 600,
              }}
            >
              Heeft u een vraag over het platform of de pilot? Neem contact op met Vincent van
              Munster.
            </p>
          </div>
        </section>

        {/* Contact card section */}
        <section style={{ background: '#f3f4f5', padding: sectionPadding }}>
          <div
            style={{
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: 20,
                border: '1px solid rgba(192,199,211,0.25)',
                boxShadow: '0px 4px 20px rgba(29,53,87,0.05)',
                padding: 48,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: 'rgba(0,94,159,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <Mail size={30} color="#005e9f" />
              </div>
              <h2
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#1D3557',
                  marginBottom: 12,
                }}
              >
                Direct contact
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: '#404751',
                  lineHeight: 1.65,
                  marginBottom: 28,
                }}
              >
                Vincent van Munster staat klaar voor al uw vragen over het platform, de pilot of
                technische ondersteuning.
              </p>
              <a
                href="mailto:v.munster@weareimpact.nl"
                style={{
                  display: 'inline-block',
                  background: '#FFB800',
                  color: '#191c1d',
                  fontWeight: 700,
                  fontSize: 16,
                  padding: '14px 32px',
                  borderRadius: 100,
                  textDecoration: 'none',
                  marginBottom: 20,
                }}
              >
                v.munster@weareimpact.nl
              </a>
              <p style={{ fontSize: 13, color: '#404751', marginTop: 16 }}>
                Gemiddelde reactietijd: binnen 1 werkdag
              </p>
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <section style={{ background: '#ffffff', padding: sectionPadding }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(24px,3vw,36px)',
                fontWeight: 700,
                color: '#1D3557',
                marginBottom: 40,
                textAlign: 'center',
              }}
            >
              Veelgestelde vragen
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  style={{
                    background: '#ffffff',
                    borderRadius: 20,
                    border: '1px solid rgba(192,199,211,0.25)',
                    boxShadow: '0px 4px 20px rgba(29,53,87,0.05)',
                    padding: '28px 32px',
                  }}
                >
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: 17,
                      color: '#1D3557',
                      marginBottom: 10,
                    }}
                  >
                    {faq.q}
                  </p>
                  <p style={{ fontSize: 15, color: '#404751', lineHeight: 1.65 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
