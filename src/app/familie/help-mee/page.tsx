import HelpMeeForm from "./HelpMeeForm";
import { Handshake } from "lucide-react";

export default function HelpMeePage() {
  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Zelf meehelpen</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Word samenzorg-vrijwilliger</p>
      </div>

      {/* Info card */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Handshake size={18} className="text-amber-600" />
        </div>
        <p className="text-sm text-amber-800 leading-relaxed">
          Wil je zelf ook een keer meegaan op wandeling, spelletjes spelen of gewoon gezelschap houden?
          Laat het ons weten — de coördinator neemt contact met je op.
        </p>
      </div>

      <HelpMeeForm />
    </div>
  );
}
