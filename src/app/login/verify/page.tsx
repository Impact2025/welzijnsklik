import { Mail } from "lucide-react";

export default function VerifyPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-2xl mx-auto">
          <Mail size={24} className="text-amber-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">Check je inbox</h1>
          <p className="text-neutral-500 text-sm leading-relaxed">
            We hebben je een e-mail gestuurd met een inloglink. De link is 24 uur geldig.
          </p>
        </div>
      </div>
    </main>
  );
}
