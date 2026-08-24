"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  updateAandachtInstellingen,
  markeerAandachtOpgepakt,
  type AandachtInstellingen,
} from "@/lib/aandacht";

function valideer(waarden: AandachtInstellingen) {
  if (waarden.recentDagen < 1 || waarden.recentDagen > 90) {
    throw new Error("Het venster moet tussen 1 en 90 dagen liggen.");
  }
  if (waarden.baselineDagen < waarden.recentDagen || waarden.baselineDagen > 365) {
    throw new Error("De baseline-periode moet minstens het venster zijn, en maximaal 365 dagen.");
  }
  if (waarden.drempelRood <= 0 || waarden.drempelRood >= waarden.drempelOranje) {
    throw new Error("De rode drempel moet kleiner zijn dan de oranje drempel, en groter dan 0.");
  }
  if (waarden.drempelOranje >= 1) {
    throw new Error("De oranje drempel moet kleiner zijn dan 1.");
  }
  if (waarden.minActiviteiten < 1 || waarden.minActiviteiten > 20) {
    throw new Error("Het minimum aantal activiteiten moet tussen 1 en 20 liggen.");
  }
}

export async function updateAandachtInstellingenAction(waarden: AandachtInstellingen) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "COORDINATOR") {
    throw new Error("Niet geautoriseerd");
  }
  valideer(waarden);

  await updateAandachtInstellingen(session.user.organisatieId!, waarden);

  revalidatePath("/coordinator/aandacht");
  revalidatePath("/coordinator/aandacht/instellingen");
  revalidatePath("/coordinator");
  revalidatePath("/vrijwilliger/aandacht");
}

export async function markeerAandachtOpgepaktAction(bewonerId: string, notitie?: string) {
  const session = await auth();
  if (!session?.user || !(session.user.rol === "COORDINATOR" || session.user.rol === "WELZIJNSMEDEWERKER")) {
    throw new Error("Niet geautoriseerd");
  }
  if (!session.user.gebruikerId) throw new Error("Niet geautoriseerd");

  await markeerAandachtOpgepakt({
    organisatieId: session.user.organisatieId!,
    bewonerId,
    gebruikerId: session.user.gebruikerId,
    notitie: notitie?.trim() || undefined,
  });

  revalidatePath("/coordinator/aandacht");
  revalidatePath("/coordinator");
  revalidatePath("/vrijwilliger/aandacht");
}
