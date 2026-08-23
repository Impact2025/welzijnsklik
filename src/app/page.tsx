import { auth } from "@/auth";
import { redirect } from "next/navigation";
import HomeClient from "./home-client";
import { ROL_HOME } from "@/lib/rollen";
export default async function Home() {
  const session = await auth();
  if (session?.user?.rol) {
    redirect(ROL_HOME[session.user.rol] ?? "/login");
  }
  return <HomeClient />;
}
