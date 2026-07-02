import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import DemoWizardButton from '@/components/marketing/DemoWizardButton';
import Link from 'next/link';
import { LayoutDashboard, ShieldCheck, Clock, Bell, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'De Coördinator | Welzijnsklik',
  description:
    'Volledige regie zonder administratieve rompslomp. Beheer fototoestemming per cliënt en ontvang automatisch een rapportage zodra een activiteit is afgerond.',
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
    title: 'Cliënten en toestemming beheren',
    body: 'U legt per cliënt vast welke fototoestemming van toepassing is, conform de privacyrichtlijnen van uw organisatie. Alles vanuit één overzichtelijk dashboard.',
  },
  {
    n: '2',
    title: 'Vrijwilligers koppelen',
    body: 'U koppelt vrijwilligers aan cliënten en geeft ze toegang tot precies de informatie die ze nodig hebben — niet meer en niet minder.',
  },
  {
    n: '3',
    title: 'Automatische rapportage',
    body: 'Zodra een activiteit is afgerond ontvangt u direct een automatisch briefje in uw dashboard — wie, wat, hoe lang, bijzonderheden. Geen handmatige urenlijsten meer.',
  },
] as const;

const BENEFITS = [
  {
    icon: Clock,
    title: 'Gemiddeld 3 uur per week besparing',
    body: 'Onze applicatie automatiseert de registratie van activiteiten, zodat u minder tijd kwijt bent aan Excel, losse mailtjes en telefoontjes.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-by-design',
    body: "Fototoestemming wordt per cliënt vastgelegd en foto's worden nooit lokaal op het toestel van de vrijwilliger opgeslagen.",
  },
  {
    icon: Bell,
    title: 'Directe signalering',
    body: 'Bijzonderheden tijdens een activiteit komen direct bij u binnen, zodat u snel kunt schakelen wanneer dat nodig is.',
  },
  {
    icon: LayoutDashboard,
    title: 'Eén overzichtelijk dashboard',
    body: 'Alle activiteiten, cliënten en vrijwilligers overzichtelijk bij elkaar — geen losse systemen of spreadsheets meer.',
  },
] as const;

export default function CoordinatorPage() {
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
              Regie en rust
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
              De Coördinator: volledige regie, zonder administratieve rompslomp
            </h1>
            <p
              style={{
                fontSize: 'clamp(16px,2vw,20px)',
                color: '#57534e',
                lineHeight: 1.7,
                maxWidth: 680,
              }}
            >
              U behoudt de volledige controle. U beheert per cliënt de specifieke
              fototoestemming conform de privacyrichtlijnen. Zodra een activiteit is
              afgerond, ontvangt u direct een automatisch briefje in uw dashboard — wie,
              wat, hoe lang, bijzonderheden. Geen handmatige urenlijsten meer.
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
              Benieuwd hoe dit werkt binnen uw organisatie?
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
