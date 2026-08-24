import { auth } from "@/auth";
import { getBewonersAandacht } from "@/lib/aandacht";
import { AandachtOverzicht } from "@/components/AandachtOverzicht";

export default async function CoordinatorAandacht() {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const data = await getBewonersAandacht(organisatieId);

  return (
    <div className="px-4 py-6 lg:py-8 space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Aandacht</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Welke bewoners hebben minder activiteiten dan hun eigen gebruikelijke ritme.
        </p>
      </div>
      <AandachtOverzicht data={data} bewonerHref={(id) => `/coordinator/bewoners/${id}`} />
    </div>
  );
}
