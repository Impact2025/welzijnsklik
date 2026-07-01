import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = "v.munster@weareimpact.nl";
const ADMIN_PASSWORD = "Demo1234";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Ongeldige inloggegevens" },
        { status: 401 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      include: { gebruiker: true },
    });

    if (!user) {
      let organisatie = await prisma.organisatie.findFirst();
      if (!organisatie) {
        organisatie = await prisma.organisatie.create({
          data: { naam: "Stichting de Baan", plaats: "Amsterdam" },
        });
      }

      const naam = "Vincent Munster";
      user = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: naam,
          gebruiker: {
            create: {
              naam,
              email: ADMIN_EMAIL,
              rol: "COORDINATOR",
              organisatieId: organisatie.id,
            },
          },
        },
        include: { gebruiker: true },
      });
    }

    const response = NextResponse.json({ ok: true });
    return response;
  } catch (err) {
    console.error("[admin-login] error:", err);
    return NextResponse.json(
      { error: "Server fout" },
      { status: 500 }
    );
  }
}
