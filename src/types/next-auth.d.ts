import type { Rol } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      gebruikerId?: string;
      rol?: Rol;
      organisatieId?: string;
      naam?: string;
      profielFoto?: string | null;
    };
  }
}
