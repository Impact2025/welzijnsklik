import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ToestemmingForm from "./ToestemmingForm";

export default async function BewonderDetail({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const bewoner = await prisma.bewoner.findFirst({
    where: { id: params.id, organisatieId },
    include: {
      activiteiten: {
        orderBy: { createdAt: "desc" },
        include: { vrijwilliger: { select: { naam: true } } },
      },
    },
  });

  if (!bewoner) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{bewoner.naam}</h1>

      {/* Toestemming beheren */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold text-gray-700 mb-3">
          Toestemming fotografie
        </h2>
        <ToestemmingForm
          bewonerId={bewoner.id}
          toestemmingFotos={bewoner.toestemmingFotos}
          toestemmingDoor={bewoner.toestemmingDoor ?? ""}
          toestemmingDatum={bewoner.toestemmingDatum?.toISOString() ?? null}
        />
      </div>

      {/* Activiteiten */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-700">
            Activiteiten ({bewoner.activiteiten.length})
          </h2>
        </div>
        {bewoner.activiteiten.length === 0 ? (
          <p className="text-gray-400 text-sm p-4">Nog geen activiteiten.</p>
        ) : (
          <div className="divide-y">
            {bewoner.activiteiten.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {a.type} met {a.vrijwilliger.naam}
                  </p>
                  <p className="text-xs text-gray-400">
                    {a.duurMinuten} min ·{" "}
                    {new Date(a.createdAt).toLocaleDateString("nl-NL")}
                  </p>
                  {a.notities && (
                    <p className="text-xs text-gray-400 mt-0.5">{a.notities}</p>
                  )}
                </div>
                {a.fotoUrl && (
                  <img
                    src={a.fotoUrl}
                    alt="Foto"
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
