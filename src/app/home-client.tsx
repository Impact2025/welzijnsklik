'use client';

import Link from 'next/link';

export default function HomeClient() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center mx-auto">
          <img src="/logo.png" alt="Welzijnsklik" className="w-20 h-20" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welzijnsklik.nl
          </h1>
          <p className="text-neutral-500 text-base mt-2 max-w-sm mx-auto">
            Verbindt vrijwilligers, bewoners en familie met één klik
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-sm transition-colors"
          >
            Inloggen
          </Link>
          <Link
            href="/demo"
            className="bg-white border border-brand-200 hover:bg-amber-50 text-brand-700 font-semibold px-6 py-3 rounded-2xl transition-colors"
          >
            Verken de demo
          </Link>
        </div>
        <p className="text-xs text-neutral-400">
          De Meerwende · Badhoevedorp
        </p>
      </div>
    </main>
  );
}
