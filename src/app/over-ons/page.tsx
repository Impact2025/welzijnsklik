import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import Link from 'next/link';
import { Target, Briefcase } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Over Welzijnsklik | WeAreImpact B.V.',
  description:
    'Welzijnsklik is ontwikkeld vanuit de praktijk door Vincent van Munster. Met meer dan 15 jaar bestuurlijke ervaring in de zorg- en welzijnssector.',
};

const sectionPadding = 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)';
const maxWidth = 1440;

export default function OverOnsPage() {
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
              Over ons
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
              Welzijnsklik: zorg menselijker maken
            </h1>
            <p
              style={{
                fontSize: 'clamp(16px,2vw,20px)',
                color: '#404751',
                lineHeight: 1.7,
                maxWidth: 680,
              }}
            >
              Welzijnsklik is ontwikkeld vanuit de praktijk door Vincent van Munster. Met meer dan
              15 jaar bestuurlijke ervaring in de zorg- en welzijnssector combineert hij diepgaande
              kennis van de werkvloer met het vermogen om zelf werkende, innovatieve
              softwareoplossingen te bouwen.
            </p>
          </div>
        </section>

        {/* Quote section */}
        <section style={{ background: '#f3f4f5', padding: sectionPadding }}>
          <div style={{ maxWidth, margin: '0 auto' }}>
            <blockquote
              style={{
                borderLeft: '4px solid #FFB800',
                paddingLeft: 32,
                maxWidth: 800,
                margin: '0 auto',
              }}
            >
              <p
                style={{
                  fontSize: 'clamp(18px,2.5vw,24px)',
                  fontStyle: 'italic',
                  color: '#1D3557',
                  lineHeight: 1.65,
                  marginBottom: 20,
                }}
              >
                "Traditionele adviseurs schrijven een beleidsplan. Mijn aanpak is anders: ik
                implementeer een werkende oplossing en automatiseer het proces, zodat uw
                professionals weer tijd krijgen voor menselijk contact."
              </p>
              <footer
                style={{ fontSize: 15, fontWeight: 600, color: '#404751', fontStyle: 'normal' }}
              >
                — Vincent van Munster, WeAreImpact B.V.
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Mission section */}
        <section style={{ background: '#ffffff', padding: sectionPadding }}>
          <div style={{ maxWidth, margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(24px,3vw,36px)',
                fontWeight: 700,
                color: '#1D3557',
                marginBottom: 40,
                textAlign: 'center',
              }}
            >
              Wie wij zijn
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 28,
              }}
            >
              {/* Card 1 */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 20,
                  border: '1px solid rgba(192,199,211,0.25)',
                  boxShadow: '0px 4px 20px rgba(29,53,87,0.05)',
                  padding: 36,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: 'rgba(0,94,159,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <Target size={26} color="#005e9f" />
                </div>
                <h3
                  style={{ fontSize: 20, fontWeight: 700, color: '#1D3557', marginBottom: 12 }}
                >
                  Onze missie
                </h3>
                <p style={{ fontSize: 16, color: '#404751', lineHeight: 1.65 }}>
                  De menselijke maat herstellen in de zorg door technologie die medewerkers
                  ontlast, families verbindt en bewoners meer kwaliteit van leven geeft.
                </p>
              </div>

              {/* Card 2 */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 20,
                  border: '1px solid rgba(192,199,211,0.25)',
                  boxShadow: '0px 4px 20px rgba(29,53,87,0.05)',
                  padding: 36,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: 'rgba(0,94,159,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <Briefcase size={26} color="#005e9f" />
                </div>
                <h3
                  style={{ fontSize: 20, fontWeight: 700, color: '#1D3557', marginBottom: 12 }}
                >
                  WeAreImpact B.V.
                </h3>
                <p style={{ fontSize: 16, color: '#404751', lineHeight: 1.65 }}>
                  WeAreImpact B.V. is het bedrijf achter Welzijnsklik. Wij combineren bestuurlijke
                  kennis van de zorg- en welzijnssector met hands-on software-ontwikkeling.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pilot section */}
        <section style={{ background: '#f3f4f5', padding: sectionPadding }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(24px,3vw,36px)',
                fontWeight: 700,
                color: '#1D3557',
                marginBottom: 20,
              }}
            >
              De eerste pilot: De Meerwende, Badhoevedorp
            </h2>
            <p
              style={{
                fontSize: 'clamp(16px,2vw,18px)',
                color: '#404751',
                lineHeight: 1.7,
                marginBottom: 36,
              }}
            >
              De eerste pilot wordt momenteel voorbereid op een afdeling van ouderenzorglocatie De
              Meerwende in Badhoevedorp. Om de validatie breder door te zetten, zoeken wij
              proactief naar een tweede, onafhankelijke organisatie — of dit nu binnen de
              ouderenzorg, gehandicaptenzorg of thuiszorg is.
            </p>
            <Link
              href="/pilot"
              style={{
                display: 'inline-block',
                background: '#FFB800',
                color: '#191c1d',
                fontWeight: 700,
                fontSize: 16,
                padding: '14px 32px',
                borderRadius: 100,
                textDecoration: 'none',
              }}
            >
              Bekijk de pilotprogramma
            </Link>
          </div>
        </section>

        {/* Contact CTA section */}
        <section
          style={{ background: '#ffffff', padding: sectionPadding, textAlign: 'center' }}
        >
          <div style={{ maxWidth, margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(24px,3vw,36px)',
                fontWeight: 700,
                color: '#1D3557',
                marginBottom: 16,
              }}
            >
              Neem contact op
            </h2>
            <p
              style={{
                fontSize: 'clamp(16px,2vw,18px)',
                color: '#404751',
                lineHeight: 1.65,
                marginBottom: 36,
              }}
            >
              Interesse in samenwerking of een vrijblijvend gesprek?
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
              }}
            >
              Stuur een e-mail
            </a>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
