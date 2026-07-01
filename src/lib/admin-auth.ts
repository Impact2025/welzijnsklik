import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Geen toegang");
  }
  return session;
}
