'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const NAV_LINKS: [string, string][] = [
  ['Product', '/#waarom'],
  ['Platform', '/#flows'],
  ['Sectoren', '/#sectoren'],
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
          background: scrolled ? 'rgba(255,255,255,0.92)' : '#f8f9fa',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 2px 16px rgba(29,53,87,0.10)' : '0 1px 0 rgba(192,199,211,0.4)',
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Welzijnsklik" style={{ width: 32, height: 32, borderRadius: 8 }} />
          <span style={{ fontSize: 19, fontWeight: 900, color: '#005e9f', letterSpacing: '-0.01em' }}>Welzijnsklik</span>
        </Link>

        <nav className="hidden md:flex items-center" style={{ gap: 40 }}>
          {NAV_LINKS.map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 14, fontWeight: 500, color: '#404751' }} className="hover:text-[#005e9f] transition-colors">
              {label}
            </a>
          ))}
          <Link
            href="/login"
            style={{ fontSize: 14, fontWeight: 600, color: '#005e9f', border: '2px solid #005e9f', borderRadius: 12, padding: '7px 20px' }}
            className="hover:bg-[#005e9f]/5 transition-colors"
          >
            Inloggen
          </Link>
          <Link
            href="/#contact"
            style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: '#005e9f', borderRadius: 12, padding: '9px 20px' }}
            className="hover:bg-[#0077c8] transition-colors active:scale-95"
          >
            Aanmelden
          </Link>
        </nav>

        <button
          className="md:hidden p-2 transition-transform active:scale-95"
          style={{ color: '#404751' }}
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
                style={{ fontSize: 18, fontWeight: 500, color: '#191c1d', padding: '16px 0', borderBottom: '1px solid rgba(192,199,211,0.3)' }}>
                {label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-3 px-6 pt-6">
            <Link href="/login" onClick={() => setMenuOpen(false)}
              style={{ textAlign: 'center', padding: '14px', borderRadius: 12, fontWeight: 600, border: '2px solid #005e9f', color: '#005e9f' }}>
              Inloggen
            </Link>
            <Link href="/#contact" onClick={() => setMenuOpen(false)}
              style={{ textAlign: 'center', padding: '14px', borderRadius: 12, fontWeight: 600, background: '#005e9f', color: '#fff' }}>
              Aanmelden
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
