import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import Link from 'next/link';
import { LayoutDashboard, Smartphone, Heart, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform | Welzijnsklik',
  description:
    'Eén platform, drie flows: Welzijnsklik brengt coördinator, vrijwilliger en familie samen in één afgeschermde, rolgebaseerde omgeving.',
};

const sectionPadding = 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)';
const maxWidth = 1440;

const card = {
  background: '#ffffff',
  borderRadius: 24,
  border: '1px solid rgba(212,205,194,0.35)',
  boxShadow: '0px 4px 20px rgba(26,23,20,0.05)',
} as const;

const FLOWS = [
  {
    icon: LayoutDashboard,
    role: 'De Coördinator',
    sub: 'Regie en rust',
    body: 'Volledige controle over cliënten, fototoestemming en vrijwilligers, met automatische rapportage in plaats van handmatige urenlijsten.',
    href: '/platform/coordinator',
  },
  {
    icon: Smartphone,
    role: 'De Vrijwilliger',
    sub: 'Focus op de cliënt',
    body: 'Geen administratieve rompslomp: app openen, cliënt selecteren, activiteit loggen — binnen één minuut afgerond.',
    href: '/platform/vrijwilliger',
  },
  {
    icon: Heart,
    role: 'De Familie',
    sub: 'Betrokkenheid en samen zorgen',
    body: 'Een beveiligde, persoonlijke tijdlijn met updates en foto’s, en een wervingsknop om zelf mee te helpen.',
    href: '/platform/familie',
  },
] as const;

export default function PlatformPage() {
  return (
    <div style={{ color: '#1a1714', background: '#faf8f5' }}>
      <MarketingHeader />
      <main style={{ paddingTop: 64 }}>
        {/* Hero */}
        <section style={{ background: '#ffffff', padding: sectionPadding }}>
          <div style={{ maxWidth, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#92400e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Rolgebaseerde omgeving
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
              Eén platform, drie flows
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
              Welzijnsklik brengt drie werelden naadloos samen in één afgeschermde
              omgeving. Bekijk hieronder hoe het platform werkt voor elke rol.
            </p>
          </div>
        </section>

        {/* Flow cards */}
        <section style={{ background: '#f5f2ed', padding: sectionPadding }}>
          <div style={{ maxWidth, margin: '0 auto' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FLOWS.map((flow) => {
                const Icon = flow.icon;
                return (
                  <Link
                    key={flow.role}
                    href={flow.href}
                    className="flex flex-col transition-all hover:-translate-y-0.5"
                    style={{ ...card, padding: 36 }}
                  >
                    <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
                      <div style={{ width: 52, height: 52, background: 'rgba(217,119,6,0.08)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={26} color="#d97706" />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#d97706', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {flow.sub}
                        </p>
                        <h3 style={{ fontSize: 19, fontWeight: 700, color: '#1a1714', lineHeight: '26px' }}>{flow.role}</h3>
                      </div>
                    </div>
                    <div style={{ height: 1, background: '#e8e3db', marginBottom: 20 }} />
                    <p style={{ fontSize: 15, color: '#57534e', lineHeight: '24px', flex: 1 }}>{flow.body}</p>
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
