import { Shield, FileText, Download, Eye, Trash2, Mail, UserCheck } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-3xl mx-auto">
            <Shield size={26} className="text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Privacyverklaring</h1>
          <p className="text-neutral-500 text-sm max-w-md mx-auto">
            Welzijnsklik verwerkt persoonsgegevens van bewoners, vrijwilligers en familieleden.<br />
            Laatst bijgewerkt: juni 2025.
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-emerald-600" />
              </div>
              <h2 className="font-semibold text-gray-900 text-[15px]">Welke gegevens verzamelen we?</h2>
            </div>
            <ul className="space-y-2 text-sm text-neutral-600 ml-1">
              <li className="flex gap-2"><span className="text-emerald-500 font-bold mt-0.5">&bull;</span> Naam, e-mailadres en rol (coördinator, vrijwilliger, familie)</li>
              <li className="flex gap-2"><span className="text-emerald-500 font-bold mt-0.5">•</span> Naam van bewoners en fototoestemming (met datum + door wie gegeven)</li>
              <li className="flex gap-2"><span className="text-emerald-500 font-bold mt-0.5">&bull;</span> Geregistreerde activiteiten (type, duur, notities, foto&apos;s)</li>
              <li className="flex gap-2"><span className="text-emerald-500 font-bold mt-0.5">•</span> Familiekoppelingen (relatie tot bewoner)</li>
              <li className="flex gap-2"><span className="text-emerald-500 font-bold mt-0.5">•</span> Wervingsinteresse voor samenzorg-vrijwilligerswerk</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                <Eye size={16} className="text-sky-600" />
              </div>
              <h2 className="font-semibold text-gray-900 text-[15px]">Jouw rechten (AVG)</h2>
            </div>
            <div className="divide-y divide-neutral-50 -mx-5">
              {[
                { icon: Eye, label: "Recht op inzage", desc: "Download al je gegevens via je accountpagina. Wij sturen binnen 24 uur een volledig overzicht.", href: "/account" },
                { icon: Download, label: "Recht op dataportabiliteit", desc: "Exporteer je gegevens als JSON. Dit bestand kun je importeren in een ander systeem.", href: "/api/data-export" },
                { icon: Trash2, label: "Recht op vergetelheid", desc: "Neem contact op met je coördinator om je account en alle bijbehorende gegevens te laten verwijderen." },
                { icon: Mail, label: "Recht op rectificatie", desc: "Onjuiste gegevens kun je laten corrigeren via je coördinator of door een e-mail te sturen." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Icon size={15} className="text-neutral-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{item.label}</p>
                        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                      {item.href && (
                        <Link
                          href={item.href}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex-shrink-0"
                        >
                          Openen →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                <UserCheck size={16} className="text-violet-600" />
              </div>
              <h2 className="font-semibold text-gray-900 text-[15px]">Toestemming fotografie</h2>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Foto&apos;s worden alleen gemaakt als de bewoner (of wettelijk vertegenwoordiger) daar 
              uitdrukkelijk toestemming voor heeft gegeven. Deze toestemming wordt vastgelegd in het 
              systeem met datum, naam van de toestemmer en welke coördinator dit heeft geregistreerd.
              Elke wijziging wordt bewaard in het toestemmingslogboek.
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Toestemming kan te allen tijde worden ingetrokken. Na intrekking worden geen nieuwe 
              foto&apos;s meer gemaakt en bestaande foto&apos;s zijn niet langer inzichtelijk via het platform.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Shield size={16} className="text-amber-600" />
              </div>
              <h2 className="font-semibold text-gray-900 text-[15px]">Beveiliging</h2>
            </div>
            <ul className="space-y-2 text-sm text-neutral-600 ml-1">
              <li className="flex gap-2"><span className="text-amber-500 font-bold mt-0.5">•</span> Alle data wordt versleuteld opgeslagen bij Neon (PostgreSQL, EU-regio)</li>
              <li className="flex gap-2"><span className="text-amber-500 font-bold mt-0.5">•</span> Inloggen gebeurt via eenmagische link per e-mail — geen wachtwoorden opgeslagen</li>
              <li className="flex gap-2"><span className="text-amber-500 font-bold mt-0.5">•</span> Foto&apos;s worden alleen via een gecontroleerd proxy-endpoint getoond</li>
              <li className="flex gap-2"><span className="text-amber-500 font-bold mt-0.5">•</span> Rolgebaseerde toegang: gebruikers zien alleen data binnen hun eigen organisatie</li>
              <li className="flex gap-2"><span className="text-amber-500 font-bold mt-0.5">•</span> HTTP-headers (CSP, X-Frame-Options, X-Content-Type-Options) voor web-beveiliging</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-400 pb-8">
          Welzijnsklik · De Meerwende · Vragen? Neem contact op met je coördinator
        </p>
      </div>
    </main>
  );
}
