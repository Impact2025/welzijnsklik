import type { NextConfig } from "next";

const csp = [
  `default-src 'self'`,
  // 'unsafe-inline' is nodig: Next.js's App Router streamt hydratie-/RSC-data
  // via inline <script>self.__next_f.push(...)</script>-tags. Zonder deze
  // toestemming blokkeert de browser die scripts stilzwijgend (geen zichtbare
  // console-fout), waardoor React nooit hydrateert — de pagina toont dan wel
  // statische HTML, maar geen enkele knop/link-handler werkt meer.
  `script-src 'self' 'unsafe-inline'`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://*.blob.vercel-storage.com https://lh3.googleusercontent.com`,
  `font-src 'self'`,
  `connect-src 'self' https://*.neon.tech wss://*.neon.tech`,
  `frame-src 'none'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
].join("; ");

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: csp },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(self), microphone=(self)" },
      ],
    },
  ],
};

export default nextConfig;
