import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import Link from 'next/link';
import { Building2, Home, PersonStanding, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sectoren | Welzijnsklik',
  description:
    'Welzijnsklik past zich aan de dynamiek van uw specifieke zorg- of welzijnsomgeving aan: intramurale ouderenzorg, thuiszorg en gehandicaptenzorg.',
};

const sectionPadding = 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)';
const maxWidth = 1440;

const card = {
  background: '#ffffff',
  borderRadius: 24,
  border: '1px solid rgba(212,205,194,0.35)',
  boxShadow: '0px 4px 20px rgba(26,23,20,0.05)',
} as const;

const SECTORS = [
  {
    icon: Building2,
    title: 'Intramurale Ouderenzorg',
    sub: 'Verpleeghuizen en woonzorgcentra',
    body: 'Een doorlopende, transparante tijdlijn die de familie geruststelt en de zorgteams ontlast van telefonische updates.',
    href: '/sectoren/ouderenzorg',
  },
  {
    icon: Home,
    title: 'Thuiszorg en ambulante begeleiding',
    sub: 'Thuiszorgorganisaties',
    body: 'Directe kwaliteitsborging op afstand, met een sluitende registratie en betrokken kinderen die de zorg mede regelen.',
    href: '/sectoren/thuiszorg',
  },
  {
    icon: PersonStanding,
    title: 'Gehandicaptenzorg en activiteitencentra',
    sub: 'Dagbesteding en begeleid wonen',
    body: 'Minder communicatiedruk tussen begeleiders en ouders/voogden, met een wervingsknop voor grotere evenementen.',
    href: '/sectoren/gehandicaptenzorg',
  },
] as const;

export default function SectorenPage() {
  return (
    <div style={{ color: '#1a1714', background: '#faf8f5' }}>
      <MarketingHeader />
      <main style={{ paddingTop: 64 }}>
        {/* Hero */}
        <section style={{ background: '#ffffff', padding: sectionPadding }}>
          <div style={{ maxWidth, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#92400e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Modulair en aanpasbaar
            </p>
            <h1
              style={{
                fontSize: 'clamp(32px,5vw,56px)',
                fontWeight: 800,
                color: '#1a1714',
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              Past Welzijnsklik bij uw sector?
            </h1>
            <p
              style={{
                fontSize: 'clamp(16px,2vw,20px)',
                color: '#57534e',
                lineHeight: 1.7,
                maxWidth: 640,
                margin: '0 auto',
              }}
            >
              Welzijnsklik past zich aan de dynamiek van uw specifieke zorg- of
              welzijnsomgeving aan. Bekijk hieronder hoe het platform aansluit op uw
              sector.
            </p>
          </div>
        </section>

        {/* Sector cards */}
        <section style={{ background: '#f5f2ed', padding: sectionPadding }}>
          <div style={{ maxWidth, margin: '0 auto' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SECTORS.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.title}
                    href={s.href}
                    className="flex flex-col transition-all hover:-translate-y-0.5"
                    style={{ ...card, padding: 32 }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        background: 'rgba(217,119,6,0.08)',
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                      }}
                    >
                      <Icon size={26} color="#d97706" />
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#d97706', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                      {s.sub}
                    </p>
                    <h3 style={{ fontSize: 19, fontWeight: 700, color: '#1a1714', marginBottom: 16, lineHeight: '26px' }}>
                      {s.title}
                    </h3>
                    <p style={{ fontSize: 15, color: '#57534e', lineHeight: '24px', flex: 1 }}>{s.body}</p>
                    <div className="flex items-center gap-1" style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e8e3db' }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#d97706' }}>Meer weten</span>
                      <ChevronRight size={16} color="#d97706" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
