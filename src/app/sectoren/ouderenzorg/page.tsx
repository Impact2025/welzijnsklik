import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import DemoWizardButton from '@/components/marketing/DemoWizardButton';
import Link from 'next/link';
import { Building2, Clock, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intramurale Ouderenzorg | Welzijnsklik',
  description:
    'Een doorlopende, transparante tijdlijn voor familie van bewoners in verpleeghuizen en woonzorgcentra, die telefonische updates naar de zorgpost overbodig maakt.',
};

const sectionPadding = 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)';
const maxWidth = 1440;

const card = {
  background: '#ffffff',
  borderRadius: 20,
  border: '1px solid rgba(212,205,194,0.35)',
  boxShadow: '0px 4px 20px rgba(26,23,20,0.05)',
} as const;

const BENEFITS = [
  {
    icon: Clock,
    title: 'Minder telefoontjes naar de zorgpost',
    body: 'Familie hoeft niet meer te bellen voor een update — de tijdlijn geeft direct antwoord op de vraag "hoe gaat het vandaag met mijn naaste?".',
  },
  {
    icon: Users,
    title: 'Ontlasting van het zorgteam',
    body: 'Zorgmedewerkers en vrijwilligers loggen activiteiten in seconden, in plaats van tijd kwijt te zijn aan telefonisch contact met familie.',
  },
  {
    icon: ShieldCheck,
    title: 'Veilig en AVG-proof',
    body: 'Fototoestemming wordt per bewoner vastgelegd en gerespecteerd. Alleen uitgenodigde familieleden zien de tijdlijn.',
  },
  {
    icon: Building2,
    title: 'Eén systeem voor de hele afdeling',
    body: 'Coördinatoren houden overzicht over alle bewoners, activiteiten en vrijwilligers binnen de locatie of afdeling.',
  },
] as const;

export default function OuderenzorgPage() {
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
              Verpleeghuizen en woonzorgcentra
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
              Intramurale ouderenzorg: transparantie voor de familie
            </h1>
            <p
              style={{
                fontSize: 'clamp(16px,2vw,20px)',
                color: '#57534e',
                lineHeight: 1.7,
                maxWidth: 680,
              }}
            >
              Familie weet vaak niet wat hun naaste overdag doet, wat leidt tot frequente,
              tijdrovende telefoontjes naar de zorgpost. Welzijnsklik biedt een doorlopende,
              transparante tijdlijn die de familie geruststelt en de zorgteams ontlast van
              telefonische updates.
            </p>
          </div>
        </section>

        {/* Benefits */}
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
              Wat dit voor uw organisatie betekent
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
        <section style={{ background: '#ffffff', padding: sectionPadding, textAlign: 'center' }}>
          <div style={{ maxWidth, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 700, color: '#1a1714', marginBottom: 16 }}>
              Benieuwd hoe dit werkt binnen uw locatie?
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
