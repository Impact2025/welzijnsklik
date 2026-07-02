'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import DemoWizardButton from './DemoWizardButton';

const NAV_LINKS: [string, string][] = [
  ['Product', '/#waarom'],
  ['Platform', '/platform'],
  ['Sectoren', '/sectoren'],
  ['Contact', '/#contact'],
];

export default function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      {/* ━━ Header ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header
        className="fixed top-0 w-full z-50 flex items-center justify-between transition-all duration-300"
        style={{
          height: 64,
          padding: '0 clamp(16px, 4vw, 48px)',
          background: scrolled ? 'rgba(255,255,255,0.92)' : '#faf8f5',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 2px 16px rgba(26,23,20,0.08)' : '0 1px 0 rgba(212,205,194,0.5)',
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Welzijnsklik" style={{ width: 32, height: 32, borderRadius: 8 }} />
          <span style={{ fontSize: 19, fontWeight: 900, color: '#d97706', letterSpacing: '-0.01em' }}>Welzijnsklik</span>
        </Link>

        <nav className="hidden md:flex items-center" style={{ gap: 40 }}>
          {NAV_LINKS.map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 14, fontWeight: 500, color: '#57534e' }} className="hover:text-[#d97706] transition-colors">
              {label}
            </a>
          ))}
          <Link
            href="/login"
            style={{ fontSize: 14, fontWeight: 600, color: '#d97706', border: '2px solid #d97706', borderRadius: 12, padding: '7px 20px' }}
            className="hover:bg-amber-50 transition-colors"
          >
            Inloggen
          </Link>
          <DemoWizardButton>
            <button
              style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: '#d97706', borderRadius: 12, padding: '9px 20px', border: 'none', cursor: 'pointer' }}
              className="hover:bg-amber-700 transition-colors active:scale-95"
            >
              Aanmelden
            </button>
          </DemoWizardButton>
        </nav>

        <button
          className="md:hidden p-2 transition-transform active:scale-95"
          style={{ color: '#57534e' }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Sluit menu' : 'Open menu'}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* ━━ Mobile menu ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col md:hidden" style={{ paddingTop: 64 }}>
          <div className="flex flex-col px-6 py-2">
            {NAV_LINKS.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)}
                style={{ fontSize: 18, fontWeight: 500, color: '#1a1714', padding: '16px 0', borderBottom: '1px solid rgba(212,205,194,0.4)' }}>
                {label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-3 px-6 pt-6">
            <Link href="/login" onClick={() => setMenuOpen(false)}
              style={{ textAlign: 'center', padding: '14px', borderRadius: 12, fontWeight: 600, border: '2px solid #d97706', color: '#d97706' }}>
              Inloggen
            </Link>
            <DemoWizardButton>
              <button
                onClick={() => setMenuOpen(false)}
                style={{ textAlign: 'center', padding: '14px', borderRadius: 12, fontWeight: 600, background: '#d97706', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Aanmelden
              </button>
            </DemoWizardButton>
          </div>
        </div>
      )}
    </>
  );
}
