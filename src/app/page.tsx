import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const rol = session.user.rol;

  if (rol === "COORDINATOR") redirect("/coordinator");
  if (rol === "VRIJWILLIGER") redirect("/vrijwilliger");
  if (rol === "FAMILIE") redirect("/familie");

  redirect("/geen-toegang");
}
