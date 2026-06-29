import { auth } from "@/auth";
import { redirect } from "next/navigation";
import HomeClient from "./home-client";

const ROL_HOME: Record<string, string> = {
  COORDINATOR: "/coordinator",
  VRIJWILLIGER: "/vrijwilliger",
  FAMILIE: "/familie",
};

export default async function Home() {
  const session = await auth();
  if (session?.user?.rol) {
    redirect(ROL_HOME[session.user.rol] ?? "/login");
  }
  return <HomeClient />;
}
