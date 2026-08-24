import { prisma } from "@/lib/prisma";

/**
 * Berekent per bewoner of die "aandacht nodig" heeft, relatief aan het eigen
 * activiteitenritme — niet aan een vast getal. Een bewoner die normaal 1x/week
 * iets doet en nu 2 weken niks heeft is een signaal; een bewoner die altijd al
 * rustig is en dat blijft, niet.
 */

export type AandachtStatus = "rood" | "oranje" | "groen" | "nieuw";

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
}

const BASELINE_DAGEN = 90;
const RECENT_DAGEN = 14;
const MIN_ACTIVITEITEN_VOOR_BASELINE = 3;

const STATUS_VOLGORDE: Record<AandachtStatus, number> = {
  rood: 0,
  oranje: 1,
  nieuw: 2,
  groen: 3,
};

export async function getBewonersAandacht(organisatieId: string): Promise<BewonerAandacht[]> {
  const now = new Date();
  const baselineVanaf = new Date(now.getTime() - BASELINE_DAGEN * 86400000);
  const recentVanaf = new Date(now.getTime() - RECENT_DAGEN * 86400000);
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

    const genoegData = b._count.activiteiten >= MIN_ACTIVITEITEN_VOOR_BASELINE;

    let status: AandachtStatus = "nieuw";
    let afwijkingsScore: number | null = null;

    if (genoegData) {
      const verwacht = gemiddeldPerWeek * (RECENT_DAGEN / 7);
      afwijkingsScore = verwacht > 0 ? aantalLaatste14Dagen / verwacht : aantalLaatste14Dagen > 0 ? 1 : 0;

      if (afwijkingsScore < 0.5 && (dagenSindsLaatste === null || dagenSindsLaatste >= RECENT_DAGEN)) {
        status = "rood";
      } else if (afwijkingsScore < 0.7) {
        status = "oranje";
      } else {
        status = "groen";
      }
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
