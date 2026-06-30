import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pilotprogramma | Welzijnsklik',
  description:
    'Start slim met de Welzijnsklik Pilot. Twee maanden, één afdeling, harde resultaten via de methode van Zinvol Uitproberen.',
};

const sectionPadding = 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)';
const maxWidth = 1440;

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 20,
  border: '1px solid rgba(192,199,211,0.25)',
  boxShadow: '0px 4px 20px rgba(29,53,87,0.05)',
  padding: 36,
};

export default function PilotPage() {
  const steps = [
    {
      n: 1,
      title: 'Scherpe, behapbare scope',
      body: 'We starten met een overzichtelijke pilot van twee maanden op één afdeling, locatie of binnen één team. Geen ECD-koppelingen of IT-complexiteit vooraf; we testen puur de zes kernfuncties en de adoptie op de werkvloer.',
    },
    {
      n: 2,
      title: 'Harde resultaten',
      body: 'Na twee maanden evalueren we de pilot op basis van concrete criteria: werkelijke tijdsbesparing voor uw coördinator, de actieve betrokkenheid van de familie en de instroom van nieuwe (micro-)vrijwilligers.',
    },
    {
      n: 3,
      title: 'Externe financiering mogelijk',
      body: 'Omdat Vincent van Munster (WeAreImpact B.V.) de software zelf bouwt, zijn er geen externe ontwikkelkosten. Voor de resterende operationele kosten ondersteunen wij u proactief bij het indienen van aanvragen bij maatschappelijke fondsen. Uw organisatie treedt op als aanvrager, Welzijnsklik is uw technologiepartner.',
    },
  ];

  const sectors = [
    {
      title: 'Intramurale Ouderenzorg',
      sub: 'Verpleeghuizen en woonzorgcentra',
    },
    {
      title: 'Thuiszorg en ambulante begeleiding',
      sub: 'Thuiszorgorganisaties',
    },
    {
      title: 'Gehandicaptenzorg en activiteitencentra',
      sub: 'Dagbesteding en begeleid wonen',
    },
  ];

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
              Zinvol uitproberen
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
              Start slim: de Welzijnsklik Pilot
            </h1>
            <p
              style={{
                fontSize: 'clamp(16px,2vw,20px)',
                color: '#404751',
                lineHeight: 1.7,
                maxWidth: 680,
              }}
            >
              Wij geloven niet in kostbare en ingewikkelde software-inkopen vooraf. We bewijzen de
              waarde van ons platform liever in de praktijk via de methode van Zinvol Uitproberen.
            </p>
          </div>
        </section>

        {/* Three steps section */}
        <section style={{ background: '#f3f4f5', padding: sectionPadding }}>
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
              Hoe de pilot werkt
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 28,
              }}
            >
              {steps.map((step) => (
                <div key={step.n} style={cardStyle}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 100,
                      background: '#FFB800',
                      color: '#191c1d',
                      fontWeight: 800,
                      fontSize: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20,
                    }}
                  >
                    {step.n}
                  </div>
                  <h3
                    style={{ fontSize: 20, fontWeight: 700, color: '#1D3557', marginBottom: 12 }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 15, color: '#404751', lineHeight: 1.65 }}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who qualifies section */}
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
              Voor welke organisaties?
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 20,
              }}
            >
              {sectors.map((s) => (
                <div
                  key={s.title}
                  style={{
                    background: '#ffffff',
                    borderRadius: 20,
                    border: '1px solid rgba(192,199,211,0.25)',
                    boxShadow: '0px 4px 20px rgba(29,53,87,0.05)',
                    padding: 28,
                  }}
                >
                  <h3
                    style={{ fontSize: 17, fontWeight: 700, color: '#1D3557', marginBottom: 8 }}
                  >
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 14, color: '#404751' }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section style={{ padding: sectionPadding, background: '#f3f4f5' }}>
          <div style={{ maxWidth, margin: '0 auto' }}>
            <div
              style={{
                background: '#1D3557',
                borderRadius: 40,
                padding: 'clamp(48px,6vw,80px) clamp(24px,4vw,64px)',
                textAlign: 'center',
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(24px,3vw,40px)',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: 16,
                }}
              >
                Klaar om te starten?
              </h2>
              <p
                style={{
                  fontSize: 'clamp(16px,2vw,18px)',
                  color: '#b0c7f1',
                  lineHeight: 1.65,
                  marginBottom: 36,
                  maxWidth: 560,
                  margin: '0 auto 36px',
                }}
              >
                De eerste pilot loopt bij De Meerwende in Badhoevedorp. Wij zoeken een tweede
                organisatie.
              </p>
              <a
                href="mailto:v.munster@weareimpact.nl"
                style={{
                  display: 'inline-block',
                  background: '#FFB800',
                  color: '#191c1d',
                  fontWeight: 700,
                  fontSize: 16,
                  padding: '14px 36px',
                  borderRadius: 100,
                  textDecoration: 'none',
                }}
              >
                Vraag de pilot aan
              </a>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
