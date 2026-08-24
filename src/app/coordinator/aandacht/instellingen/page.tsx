import { auth } from "@/auth";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getAandachtInstellingen } from "@/lib/aandacht";
import { AandachtInstellingenForm } from "./AandachtInstellingenForm";

export default async function AandachtInstellingenPagina() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const instellingen = await getAandachtInstellingen(organisatieId);

  return (
    <div className="px-4 py-6 lg:py-8 space-y-5 max-w-2xl mx-auto">
      <Link
        href="/coordinator/aandacht"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
      >
        <ChevronLeft size={16} />
        Terug naar aandacht
      </Link>
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Aandacht-instellingen</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Stel in wanneer een bewoner als &ldquo;aandacht nodig&rdquo; of &ldquo;let op&rdquo; wordt gemarkeerd.
          Dit geldt voor de hele organisatie.
        </p>
      </div>
      <AandachtInstellingenForm instellingen={instellingen} />
    </div>
  );
}
