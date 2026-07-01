"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { requireAdmin } from "@/lib/admin-auth";

export async function createKlant(formData: FormData) {
  await requireAdmin();
  const naam = formData.get("naam") as string;
  const plaats = formData.get("plaats") as string;
  const coordinatorNaam = formData.get("coordinatorNaam") as string;
  const coordinatorEmail = formData.get("coordinatorEmail") as string;

  const existing = await prisma.user.findUnique({ where: { email: coordinatorEmail } });
  if (existing) throw new Error("Er bestaat al een account met dit e-mailadres.");

  const organisatie = await prisma.organisatie.create({
    data: { naam, plaats },
  });

  await prisma.user.create({
    data: {
      email: coordinatorEmail,
      name: coordinatorNaam,
      gebruiker: {
        create: {
          naam: coordinatorNaam,
          email: coordinatorEmail,
          rol: "COORDINATOR",
          organisatieId: organisatie.id,
        },
      },
    },
  });

  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  await sendEmail({
    to: coordinatorEmail,
    subject: "Welkom bij Welzijnsklik",
    html: `<p>Hallo ${coordinatorNaam},</p>
<p>Er is een Welzijnsklik-account voor ${naam} aangemaakt. Klik hieronder om in te loggen:</p>
<p><a href="${appUrl}/login" style="background:#005e9f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Log in op Welzijnsklik</a></p>
<p>Met vriendelijke groet,<br>Team Welzijnsklik</p>`,
  });

  revalidatePath("/admin/klanten");
  redirect(`/admin/klanten/${organisatie.id}`);
}

export async function updateKlant(id: string, formData: FormData) {
  await requireAdmin();
  const naam = formData.get("naam") as string;
  const plaats = formData.get("plaats") as string;

  await prisma.organisatie.update({
    where: { id },
    data: { naam, plaats },
  });

  revalidatePath("/admin/klanten");
  revalidatePath(`/admin/klanten/${id}`);
}
