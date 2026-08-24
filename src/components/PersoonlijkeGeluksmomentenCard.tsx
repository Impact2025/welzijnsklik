import { Sparkles, Heart } from "lucide-react";
import type { GeluksmomentenPersoonlijk } from "@/lib/actions/geluksmomenten";

function formatGetal(n: number): string {
  return Math.round(n).toLocaleString("nl-NL");
}

const PERIODE_LABEL: Record<GeluksmomentenPersoonlijk["periode"], string> = {
  week: "deze week",
  maand: "deze maand",
  kwartaal: "dit kwartaal",
};

export function PersoonlijkeGeluksmomentenCard({
  data,
  voornaam,
}: {
  data: GeluksmomentenPersoonlijk;
  voornaam: string;
}) {
  const heeftData = data.bereikt > 0;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Geluksmomenten</p>
          <p className="text-sm text-amber-900/80">Jouw bijdrage {PERIODE_LABEL[data.periode]}</p>
        </div>
      </div>

      {heeftData ? (
        <>
          <div className="flex items-end gap-4">
            <p className="text-4xl font-bold text-amber-900 tabular-nums">{formatGetal(data.bereikt)}</p>
            <p className="text-xs text-amber-700/90 pb-1.5">
              geluksmomenten gemaakt {PERIODE_LABEL[data.periode]}
            </p>
          </div>

          <div className="flex items-start gap-2 bg-white/60 rounded-xl px-3 py-2.5">
            <Heart size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              Bedankt, {voornaam}! Met jouw {formatGetal(data.totalUren)} uur en aandacht heb je dit
              waarschijnlijk mooie momenten opgeleverd voor de bewoners die je hebt bezocht.
            </p>
          </div>

          {data.totaalAllerTijden > data.bereikt && (
            <p className="text-[11px] text-amber-700/70">
              In totaal maakte je al <strong className="font-semibold">{formatGetal(data.totaalAllerTijden)}</strong>{" "}
              geluksmomenten sinds je begon.
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-amber-800/80">
          Registreer een activiteit en vul je welzijnscheck in — dan zie je hier terug hoeveel
          geluksmomenten jouw inzet oplevert.
        </p>
      )}
    </div>
  );
}
