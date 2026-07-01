import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50">
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full max-w-sm text-center">
        <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Lock size={22} className="text-sky-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Admin toegang</h1>
        <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
          Log in met je coördinator-account via de gewone inlogpagina.
          Je wordt daarna automatisch doorgestuurd naar het admin-panel.
        </p>
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
        >
          Naar inlogpagina
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
