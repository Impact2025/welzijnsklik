"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";

export async function createLead(formData: FormData) {
  await requireAdmin();
  const naam = (formData.get("naam") as string) || null;
  const organisatie = (formData.get("organisatie") as string) || null;
  const email = formData.get("email") as string;
  const telefoon = (formData.get("telefoon") as string) || null;
  const notitie = (formData.get("notitie") as string) || null;

  await prisma.lead.create({
    data: { naam, organisatie, email, telefoon, notitie },
  });
  revalidatePath("/admin/leads");
}

export async function updateLeadStatus(id: string, formData: FormData) {
  await requireAdmin();
  const status = formData.get("status") as string;
  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath("/admin/leads");
}

export async function deleteLead(id: string) {
  await requireAdmin();
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/admin/leads");
}
