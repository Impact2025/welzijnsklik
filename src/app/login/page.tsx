"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string };
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("resend", {
      email,
      callbackUrl: searchParams.callbackUrl ?? "/",
      redirect: false,
    });
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Check je e-mail
          </h1>
          <p className="text-gray-500 text-sm">
            We hebben een inloglink gestuurd naar{" "}
            <strong>{email}</strong>. Klik op de link om in te loggen.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-amber-700">Welzijnsklik</h1>
          <p className="text-gray-500 text-sm mt-1">
            Verbindt bewoners, vrijwilligers en familie
          </p>
        </div>

        {searchParams.error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3 mb-4">
            Er is iets misgegaan. Probeer opnieuw.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              E-mailadres
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@organisatie.nl"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-60"
          >
            {loading ? "Versturen…" : "Stuur inloglink"}
          </button>
        </form>
      </div>
    </main>
  );
}
