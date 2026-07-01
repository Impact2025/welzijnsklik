'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Clock,
  Users,
  ShieldCheck,
  Accessibility,
  LayoutDashboard,
  Smartphone,
  Heart,
  Building2,
  Home,
  PersonStanding,
  ChevronRight,
  ArrowRight,
  Quote,
} from 'lucide-react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import DemoInterestForm from './DemoInterestForm';

/* ─── Data ─────────────────────────────────────────── */

const WHY = [
  {
    icon: Clock,
    title: 'Directe administratieve verlichting',
    body: 'Onze applicatie automatiseert de registratie van activiteiten. Coördinatoren besparen hierdoor gemiddeld 3 uur per week aan handmatig regelwerk via Excel, losse mailtjes en telefoontjes.',
    color: '#d97706',
    bg: 'rgba(217,119,6,0.08)',
  },
  {
    icon: Users,
    title: 'Activeer het informele netwerk',
    body: "Dankzij onze unieke wervingsknop (Samenzorg) veranderen familieleden van passieve toeschouwers in proactieve helpers die laagdrempelig micro-taken oppakken.",
    color: '#92400e',
    bg: 'rgba(146,64,14,0.08)',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-by-Design — AVG-proof',
    body: "Gegevensbeveiliging en cliëntveiligheid zijn ingebouwd. Foto's worden met de in-app camera gemaakt en worden nooit lokaal op het toestel van de vrijwilliger opgeslagen.",
    color: '#d97706',
    bg: 'rgba(217,119,6,0.08)',
  },
  {
    icon: Accessibility,
    title: 'Toegankelijk voor iedereen',
    body: 'De interface is extreem intuïtief en vereist geen computerwerkgeheugen. Digitaal minder vaardige vrijwilligers kunnen direct en frustratievrij met de app werken.',
    color: '#92400e',
    bg: 'rgba(146,64,14,0.08)',
  },
] as const;

const FLOWS = [
  {
    icon: LayoutDashboard,
    number: '1',
    role: 'De Coördinator',
    sub: 'Regie en rust',
    body: "U behoudt de volledige controle. U beheert per cliënt de specifieke fototoestemming conform de privacyrichtlijnen. Zodra een activiteit is afgerond, ontvangt u direct een automatisch briefje in uw dashboard — wie, wat, hoe lang, bijzonderheden. Geen handmatige urenlijsten meer.",
    color: '#d97706',
  },
  {
    icon: Smartphone,
    number: '2',
    role: 'De Vrijwilliger',
    sub: 'Focus op de cliënt',
    body: 'Geen administratieve rompslomp. De vrijwilliger opent de app, selecteert de cliënt, maakt eventueel een foto en logt de activiteit met een paar tikken op het scherm. Binnen één minuut afgerond.',
    color: '#d97706',
  },
  {
    icon: Heart,
    number: '3',
    role: 'De Familie',
    sub: 'Betrokkenheid en samen zorgen',
    body: "Familieleden krijgen via een beveiligde, persoonlijke tijdlijn updates en foto's te zien van de mooie momenten van hun naaste. Dit geeft rust en schept vertrouwen. Via de geïntegreerde wervingsknop kunnen zij direct aangeven wanneer zij zelf een activiteit willen plannen of ondersteunen.",
    color: '#d97706',
  },
] as const;

const SECTORS = [
  {
    icon: Building2,
    title: 'Intramurale Ouderenzorg',
    problem: 'Familie weet vaak niet wat hun naaste overdag doet, wat leidt tot frequente, tijdrovende telefoontjes naar de zorgpost.',
    impact: 'Een doorlopende, transparante tijdlijn die de familie geruststelt en de zorgteams ontlast van telefonische updates.',
  },
  {
    icon: Home,
    title: 'Thuiszorg en ambulante begeleiding',
    problem: 'Vrijwilligers komen bij cliënten thuis; als coördinator op afstand is het loggen van uren en het signaleren van bijzonderheden een uitdaging.',
    impact: 'Directe kwaliteitsborging. Het systeem genereert automatisch een sluitende registratie. Kinderen die op afstand de zorg regelen, blijven nauw betrokken.',
  },
  {
    icon: PersonStanding,
    title: 'Gehandicaptenzorg en activiteitencentra',
    problem: 'Hoge communicatiedruk tussen begeleiders en de actieve achterban (ouders/voogden) over de dagbesteding.',
    impact: "Begeleiders delen in een handomdraai de resultaten van de dagbesteding. Ouders worden via de Samenzorg-knop direct uitgenodigd om mee te helpen bij grotere evenementen.",
  },
] as const;

const PILOT = [
  {
    n: '1',
    title: 'Scherpe, behapbare scope',
    body: 'We starten met een overzichtelijke pilot van twee maanden op één afdeling, locatie of binnen één team. Geen ECD-koppelingen of IT-complexiteit vooraf; we testen de zes kernfuncties en de adoptie op de werkvloer.',
  },
  {
    n: '2',
    title: 'Harde resultaten',
    body: 'Na twee maanden evalueren we op basis van concrete criteria: werkelijke tijdsbesparing voor uw coördinator, de actieve betrokkenheid van de familie en de instroom van nieuwe vrijwilligers.',
  },
  {
    n: '3',
    title: 'Externe financiering mogelijk',
    body: 'Omdat Vincent van Munster (WeAreImpact B.V.) de software zelf bouwt, zijn er geen externe ontwikkelkosten. Voor operationele kosten ondersteunen wij u proactief bij aanvragen bij maatschappelijke fondsen.',
  },
] as const;

/* ─── Styles (shared inline helpers) ───────────────── */
const card = {
  background: '#fff',
  borderRadius: 20,
  border: '1px solid rgba(212,205,194,0.35)',
  boxShadow: '0px 4px 20px rgba(26,23,20,0.05)',
} as const;

/* ─── Component ─────────────────────────────────────── */
export default function HomeClient() {
  const [visible, setVisible]     = useState<Set<number>>(new Set());
  const cardRefs                  = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible((prev) => new Set([...prev, Number(e.target.getAttribute('data-card'))]));
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const reveal = (i: number) => ({
    opacity: visible.has(i) ? 1 : 0,
    transform: visible.has(i) ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.55s ease ${(i % 4) * 80}ms, transform 0.55s ease ${(i % 4) * 80}ms`,
  });

  // Pre-assigned index ranges per section: why: 0-3, flows: 4-6, sectors: 7-9, pilot: 10-12

  return (
    <div style={{ color: '#1a1714', background: '#faf8f5' }}>

      <MarketingHeader />

      <main style={{ paddingTop: 64 }}>

        {/* ━━ Hero ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{ padding: 'clamp(48px,8vw,120px) clamp(16px,4vw,48px)' }}>
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center" style={{ gap: 64 }}>

            {/* Text */}
            <div className="flex-1 space-y-6" style={{ maxWidth: 600 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
                style={{ background: 'rgba(254,243,199,0.6)', border: '1px solid #fde68a' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#92400e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Innovatie in de zorg
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(30px,5vw,48px)', fontWeight: 700, color: '#1a1714', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                Verbind vrijwilligers, cliënten en familie{' '}
                <span style={{ color: '#d97706' }}>met één klik.</span>
              </h1>

              <p style={{ fontSize: 17, color: '#57534e', lineHeight: '28px' }}>
                Of het nu gaat om een verpleeghuis, een activiteitencentrum voor mensen met een
                beperking, of zorg aan huis: de menselijke maat staat onder druk door stijgende
                zorgvragen en personeelskrapte. Vrijwilligers en informele zorgverleners zijn
                onmisbaar om de kwaliteit van leven te waarborgen.
              </p>
              <p style={{ fontSize: 17, color: '#57534e', lineHeight: '28px' }}>
                Wij automatiseren de randzaken voor uw organisatie, openen de black box voor
                het thuisfront, en maken van betrokken familieleden een actieve bron van
                nieuwe ondersteuning.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a href="#contact"
                  className="flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{ background: '#F59E0B', color: '#fff', fontSize: 16, fontWeight: 700, padding: '14px 32px', borderRadius: 12, boxShadow: '0 8px 24px rgba(245,158,11,0.30)' }}>
                  Vrijblijvende demonstratie aanvragen
                  <ArrowRight size={18} />
                </a>
                <a href="#flows"
                  className="flex items-center justify-center gap-2 transition-all"
                  style={{ fontSize: 16, fontWeight: 600, color: '#d97706', border: '2px solid #d97706', padding: '14px 28px', borderRadius: 12 }}>
                  Bekijk het platform
                </a>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 relative w-full" style={{ height: 'clamp(320px,45vw,560px)', minWidth: 0 }}>
              <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl pointer-events-none"
                style={{ background: 'rgba(245,158,11,0.08)' }} />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full blur-3xl pointer-events-none"
                style={{ background: 'rgba(254,243,199,0.25)' }} />
              <div className="relative w-full h-full overflow-hidden"
                style={{ borderRadius: 28, border: '8px solid #fff', boxShadow: '0 12px 40px rgba(26,23,20,0.12)' }}>
                <img
                  alt="Groep ouderen en een zorgverlener die samen knutselen aan een tafel in een lichte woonkamer"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida/AP1WRLsfixes5OyvADO7FAZgVc2otFHYfWn7mmp21IGcN-aCkSBpWHr-KWcnLEUnjOi89Gwt2NZr9A0Qkww7Hie7ApdccrQfgDCssVjO-MkFbeYklHosdROr1--y3fdNOlIk-fU-3C3v0ulE8-NSnh4z4BaGqYkTC8PEM4IYozwKCzZpv341p-A9EqoyauyF0ZVC67w2llyoOhgH3N7ucqvkADIBIe9EXRaPGbxJUeoqp4tiVmHqI0wAoeOiOI7d"
                />
              </div>
              {/* Floating card */}
              <div className="absolute bottom-5 -left-4 md:-left-8 flex items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: '12px 16px', boxShadow: '0 4px 20px rgba(26,23,20,0.10)', border: '1px solid rgba(212,205,194,0.4)', animation: 'float 3s ease-in-out infinite' }}>
                <div style={{ width: 44, height: 44, background: 'rgba(217,119,6,0.10)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Heart size={20} color="#d97706" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#d97706', lineHeight: '20px' }}>Nieuw geluksmoment!</p>
                  <p style={{ fontSize: 12, color: '#57534e' }}>Bewoner Mevr. Janssen heeft genoten</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━ Waarom Welzijnsklik ━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="waarom" style={{ background: '#f5f2ed', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)' }}>
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center" style={{ marginBottom: 56 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#92400e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                Voor bestuurders, directie en coördinatoren
              </p>
              <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#1a1714', marginBottom: 12 }}>
                Waarom Welzijnsklik?
              </h2>
              <p style={{ fontSize: 16, color: '#57534e', maxWidth: 580, margin: '0 auto', lineHeight: '24px' }}>
                Als zorg- of welzijnsbestuurder zoekt u oplossingen met directe operationele impact
                en een waterdicht juridisch fundament. Welzijnsklik is ontworpen om uw organisatie
                direct te ontlasten.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {WHY.map((item, i) => {
                const Icon = item.icon;
                const idx = i;
                return (
                  <div key={item.title} ref={(el) => { cardRefs.current[idx] = el; }} data-card={idx}
                    className="flex items-start gap-5"
                    style={{ ...card, padding: 32, ...reveal(idx) }}>
                    <div style={{ width: 52, height: 52, background: item.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={26} color={item.color} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1a1714', marginBottom: 8 }}>{item.title}</h3>
                      <p style={{ fontSize: 15, color: '#57534e', lineHeight: '23px' }}>{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ━━ Drie Flows ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="flows" style={{ background: '#fff', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)' }}>
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center" style={{ marginBottom: 56 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#92400e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                Rolgebaseerde omgeving
              </p>
              <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#1a1714', marginBottom: 12 }}>
                Eén platform, drie flows
              </h2>
              <p style={{ fontSize: 16, color: '#57534e', maxWidth: 520, margin: '0 auto', lineHeight: '24px' }}>
                Welzijnsklik brengt drie werelden naadloos samen in één afgeschermde omgeving.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FLOWS.map((flow, i) => {
                const Icon = flow.icon;
                const idx = 4 + i;
                return (
                  <div key={flow.role} ref={(el) => { cardRefs.current[idx] = el; }} data-card={idx}
                    className="flex flex-col"
                    style={{ ...card, borderRadius: 24, padding: 36, ...reveal(idx) }}>
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
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ━━ Sectoren ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="sectoren" style={{ background: '#f5f2ed', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)' }}>
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center" style={{ marginBottom: 56 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#92400e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                Modulair en aanpasbaar
              </p>
              <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#1a1714', marginBottom: 12 }}>
                Past Welzijnsklik bij uw sector?
              </h2>
              <p style={{ fontSize: 16, color: '#57534e', maxWidth: 540, margin: '0 auto', lineHeight: '24px' }}>
                Welzijnsklik past zich aan de dynamiek van uw specifieke zorg- of welzijnsomgeving aan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SECTORS.map((s, i) => {
                const Icon = s.icon;
                const idx = 7 + i;
                return (
                  <div key={s.title} ref={(el) => { cardRefs.current[idx] = el; }} data-card={idx}
                    className="flex flex-col"
                    style={{ ...card, borderRadius: 24, padding: 32, ...reveal(idx) }}>
                    <div style={{ width: 52, height: 52, background: 'rgba(217,119,6,0.08)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                      <Icon size={26} color="#d97706" />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1714', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #e8e3db' }}>
                      {s.title}
                    </h3>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#a8a29e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                          Uitdaging
                        </p>
                        <p style={{ fontSize: 14, color: '#57534e', lineHeight: '22px' }}>{s.problem}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#d97706', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                          De Welzijnsklik-impact
                        </p>
                        <p style={{ fontSize: 14, color: '#57534e', lineHeight: '22px' }}>{s.impact}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ━━ Pilot ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{ padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)' }}>
          <div className="max-w-[1440px] mx-auto">
            <div
              style={{ background: '#1a1714', borderRadius: 40, padding: 'clamp(40px,5vw,72px) clamp(24px,5vw,80px)' }}>
              <div className="text-center" style={{ marginBottom: 48 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#fcd34d', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Zinvol uitproberen
                </p>
                <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
                  Start slim: de Welzijnsklik Pilot
                </h2>
                <p style={{ fontSize: 16, color: '#d4cdc2', maxWidth: 580, margin: '0 auto', lineHeight: '26px' }}>
                  Wij geloven niet in kostbare software-inkopen vooraf. Wij bewijzen de waarde van
                  ons platform liever in de praktijk via de methode van Zinvol Uitproberen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PILOT.map((step, i) => {
                  const idx = 10 + i;
                  return (
                    <div key={step.n} ref={(el) => { cardRefs.current[idx] = el; }} data-card={idx}
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 32, ...reveal(idx) }}>
                      <div style={{ width: 40, height: 40, background: '#F59E0B', color: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, marginBottom: 20 }}>
                        {step.n}
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 12 }}>{step.title}</h3>
                      <p style={{ fontSize: 14, color: '#d4cdc2', lineHeight: '22px' }}>{step.body}</p>
                    </div>
                  );
                })}
              </div>

              <div className="text-center" style={{ marginTop: 48 }}>
                <a href="#contact"
                  className="inline-flex items-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{ background: '#F59E0B', color: '#fff', fontSize: 16, fontWeight: 700, padding: '14px 36px', borderRadius: 12, boxShadow: '0 8px 24px rgba(245,158,11,0.28)' }}>
                  Vraag de pilot aan
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ━━ Contact & Samenwerking ━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="contact" style={{ background: '#fff', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)' }}>
          <div className="max-w-[860px] mx-auto text-center">
            <p style={{ fontSize: 13, fontWeight: 500, color: '#92400e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Samenwerking
            </p>
            <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#1a1714', marginBottom: 40 }}>
              Contact
            </h2>

            {/* Quote */}
            <div style={{ background: '#f5f2ed', borderRadius: 20, padding: '36px 40px', marginBottom: 36, textAlign: 'left', border: '1px solid rgba(212,205,194,0.4)', position: 'relative' }}>
              <Quote size={32} color="rgba(217,119,6,0.18)" style={{ position: 'absolute', top: 20, left: 20 }} />
              <p style={{ fontSize: 18, color: '#1a1714', lineHeight: '30px', fontStyle: 'italic', fontWeight: 500, paddingLeft: 16 }}>
                &ldquo;Traditionele adviseurs schrijven een beleidsplan. Mijn aanpak is anders: ik
                implementeer een werkende oplossing en automatiseer het proces, zodat uw
                professionals weer tijd krijgen voor menselijk contact.&rdquo;
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#92400e', marginTop: 20, paddingLeft: 16 }}>
                Vincent van Munster — WeAreImpact B.V.
              </p>
            </div>

            <p style={{ fontSize: 16, color: '#57534e', lineHeight: '26px', marginBottom: 16 }}>
              Welzijnsklik is ontwikkeld vanuit de praktijk door Vincent van Munster. Met meer dan
              15 jaar bestuurlijke ervaring in de zorg- en welzijnssector combineert hij
              diepgaande kennis van de werkvloer met het vermogen om zelf werkende, innovatieve
              softwareoplossingen te bouwen.
            </p>
            <DemoInterestForm />
          </div>
        </section>

      </main>

      <MarketingFooter />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%        { transform: translateY(-7px); }
        }
      `}</style>

    </div>
  );
}
