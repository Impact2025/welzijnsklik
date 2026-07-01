'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { meldDemoInteresse } from '@/lib/actions/leads';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid rgba(212,205,194,0.6)',
  background: '#ffffff',
  color: '#1a1714',
  fontSize: 15,
};

export default function DemoInterestForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await meldDemoInteresse(formData);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p style={{ color: '#1a1714', fontSize: 16, fontWeight: 600 }}>
        Bedankt! We nemen zo snel mogelijk contact met je op.
      </p>
    );
  }

  return (
    <form
      action={handleSubmit}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
        maxWidth: 640,
        margin: '0 auto',
        textAlign: 'left',
      }}
    >
      <input name="naam" placeholder="Naam" style={inputStyle} />
      <input name="organisatie" placeholder="Naam organisatie" style={inputStyle} />
      <input name="email" type="email" required placeholder="E-mailadres" style={inputStyle} />
      <input name="telefoon" placeholder="Telefoon (optioneel)" style={inputStyle} />
      <textarea
        name="bericht"
        placeholder="Vertel kort over jullie situatie (optioneel)"
        rows={3}
        style={{ ...inputStyle, gridColumn: '1 / -1', resize: 'vertical' as const }}
      />
      {error && (
        <p style={{ gridColumn: '1 / -1', color: '#dc2626', fontSize: 14 }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
        style={{
          gridColumn: '1 / -1',
          background: '#F59E0B',
          color: '#fff',
          fontSize: 16,
          fontWeight: 700,
          padding: '16px 40px',
          borderRadius: 12,
          border: 'none',
          cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.7 : 1,
          boxShadow: '0 8px 24px rgba(245,158,11,0.30)',
        }}
      >
        {loading ? 'Bezig...' : 'Vraag direct een vrijblijvende demonstratie aan'}
        {!loading && <ArrowRight size={18} />}
      </button>
    </form>
  );
}
