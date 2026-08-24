import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const csp = [
  `default-src 'self'`,
  // 'unsafe-inline' is nodig: Next.js's App Router streamt hydratie-/RSC-data
  // via inline <script>self.__next_f.push(...)</script>-tags. Zonder deze
  // toestemming blokkeert de browser die scripts stilzwijgend (geen zichtbare
  // console-fout), waardoor React nooit hydrateert — de pagina toont dan wel
  // statische HTML, maar geen enkele knop/link-handler werkt meer.
  // 'unsafe-eval' is nodig in dev: Next.js 16 / Turbopack / React gebruiken
  // eval() voor source-maps en de error-overlay. Zonder deze token smpt de
  // dev‑browser de error‑overlay op in een EvalError (zoals gezien op
  // localhost:3000/coordinator). In prod is eval() nooit nodig → strak blijven.
  isDev
    ? `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
    : `script-src 'self' 'unsafe-inline'`,
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
