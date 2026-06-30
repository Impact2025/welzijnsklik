import Link from 'next/link';

const PRODUCT_LINKS: [string, string][] = [
  ['Functionaliteiten', '/#flows'],
  ['Mobiele App', '/#flows'],
  ['Beveiliging', '/#waarom'],
  ['Pilot', '/pilot'],
];

const ORG_LINKS: [string, string][] = [
  ['Over ons', '/over-ons'],
  ['WeAreImpact B.V.', '/over-ons'],
  ['Nieuws', '/over-ons'],
  ['Support', '/support'],
];

export default function MarketingFooter() {
  return (
    <footer style={{ background: '#e1e3e4', paddingTop: 64, paddingBottom: 24, padding: '64px clamp(16px,4vw,48px) 24px' }}>
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16" style={{ marginBottom: 48 }}>
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
              <img src="/logo.png" alt="Welzijnsklik" style={{ width: 28, height: 28, borderRadius: 8 }} />
              <span style={{ fontSize: 19, fontWeight: 900, color: '#005e9f' }}>Welzijnsklik</span>
            </div>
            <p style={{ fontSize: 15, color: '#404751', lineHeight: '24px' }}>
              De human-centered SaaS oplossing voor de moderne ouderenzorg.
              Wij verbinden, ontzorgen en verblijden.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 17, fontWeight: 600, color: '#1D3557', marginBottom: 20 }}>Product</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15, color: '#404751' }}>
              {PRODUCT_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-[#005e9f] transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: 17, fontWeight: 600, color: '#1D3557', marginBottom: 20 }}>Organisatie</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15, color: '#404751' }}>
              {ORG_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-[#005e9f] transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: 17, fontWeight: 600, color: '#1D3557', marginBottom: 20 }}>Demo aanvragen</h4>
            <p style={{ fontSize: 13, color: '#404751', marginBottom: 16, lineHeight: '20px' }}>
              Interesse in een pilot voor uw organisatie? Neem direct contact op.
            </p>
            <a href="mailto:v.munster@weareimpact.nl"
              className="inline-block hover:bg-[#0077c8] transition-colors"
              style={{ background: '#005e9f', color: '#fff', fontSize: 14, fontWeight: 600, padding: '10px 20px', borderRadius: 10 }}>
              Stuur een e-mail
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ paddingTop: 24, borderTop: '1px solid #c0c7d3' }}>
          <p style={{ fontSize: 12, color: '#404751' }}>2026 WeAreImpact B.V. Alle rechten voorbehouden.</p>
          <div className="flex gap-8" style={{ fontSize: 12, color: '#404751' }}>
            <Link href="/privacy" className="hover:text-[#005e9f] transition-colors">Privacy Policy</Link>
            <Link href="/algemene-voorwaarden" className="hover:text-[#005e9f] transition-colors">Algemene Voorwaarden</Link>
            <Link href="/cookies" className="hover:text-[#005e9f] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
