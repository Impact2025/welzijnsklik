import { prisma } from "@/lib/prisma";

/**
 * Berekent per bewoner of die "aandacht nodig" heeft, relatief aan het eigen
 * activiteitenritme — niet aan een vast getal. Een bewoner die normaal 1x/week
 * iets doet en nu 2 weken niks heeft is een signaal; een bewoner die altijd al
 * rustig is en dat blijft, niet.
 */

export type AandachtStatus = "rood" | "oranje" | "opgepakt" | "groen" | "nieuw";

export interface BewonerAandacht {
  id: string;
  naam: string;
  kamer: string | null;
  laatsteActiviteitOp: Date | null;
  dagenSindsLaatste: number | null;
  aantalLaatste14Dagen: number;
  aantalLaatste30Dagen: number;
  totaalAantal: number;
  gemiddeldPerWeek: number;
  afwijkingsScore: number | null;
  status: AandachtStatus;
  onderliggendeStatus: AandachtStatus;
  opgepaktDoor: string | null;
  opgepaktOp: Date | null;
}

const STATUS_VOLGORDE: Record<AandachtStatus, number> = {
  rood: 0,
  oranje: 1,
  opgepakt: 2,
  nieuw: 3,
  groen: 4,
};

export interface AandachtInstellingen {
  recentDagen: number;
  baselineDagen: number;
  drempelRood: number;
  drempelOranje: number;
  minActiviteiten: number;
}

const STANDAARD_INSTELLINGEN: AandachtInstellingen = {
  recentDagen: 14,
  baselineDagen: 90,
  drempelRood: 0.5,
  drempelOranje: 0.7,
  minActiviteiten: 3,
};

/** Haalt de per-organisatie drempelwaarden op (of de standaardwaarden als de organisatie ze nog niet heeft ingesteld). */
export async function getAandachtInstellingen(organisatieId: string): Promise<AandachtInstellingen> {
  const instellingen = await prisma.adminInstellingen.findUnique({
    where: { organisatieId },
    select: {
      aandachtRecentDagen: true,
      aandachtBaselineDagen: true,
      aandachtDrempelRood: true,
      aandachtDrempelOranje: true,
      aandachtMinActiviteiten: true,
    },
  });
  if (!instellingen) return STANDAARD_INSTELLINGEN;
  return {
    recentDagen: instellingen.aandachtRecentDagen,
    baselineDagen: instellingen.aandachtBaselineDagen,
    drempelRood: instellingen.aandachtDrempelRood,
    drempelOranje: instellingen.aandachtDrempelOranje,
    minActiviteiten: instellingen.aandachtMinActiviteiten,
  };
}

export async function updateAandachtInstellingen(
  organisatieId: string,
  waarden: AandachtInstellingen
): Promise<void> {
  await prisma.adminInstellingen.upsert({
    where: { organisatieId },
    create: {
      organisatieId,
      aandachtRecentDagen: waarden.recentDagen,
      aandachtBaselineDagen: waarden.baselineDagen,
      aandachtDrempelRood: waarden.drempelRood,
      aandachtDrempelOranje: waarden.drempelOranje,
      aandachtMinActiviteiten: waarden.minActiviteiten,
    },
    update: {
      aandachtRecentDagen: waarden.recentDagen,
      aandachtBaselineDagen: waarden.baselineDagen,
      aandachtDrempelRood: waarden.drempelRood,
      aandachtDrempelOranje: waarden.drempelOranje,
      aandachtMinActiviteiten: waarden.minActiviteiten,
    },
  });
}

export async function getBewonersAandacht(organisatieId: string): Promise<BewonerAandacht[]> {
  const { recentDagen, baselineDagen, drempelRood, drempelOranje, minActiviteiten } =
    await getAandachtInstellingen(organisatieId);

  const now = new Date();
  const baselineVanaf = new Date(now.getTime() - baselineDagen * 86400000);
  const recentVanaf = new Date(now.getTime() - recentDagen * 86400000);
  const dertigVanaf = new Date(now.getTime() - 30 * 86400000);

  const bewoners = await prisma.bewoner.findMany({
    where: { organisatieId },
    select: {
      id: true,
      naam: true,
      kamer: true,
      createdAt: true,
      activiteiten: {
        where: { createdAt: { gte: baselineVanaf } },
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { activiteiten: true } },
      aandachtOppakken: {
        where: { createdAt: { gte: recentVanaf } },
        select: { createdAt: true, gebruiker: { select: { naam: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { naam: "asc" },
  });

  const resultaat: BewonerAandacht[] = bewoners.map((b) => {
    const activiteiten = b.activiteiten;
    const laatsteActiviteitOp = activiteiten[0]?.createdAt ?? null;
    const dagenSindsLaatste = laatsteActiviteitOp
      ? Math.floor((now.getTime() - laatsteActiviteitOp.getTime()) / 86400000)
      : null;

    const aantalLaatste14Dagen = activiteiten.filter((a) => a.createdAt >= recentVanaf).length;
    const aantalLaatste30Dagen = activiteiten.filter((a) => a.createdAt >= dertigVanaf).length;

    // Baseline-periode loopt vanaf intake (indien korter dan 90 dagen) tot nu.
    const baselineStart = b.createdAt > baselineVanaf ? b.createdAt : baselineVanaf;
    const baselineWeken = Math.max((now.getTime() - baselineStart.getTime()) / (7 * 86400000), 1);
    const gemiddeldPerWeek = activiteiten.length / baselineWeken;

    const genoegData = b._count.activiteiten >= minActiviteiten;

    let status: AandachtStatus = "nieuw";
    let afwijkingsScore: number | null = null;

    if (genoegData) {
      const verwacht = gemiddeldPerWeek * (recentDagen / 7);
      afwijkingsScore = verwacht > 0 ? aantalLaatste14Dagen / verwacht : aantalLaatste14Dagen > 0 ? 1 : 0;

      if (afwijkingsScore < drempelRood && (dagenSindsLaatste === null || dagenSindsLaatste >= recentDagen)) {
        status = "rood";
      } else if (afwijkingsScore < drempelOranje) {
        status = "oranje";
      } else {
        status = "groen";
      }
    }

    const onderliggendeStatus = status;
    const oppak = b.aandachtOppakken[0];
    if (oppak && (status === "rood" || status === "oranje")) {
      status = "opgepakt";
    }

    return {
      id: b.id,
      naam: b.naam,
      kamer: b.kamer,
      laatsteActiviteitOp,
      dagenSindsLaatste,
      aantalLaatste14Dagen,
      aantalLaatste30Dagen,
      totaalAantal: b._count.activiteiten,
      gemiddeldPerWeek: Math.round(gemiddeldPerWeek * 10) / 10,
      afwijkingsScore: afwijkingsScore !== null ? Math.round(afwijkingsScore * 100) / 100 : null,
      status,
      onderliggendeStatus,
      opgepaktDoor: oppak?.gebruiker.naam ?? null,
      opgepaktOp: oppak?.createdAt ?? null,
    };
  });

  return resultaat.sort((a, b) => {
    const volgorde = STATUS_VOLGORDE[a.status] - STATUS_VOLGORDE[b.status];
    if (volgorde !== 0) return volgorde;
    return (b.dagenSindsLaatste ?? 999) - (a.dagenSindsLaatste ?? 999);
  });
}

export async function getAandachtRoodCount(organisatieId: string): Promise<number> {
  const data = await getBewonersAandacht(organisatieId);
  return data.filter((b) => b.status === "rood").length;
}

/** Markeert een bewoner als "opgepakt": onderdrukt de rode/oranje status tijdelijk (binnen het recent-venster). */
export async function markeerAandachtOpgepakt(params: {
  organisatieId: string;
  bewonerId: string;
  gebruikerId: string;
  notitie?: string;
}): Promise<void> {
  const bewoner = await prisma.bewoner.findFirst({
    where: { id: params.bewonerId, organisatieId: params.organisatieId },
    select: { id: true },
  });
  if (!bewoner) throw new Error("Bewoner niet gevonden");

  await prisma.aandachtOppak.create({
    data: {
      organisatieId: params.organisatieId,
      bewonerId: params.bewonerId,
      gebruikerId: params.gebruikerId,
      notitie: params.notitie,
    },
  });
}
