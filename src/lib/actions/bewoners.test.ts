import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────
const prismaMock = {
  bewoner: { findFirst: vi.fn(), update: vi.fn() },
  toestemmingLog: { create: vi.fn() },
  organisatie: { findUnique: vi.fn() },
  familieKoppeling: { findMany: vi.fn() },
  $transaction: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const authMock = vi.fn();
vi.mock("@/auth", () => ({ auth: authMock }));

const sendEmailMock = vi.fn().mockResolvedValue(true);
vi.mock("@/lib/email", () => ({ sendEmail: sendEmailMock, toestemmingHtml: vi.fn(), welkomHtml: vi.fn() }));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

const { updateToestemming } = await import("@/lib/actions/bewoners");

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockImplementation(async (ops: unknown[]) => {
    // Voer de Prisma-calls echt uit zodat de geneste create-mocks worden aangeroepen
    return Promise.all(ops as Promise<unknown>[]);
  });
  prismaMock.bewoner.findFirst.mockResolvedValue({ id: "b1", naam: "Annie" });
  prismaMock.organisatie.findUnique.mockResolvedValue({ naam: "De Meerwende" });
  prismaMock.familieKoppeling.findMany.mockResolvedValue([]);
  sendEmailMock.mockResolvedValue(true);
});

describe("updateToestemming", () => {
  it("gooit bij niet-coordinator", async () => {
    authMock.mockResolvedValue({ user: { organisatieId: "org1", rol: "VRIJWILLIGER", gebruikerId: "u1" } });
    await expect(updateToestemming("b1", true, "Maria")).rejects.toThrow();
  });

  it("schrijft ToestemmingLog AAN binnen $transaction", async () => {
    authMock.mockResolvedValue({
      user: { organisatieId: "org1", rol: "COORDINATOR", gebruikerId: "u1", naam: "Co", email: "c@x.nl" },
    });

    await updateToestemming("b1", true, "Maria");

    expect(prismaMock.toestemmingLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ actie: "AAN", bewonerId: "b1", door: "Maria", uitgevoerdDoor: "u1" }),
      })
    );
  });

  it("schrijft ToestemmingLog UIT bij uitzetten", async () => {
    authMock.mockResolvedValue({
      user: { organisatieId: "org1", rol: "COORDINATOR", gebruikerId: "u1", naam: "Co", email: "c@x.nl" },
    });

    await updateToestemming("b1", false, "");

    expect(prismaMock.toestemmingLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ actie: "UIT", bewonerId: "b1" }),
      })
    );
  });
});
