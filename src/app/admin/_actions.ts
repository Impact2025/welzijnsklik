"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { requireAdmin } from "@/lib/admin-auth";

// ─── Blog ────────────────────────────────────────────────

export async function updateBlogPost(id: string, formData: FormData) {
  const session = await requireAdmin();
  const titel = formData.get("titel") as string;
  const slug = formData.get("slug") as string;
  const inhoud = formData.get("inhoud") as string;
  const samenvatting = (formData.get("samenvatting") as string) || null;
  const focusKeyword = (formData.get("focusKeyword") as string) || null;
  const seoTitle = (formData.get("seoTitle") as string) || null;
  const seoDescription = (formData.get("seoDescription") as string) || null;
  const publish = formData.get("publish") === "true";

  await prisma.blogPost.update({
    where: { id },
    data: {
      titel,
      slug,
      inhoud,
      samenvatting,
      focusKeyword,
      seoTitle,
      seoDescription,
      status: publish ? "GEPUBLICEERD" : "CONCEPT",
      gepubliceerdOp: publish ? new Date() : null,
      updatedBy: session.user.naam ?? session.user.email ?? "onbekend",
    },
  });
  revalidatePath("/admin/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/admin/blog");
}

export async function deleteBlogPost(id: string) {
  await requireAdmin();
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

// ─── Nieuwsbrieven ───────────────────────────────────────

export async function updateNieuwsbrief(id: string, formData: FormData) {
  await requireAdmin();
  const onderwerp = formData.get("onderwerp") as string;
  const titel = formData.get("titel") as string;
  const inhoud = formData.get("inhoud") as string;
  const type = (formData.get("type") as string) || "nieuwsbrief";

  await prisma.nieuwsbrief.update({
    where: { id },
    data: { onderwerp, titel, inhoud, type },
  });
  revalidatePath("/admin/nieuwsbrieven");
  revalidatePath(`/admin/nieuwsbrieven/${id}/edit`);
  redirect("/admin/nieuwsbrieven");
}

export async function sendNieuwsbrief(id: string) {
  await requireAdmin();
  const nieuwsbrief = await prisma.nieuwsbrief.findUnique({ where: { id } });
  if (!nieuwsbrief) throw new Error("Nieuwsbrief niet gevonden");
  if (nieuwsbrief.status === "VERZONDEN") throw new Error("Deze nieuwsbrief is al verzonden.");

  const leads = await prisma.lead.findMany({
    where: { status: { not: "niet_relevant" } },
    select: { email: true, naam: true },
  });

  let verstuurt = 0;
  for (const lead of leads) {
    const ok = await sendEmail({
      to: lead.email,
      subject: nieuwsbrief.onderwerp,
      html: nieuwsbrief.inhoud,
    });
    if (ok) {
      verstuurt++;
      await prisma.nieuwsbriefAbonnement.create({
        data: {
          nieuwsbriefId: id,
          email: lead.email,
          naam: lead.naam,
          status: "verzonden",
        },
      });
    }
  }

  await prisma.nieuwsbrief.update({
    where: { id },
    data: { status: "VERZONDEN", verzondenOp: new Date(), verstuurtAantal: verstuurt },
  });
  revalidatePath("/admin/nieuwsbrieven");
  redirect("/admin/nieuwsbrieven");
}
