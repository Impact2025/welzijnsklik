import Link from "next/link";
import { ShieldOff, ArrowLeft } from "lucide-react";

export default function GeenToegang() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-3xl mx-auto">
          <ShieldOff size={28} className="text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">Geen toegang</h1>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Je hebt geen toegang tot deze pagina. Neem contact op met je coördinator als je denkt dat dit een fout is.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-white border border-neutral-200 text-neutral-700 font-medium px-5 py-3 rounded-2xl text-sm hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={15} />
          Terug naar login
        </Link>
      </div>
    </main>
  );
}
