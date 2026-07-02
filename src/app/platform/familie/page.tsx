import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import DemoWizardButton from '@/components/marketing/DemoWizardButton';
import Link from 'next/link';
import { Heart, ShieldCheck, Users, Bell, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'De Familie | Welzijnsklik',
  description:
    'Familieleden krijgen via een beveiligde, persoonlijke tijdlijn updates en foto’s te zien van hun naaste, en kunnen via de wervingsknop direct zelf helpen.',
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
    title: 'Uitnodiging ontvangen',
    body: 'U ontvangt van de organisatie een persoonlijke, beveiligde uitnodiging om de tijdlijn van uw naaste te volgen.',
  },
  {
    n: '2',
    title: 'Tijdlijn volgen',
    body: 'U ziet updates en foto’s van activiteiten zodra deze plaatsvinden — alleen zichtbaar voor wie daarvoor toestemming heeft.',
  },
  {
    n: '3',
    title: 'Zelf meehelpen',
    body: 'Via de geïntegreerde wervingsknop geeft u met één tik aan wanneer u zelf een activiteit wilt plannen of ondersteunen.',
  },
] as const;

const BENEFITS = [
  {
    icon: Heart,
    title: 'Rust en vertrouwen',
    body: 'U ziet met eigen ogen hoe het gaat met uw naaste, in plaats van te moeten afgaan op korte telefonische updates.',
  },
  {
    icon: ShieldCheck,
    title: 'Veilig en afgeschermd',
    body: 'De tijdlijn is alleen zichtbaar voor wie daartoe is uitgenodigd, en foto’s worden alleen gedeeld met toestemming van de organisatie.',
  },
  {
    icon: Users,
    title: 'Van toeschouwer naar helper',
    body: 'Via de wervingsknop (Samenzorg) kunt u laagdrempelig meehelpen bij activiteiten, wanneer het u uitkomt.',
  },
  {
    icon: Bell,
    title: 'Automatisch op de hoogte',
    body: 'Geen gemiste momenten meer: u krijgt een melding zodra er een nieuwe update op de tijdlijn van uw naaste staat.',
  },
] as const;

export default function FamiliePage() {
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
              Betrokkenheid en samen zorgen
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
              De Familie: dichtbij, ook op afstand
            </h1>
            <p
              style={{
                fontSize: 'clamp(16px,2vw,20px)',
                color: '#57534e',
                lineHeight: 1.7,
                maxWidth: 680,
              }}
            >
              Familieleden krijgen via een beveiligde, persoonlijke tijdlijn updates en
              foto&apos;s te zien van de mooie momenten van hun naaste. Dit geeft rust en
              schept vertrouwen. Via de geïntegreerde wervingsknop kunnen zij direct
              aangeven wanneer zij zelf een activiteit willen plannen of ondersteunen.
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
              Wilt u dit voor uw organisatie en de families?
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
