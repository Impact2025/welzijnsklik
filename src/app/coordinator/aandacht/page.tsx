import { auth } from "@/auth";
import Link from "next/link";
import { Settings } from "lucide-react";
import { getBewonersAandacht } from "@/lib/aandacht";
import { AandachtOverzicht } from "@/components/AandachtOverzicht";

export default async function CoordinatorAandacht() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const data = await getBewonersAandacht(organisatieId);

  return (
    <div className="px-4 py-6 lg:py-8 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Aandacht</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Welke bewoners hebben minder activiteiten dan hun eigen gebruikelijke ritme.
          </p>
        </div>
        <Link
          href="/coordinator/aandacht/instellingen"
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 border border-neutral-200 rounded-xl px-3 py-2 flex-shrink-0"
        >
          <Settings size={15} />
          <span className="hidden sm:inline">Instellingen</span>
        </Link>
      </div>
      <AandachtOverzicht data={data} bewonerHref={(id) => `/coordinator/bewoners/${id}`} />
    </div>
  );
}
