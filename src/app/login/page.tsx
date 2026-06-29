import LoginForm from "./LoginForm";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  const isDev = process.env.NODE_ENV === "development";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center mx-auto">
            <img src="/logo.png" alt="Welzijnsklik" className="w-16 h-16" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welzijnsklik</h1>
            <p className="text-neutral-500 text-sm mt-1">
              Welzijn dichtbij, altijd verbonden
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
          <LoginForm error={error} callbackUrl={callbackUrl} isDev={isDev} />
        </div>

        <div className="text-center space-y-3">
          <p className="text-center text-xs text-neutral-400">
            De Meerwende · Badhoevedorp
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-semibold transition-colors"
          >
            <Sparkles size={12} />
            Verken de demo
          </Link>
        </div>
      </div>
    </main>
  );
}
