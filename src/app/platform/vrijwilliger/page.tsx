import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import DemoWizardButton from '@/components/marketing/DemoWizardButton';
import Link from 'next/link';
import { Smartphone, Camera, Zap, Heart, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'De Vrijwilliger | Welzijnsklik',
  description:
    'Geen administratieve rompslomp. Open de app, selecteer de cliënt en log de activiteit binnen één minuut.',
};

const sectionPadding = 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)';
const maxWidth = 1440;

const card = {
  background: '#ffffff',
  borderRadius: 20,
  border: '1px solid rgba(212,205,194,0.35)',
  boxShadow: '0px 4px 20px rgba(26,23,20,0.05)',
} as const;

const STEPS = [
  {
    n: '1',
    title: 'App openen',
    body: 'U opent de app en ziet direct een overzicht van de cliënten waar u aan gekoppeld bent — geen ingewikkelde menu’s.',
  },
  {
    n: '2',
    title: 'Cliënt selecteren',
    body: 'U kiest de cliënt waarmee u de activiteit heeft ondernomen. Alleen de informatie die voor u relevant is, wordt getoond.',
  },
  {
    n: '3',
    title: 'Activiteit loggen',
    body: 'U maakt eventueel een foto met de in-app camera en logt de activiteit met een paar tikken op het scherm. Binnen één minuut afgerond.',
  },
] as const;

const BENEFITS = [
  {
    icon: Zap,
    title: 'Binnen één minuut afgerond',
    body: 'Geen administratieve rompslomp. Focus op de cliënt, niet op formulieren.',
  },
  {
    icon: Camera,
    title: 'Veilig foto’s delen',
    body: 'Foto’s maakt u met de in-app camera. Ze worden nooit lokaal op uw toestel opgeslagen en alleen gedeeld met wie daarvoor toestemming heeft gegeven.',
  },
  {
    icon: Smartphone,
    title: 'Intuïtief voor iedereen',
    body: 'De interface is extreem eenvoudig en vereist geen technische voorkennis — ook niet als u minder digitaal vaardig bent.',
  },
  {
    icon: Heart,
    title: 'Direct zichtbaar resultaat',
    body: 'Uw activiteit komt terecht bij de coördinator én, indien gewenst, bij de familie — zodat uw inzet gezien wordt.',
  },
] as const;

export default function VrijwilligerPage() {
  return (
    <div style={{ color: '#1a1714', background: '#faf8f5' }}>
      <MarketingHeader />
      <main style={{ paddingTop: 64 }}>
        {/* Hero */}
        <section style={{ background: '#ffffff', padding: sectionPadding }}>
          <div style={{ maxWidth, margin: '0 auto' }}>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(217,119,6,0.08)',
                color: '#d97706',
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderRadius: 100,
                padding: '6px 16px',
                marginBottom: 24,
              }}
            >
              Focus op de cliënt
            </span>
            <h1
              style={{
                fontSize: 'clamp(32px,5vw,56px)',
                fontWeight: 800,
                color: '#1a1714',
                lineHeight: 1.15,
                marginBottom: 24,
                maxWidth: 720,
              }}
            >
              De Vrijwilliger: geen administratieve rompslomp
            </h1>
            <p
              style={{
                fontSize: 'clamp(16px,2vw,20px)',
                color: '#57534e',
                lineHeight: 1.7,
                maxWidth: 680,
              }}
            >
              De vrijwilliger opent de app, selecteert de cliënt, maakt eventueel een foto
              en logt de activiteit met een paar tikken op het scherm. Binnen één minuut
              afgerond — zodat er meer tijd overblijft voor waar het echt om gaat.
            </p>
          </div>
        </section>

        {/* Hoe het werkt */}
        <section style={{ background: '#f5f2ed', padding: sectionPadding }}>
          <div style={{ maxWidth, margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(24px,3vw,36px)',
                fontWeight: 700,
                color: '#1a1714',
                marginBottom: 40,
                textAlign: 'center',
              }}
            >
              Hoe het werkt
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STEPS.map((step) => (
                <div key={step.n} style={{ ...card, padding: 32 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: '#d97706',
                      color: '#fff',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 16,
                      marginBottom: 20,
                    }}
                  >
                    {step.n}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1714', marginBottom: 12 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 15, color: '#57534e', lineHeight: 1.65 }}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section style={{ background: '#ffffff', padding: sectionPadding }}>
          <div style={{ maxWidth, margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(24px,3vw,36px)',
                fontWeight: 700,
                color: '#1a1714',
                marginBottom: 40,
                textAlign: 'center',
              }}
            >
              Wat dit voor u betekent
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {BENEFITS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-5" style={{ ...card, padding: 32 }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        background: 'rgba(217,119,6,0.08)',
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={26} color="#d97706" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1a1714', marginBottom: 8 }}>
                        {item.title}
                      </h3>
                      <p style={{ fontSize: 15, color: '#57534e', lineHeight: '23px' }}>{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#f5f2ed', padding: sectionPadding, textAlign: 'center' }}>
          <div style={{ maxWidth, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 700, color: '#1a1714', marginBottom: 16 }}>
              Wilt u vrijwilligers hiermee laten werken?
            </h2>
            <p style={{ fontSize: 'clamp(16px,2vw,18px)', color: '#57534e', lineHeight: 1.65, marginBottom: 36 }}>
              Vraag een vrijblijvende demonstratie aan of start direct met een pilot.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <DemoWizardButton>
                <button
                  className="flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{ background: '#F59E0B', color: '#fff', fontSize: 16, fontWeight: 700, padding: '14px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(245,158,11,0.30)' }}
                >
                  Vraag een demonstratie aan
                  <ArrowRight size={18} />
                </button>
              </DemoWizardButton>
              <Link
                href="/pilot"
                className="flex items-center justify-center gap-2 transition-all"
                style={{ fontSize: 16, fontWeight: 600, color: '#d97706', border: '2px solid #d97706', padding: '14px 28px', borderRadius: 12 }}
              >
                Bekijk de pilot
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
