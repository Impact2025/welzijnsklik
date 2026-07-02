'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Check, Mail, X } from 'lucide-react';
import { meldDemoInteresse } from '@/lib/actions/leads';

const STEPS = ['Contact', 'Organisatie', 'Behoefte', 'Planning'] as const;

const ORGANISATIE_TYPES = [
  'Woonzorgcentrum',
  'Welzijnsorganisatie',
  'Gemeente',
  'Zorginstelling',
  'Vrijwilligersorganisatie',
  'Overig',
];

const AANTAL_CLIENTEN = ['< 25', '25 – 75', '75 – 150', '150+'];

const UITDAGINGEN = [
  'Vrijwilligers werven & plannen',
  'Contact met familie',
  'Overzicht & rapportages',
  'Administratieve last',
  'Anders',
];

const GEWENSTE_START = ['Zo snel mogelijk', 'Binnen 1 maand', 'Binnen 3 maanden', 'Oriënterend'];
const DEMO_VOORKEUR = ['Videocall', 'Op locatie', 'Telefonisch'];

type FormState = {
  naam: string;
  email: string;
  telefoon: string;
  organisatie: string;
  organisatieType: string;
  functie: string;
  aantalClienten: string;
  uitdagingen: string[];
  toelichting: string;
  gewensteStart: string;
  demoVoorkeur: string;
  gewenstMoment: string;
};

const EMPTY_STATE: FormState = {
  naam: '',
  email: '',
  telefoon: '',
  organisatie: '',
  organisatieType: '',
  functie: '',
  aantalClienten: '',
  uitdagingen: [],
  toelichting: '',
  gewensteStart: '',
  demoVoorkeur: '',
  gewenstMoment: '',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid rgba(212,205,194,0.6)',
  background: '#fff',
  color: '#1a1714',
  fontSize: 15,
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#1a1714',
  marginBottom: 8,
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="transition-all active:scale-95"
      style={{
        padding: '10px 18px',
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 600,
        border: active ? '1px solid #d97706' : '1px solid rgba(212,205,194,0.6)',
        background: active ? 'rgba(245,158,11,0.12)' : '#fff',
        color: active ? '#92400e' : '#57534e',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export default function DemoWizardModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(EMPTY_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const toggleUitdaging = (value: string) =>
    setData((d) => ({
      ...d,
      uitdagingen: d.uitdagingen.includes(value)
        ? d.uitdagingen.filter((v) => v !== value)
        : [...d.uitdagingen, value],
    }));

  const stepValid = (() => {
    if (step === 0) return data.naam.trim() !== '' && data.email.trim() !== '' && data.organisatie.trim() !== '';
    if (step === 1) return data.organisatieType !== '';
    return true;
  })();

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set('naam', data.naam);
      fd.set('email', data.email);
      fd.set('telefoon', data.telefoon);
      fd.set('organisatie', data.organisatie);
      fd.set('organisatieType', data.organisatieType);
      fd.set('functie', data.functie);
      fd.set('aantalClienten', data.aantalClienten);
      data.uitdagingen.forEach((u) => fd.append('uitdaging', u));
      fd.set('toelichting', data.toelichting);
      fd.set('gewensteStart', data.gewensteStart);
      fd.set('demoVoorkeur', data.demoVoorkeur);
      fd.set('gewenstMoment', data.gewenstMoment);
      await meldDemoInteresse(fd);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis, probeer het opnieuw.');
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(26,23,20,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#faf8f5',
          borderRadius: 24,
          padding: 'clamp(16px,3vw,28px)',
          boxShadow: '0 24px 64px rgba(26,23,20,0.35)',
        }}
      >
        {!done && (
          <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
            <div className="flex items-center" style={{ gap: 8, flex: 1 }}>
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center" style={{ flex: i === STEPS.length - 1 ? '0 0 auto' : 1, gap: 8 }}>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                        background: i < step ? '#d97706' : i === step ? '#d97706' : '#fff',
                        color: i <= step ? '#fff' : '#a8a29e',
                        border: i <= step ? 'none' : '1px solid rgba(212,205,194,0.8)',
                      }}
                    >
                      {i < step ? <Check size={14} /> : i + 1}
                    </div>
                    <span
                      className="hidden sm:inline"
                      style={{
                        fontSize: 13,
                        fontWeight: i === step ? 700 : 500,
                        color: i === step ? '#1a1714' : '#a8a29e',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 1, background: 'rgba(212,205,194,0.8)', minWidth: 12 }} />
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Sluiten"
              className="transition-colors hover:bg-black/5"
              style={{ marginLeft: 16, padding: 8, borderRadius: 10, color: '#57534e', flexShrink: 0 }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            border: '1px solid rgba(212,205,194,0.5)',
            boxShadow: '0 2px 12px rgba(26,23,20,0.05)',
          }}
        >
          {done ? (
            <div style={{ padding: 'clamp(28px,5vw,48px)', textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(245,158,11,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <Check size={28} color="#d97706" />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1a1714', marginBottom: 10 }}>
                Bedankt, {data.naam.split(' ')[0] || 'top'}!
              </h3>
              <p style={{ fontSize: 15, color: '#57534e', lineHeight: '24px', marginBottom: 28 }}>
                We hebben uw aanvraag ontvangen en nemen binnen 1 werkdag contact met u op om een
                demonstratie in te plannen.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="transition-all hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: '#F59E0B',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  padding: '12px 32px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Sluiten
              </button>
            </div>
          ) : (
            <>
              <div style={{ padding: 'clamp(20px,4vw,36px) clamp(20px,4vw,36px) 8px' }}>
                {step === 0 && (
                  <>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1a1714', marginBottom: 6 }}>Wie bent u?</h3>
                    <p style={{ fontSize: 15, color: '#57534e', marginBottom: 24 }}>
                      Zodat we weten met wie we straks spreken.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label style={labelStyle}>Naam *</label>
                        <input
                          autoFocus
                          value={data.naam}
                          onChange={(e) => update('naam', e.target.value)}
                          placeholder="Uw naam"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>E-mailadres *</label>
                        <input
                          type="email"
                          value={data.email}
                          onChange={(e) => update('email', e.target.value)}
                          placeholder="naam@organisatie.nl"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>
                          Telefoonnummer <span style={{ fontWeight: 400, textTransform: 'none', color: '#a8a29e' }}>· optioneel</span>
                        </label>
                        <input
                          value={data.telefoon}
                          onChange={(e) => update('telefoon', e.target.value)}
                          placeholder="06 12345678"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Naam organisatie *</label>
                        <input
                          value={data.organisatie}
                          onChange={(e) => update('organisatie', e.target.value)}
                          placeholder="Bijv. Woonzorgcentrum De Meerwende"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1a1714', marginBottom: 6 }}>
                      Over uw organisatie
                    </h3>
                    <p style={{ fontSize: 15, color: '#57534e', marginBottom: 24 }}>
                      Helpt ons de demo op maat voor te bereiden.
                    </p>
                    <label style={labelStyle}>Type organisatie *</label>
                    <div className="flex flex-wrap" style={{ gap: 10, marginBottom: 24 }}>
                      {ORGANISATIE_TYPES.map((t) => (
                        <Chip key={t} active={data.organisatieType === t} onClick={() => update('organisatieType', t)}>
                          {t}
                        </Chip>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label style={labelStyle}>
                          Uw functie <span style={{ fontWeight: 400, textTransform: 'none', color: '#a8a29e' }}>· optioneel</span>
                        </label>
                        <input
                          value={data.functie}
                          onChange={(e) => update('functie', e.target.value)}
                          placeholder="Bijv. Coördinator activiteiten"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Aantal bewoners / cliënten</label>
                        <div className="flex flex-wrap" style={{ gap: 10 }}>
                          {AANTAL_CLIENTEN.map((a) => (
                            <Chip key={a} active={data.aantalClienten === a} onClick={() => update('aantalClienten', a)}>
                              {a}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1a1714', marginBottom: 6 }}>
                      Waar loopt u tegenaan?
                    </h3>
                    <p style={{ fontSize: 15, color: '#57534e', marginBottom: 24 }}>
                      Dan bereiden we een demo voor die daarop aansluit.
                    </p>
                    <label style={labelStyle}>
                      Grootste uitdaging <span style={{ fontWeight: 400, textTransform: 'none', color: '#a8a29e' }}>· meerdere mogelijk</span>
                    </label>
                    <div className="flex flex-wrap" style={{ gap: 10, marginBottom: 24 }}>
                      {UITDAGINGEN.map((u) => (
                        <Chip key={u} active={data.uitdagingen.includes(u)} onClick={() => toggleUitdaging(u)}>
                          {u}
                        </Chip>
                      ))}
                    </div>
                    <div>
                      <label style={labelStyle}>
                        Toelichting <span style={{ fontWeight: 400, textTransform: 'none', color: '#a8a29e' }}>· optioneel</span>
                      </label>
                      <textarea
                        value={data.toelichting}
                        onChange={(e) => update('toelichting', e.target.value)}
                        placeholder="Vertel kort over jullie situatie"
                        rows={3}
                        style={{ ...inputStyle, resize: 'vertical' as const }}
                      />
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1a1714', marginBottom: 6 }}>Plannen</h3>
                    <p style={{ fontSize: 15, color: '#57534e', marginBottom: 24 }}>
                      Laatste stap — dan plannen we een moment dat u uitkomt.
                    </p>
                    <div style={{ marginBottom: 20 }}>
                      <label style={labelStyle}>Wanneer wilt u starten?</label>
                      <div className="flex flex-wrap" style={{ gap: 10 }}>
                        {GEWENSTE_START.map((g) => (
                          <Chip key={g} active={data.gewensteStart === g} onClick={() => update('gewensteStart', g)}>
                            {g}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={labelStyle}>Voorkeur voor de demo</label>
                      <div className="flex flex-wrap" style={{ gap: 10 }}>
                        {DEMO_VOORKEUR.map((v) => (
                          <Chip key={v} active={data.demoVoorkeur === v} onClick={() => update('demoVoorkeur', v)}>
                            {v}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>
                        Gewenst moment <span style={{ fontWeight: 400, textTransform: 'none', color: '#a8a29e' }}>· optioneel</span>
                      </label>
                      <input
                        value={data.gewenstMoment}
                        onChange={(e) => update('gewenstMoment', e.target.value)}
                        placeholder="Bijv. dinsdagmiddag of na 15:00 uur"
                        style={inputStyle}
                      />
                    </div>
                  </>
                )}

                {error && (
                  <p style={{ color: '#dc2626', fontSize: 14, marginTop: 16 }}>{error}</p>
                )}
              </div>

              <div
                className="flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(212,205,194,0.5)', padding: 'clamp(16px,3vw,24px) clamp(20px,4vw,36px)' }}
              >
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="flex items-center transition-colors hover:text-[#d97706]"
                    style={{ gap: 6, fontSize: 15, fontWeight: 600, color: '#57534e' }}
                  >
                    <ArrowLeft size={16} />
                    Terug
                  </button>
                ) : (
                  <span />
                )}

                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    disabled={!stepValid}
                    onClick={() => setStep((s) => s + 1)}
                    className="flex items-center transition-all hover:-translate-y-0.5 active:scale-95"
                    style={{
                      gap: 8,
                      background: stepValid ? '#F59E0B' : '#e7e2d9',
                      color: stepValid ? '#fff' : '#a8a29e',
                      fontSize: 15,
                      fontWeight: 700,
                      padding: '12px 28px',
                      borderRadius: 12,
                      border: 'none',
                      cursor: stepValid ? 'pointer' : 'default',
                      boxShadow: stepValid ? '0 8px 24px rgba(245,158,11,0.28)' : 'none',
                    }}
                  >
                    Volgende
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="flex items-center transition-all hover:-translate-y-0.5 active:scale-95"
                    style={{
                      gap: 8,
                      background: '#F59E0B',
                      color: '#fff',
                      fontSize: 15,
                      fontWeight: 700,
                      padding: '12px 28px',
                      borderRadius: 12,
                      border: 'none',
                      cursor: submitting ? 'default' : 'pointer',
                      opacity: submitting ? 0.7 : 1,
                      boxShadow: '0 8px 24px rgba(245,158,11,0.28)',
                    }}
                  >
                    {submitting ? 'Versturen...' : 'Demo aanvragen'}
                    {!submitting && <ArrowRight size={16} />}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {!done && (
          <p className="flex items-center justify-center" style={{ gap: 6, marginTop: 20, fontSize: 13, color: '#57534e' }}>
            Liever direct contact?
            <a href="mailto:v.munster@weareimpact.nl" className="flex items-center hover:text-[#d97706] transition-colors" style={{ gap: 4, fontWeight: 600, color: '#92400e' }}>
              <Mail size={13} />
              v.munster@weareimpact.nl
            </a>
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
