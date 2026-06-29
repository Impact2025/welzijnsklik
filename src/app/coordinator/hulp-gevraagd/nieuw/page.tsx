import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import HulpGevraagdForm from "./HulpGevraagdForm";

export default function NieuweHulpGevraagdPage() {
  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <Link
          href="/coordinator/hulp-gevraagd"
          className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-600 text-sm mb-3 transition-colors"
        >
          <ChevronLeft size={15} />
          Hulp gevraagd
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Hulp gevraagd plaatsen</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Vrijwilligers zien dit direct en kunnen zich aanmelden</p>
      </div>
      <HulpGevraagdForm />
    </div>
  );
}
