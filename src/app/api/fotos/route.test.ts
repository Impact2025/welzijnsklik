import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────
const prismaMock = {
  gebruiker: { findUnique: vi.fn(), findFirst: vi.fn() },
  bewoner: { findFirst: vi.fn() },
  familieKoppeling: { findFirst: vi.fn() },
  hulpGevraagd: { findFirst: vi.fn() },
  toegangLog: { create: vi.fn() },
};

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const authMock = vi.fn();
vi.mock("@/auth", () => ({ auth: authMock }));

// Stub globale fetch (de blob-fetch in serve())
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

// Importeer de route NA het mocken
const { GET } = await import("@/app/api/fotos/route");
import { NextRequest } from "next/server";

const TOKENIZED = "https://abc123.blob.vercel-storage.com/activiteiten/x/1.jpg?token=secret";

function makeReq(url: string) {
  return new NextRequest(url);
}

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockReset();
  prismaMock.toegangLog.create.mockResolvedValue({ id: "log1" });
});

describe("GET /api/fotos", () => {
  it("401 zonder sessie", async () => {
    authMock.mockResolvedValue(null);
    const res = await GET(makeReq(`http://localhost/api/fotos?url=${TOKENIZED}&kind=activiteit&id=b1`));
    expect(res.status).toBe(401);
  });

  it("400 zonder id", async () => {
    authMock.mockResolvedValue({ user: { gebruikerId: "u1" } });
    const res = await GET(makeReq(`http://localhost/api/fotos?url=${TOKENIZED}&kind=activiteit`));
    expect(res.status).toBe(400);
  });

  it("400 bij niet-blob URL", async () => {
    authMock.mockResolvedValue({ user: { gebruikerId: "u1" } });
    const res = await GET(makeReq(`http://localhost/api/fotos?url=https://evil.com/x.jpg&kind=activiteit&id=b1`));
    expect(res.status).toBe(400);
  });

  it("404 als bewoner niet in eigen organisatie zit", async () => {
    authMock.mockResolvedValue({ user: { gebruikerId: "u1", organisatieId: "org1", rol: "COORDINATOR" } });
    prismaMock.gebruiker.findUnique.mockResolvedValue({ organisatieId: "org1", rol: "COORDINATOR" });
    prismaMock.bewoner.findFirst.mockResolvedValue(null);
    const res = await GET(makeReq(`http://localhost/api/fotos?url=${TOKENIZED}&kind=activiteit&id=b1`));
    expect(res.status).toBe(404);
  });

  it("403 als vrijwilliger foto van bewoner zonder toestemming wil", async () => {
    authMock.mockResolvedValue({ user: { gebruikerId: "u1", organisatieId: "org1", rol: "VRIJWILLIGER" } });
    prismaMock.gebruiker.findUnique.mockResolvedValue({ organisatieId: "org1", rol: "VRIJWILLIGER" });
    prismaMock.bewoner.findFirst.mockResolvedValue({ toestemmingFotos: false });
    const res = await GET(makeReq(`http://localhost/api/fotos?url=${TOKENIZED}&kind=activiteit&id=b1`));
    expect(res.status).toBe(403);
  });

  it("403 als familie niet gekoppeld is aan bewoner", async () => {
    authMock.mockResolvedValue({ user: { gebruikerId: "u1", organisatieId: "org1", rol: "FAMILIE" } });
    prismaMock.gebruiker.findUnique.mockResolvedValue({ organisatieId: "org1", rol: "FAMILIE" });
    prismaMock.bewoner.findFirst.mockResolvedValue({ toestemmingFotos: true });
    prismaMock.familieKoppeling.findFirst.mockResolvedValue(null);
    const res = await GET(makeReq(`http://localhost/api/fotos?url=${TOKENIZED}&kind=activiteit&id=b1`));
    expect(res.status).toBe(403);
  });

  it("200 + schrijft ToegangLog bij geldige coordinator-aanvraag", async () => {
    authMock.mockResolvedValue({ user: { gebruikerId: "u1", organisatieId: "org1", rol: "COORDINATOR" } });
    prismaMock.gebruiker.findUnique.mockResolvedValue({ organisatieId: "org1", rol: "COORDINATOR" });
    prismaMock.bewoner.findFirst.mockResolvedValue({ toestemmingFotos: true });
    fetchMock.mockResolvedValue(new Response(new Blob(["imgdata"], { type: "image/jpeg" }), { status: 200 }));

    const res = await GET(makeReq(`http://localhost/api/fotos?url=${TOKENIZED}&kind=activiteit&id=b1`));
    expect(res.status).toBe(200);
    expect(prismaMock.toegangLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ actie: "FOTO_BEKEKEN", bewonerId: "b1" }) })
    );
  });

  it("200 bij geldige hulp-foto voor coordinator", async () => {
    authMock.mockResolvedValue({ user: { gebruikerId: "u1", organisatieId: "org1", rol: "COORDINATOR" } });
    prismaMock.gebruiker.findUnique.mockResolvedValue({ organisatieId: "org1", rol: "COORDINATOR" });
    prismaMock.hulpGevraagd.findFirst.mockResolvedValue({ id: "h1" });
    fetchMock.mockResolvedValue(new Response(new Blob(["imgdata"], { type: "image/jpeg" }), { status: 200 }));

    const res = await GET(makeReq(`http://localhost/api/fotos?url=${TOKENIZED}&kind=hulp&id=h1`));
    expect(res.status).toBe(200);
  });

  it("403 bij hulp-foto voor familie", async () => {
    authMock.mockResolvedValue({ user: { gebruikerId: "u1", organisatieId: "org1", rol: "FAMILIE" } });
    prismaMock.gebruiker.findUnique.mockResolvedValue({ organisatieId: "org1", rol: "FAMILIE" });
    const res = await GET(makeReq(`http://localhost/api/fotos?url=${TOKENIZED}&kind=hulp&id=h1`));
    expect(res.status).toBe(403);
  });

  it("200 bij geldige profielfoto binnen organisatie", async () => {
    authMock.mockResolvedValue({ user: { gebruikerId: "u1", organisatieId: "org1", rol: "VRIJWILLIGER" } });
    prismaMock.gebruiker.findUnique.mockResolvedValue({ organisatieId: "org1", rol: "VRIJWILLIGER" });
    prismaMock.gebruiker.findFirst.mockResolvedValue({ id: "u2" }); // eigenaar in org
    fetchMock.mockResolvedValue(new Response(new Blob(["imgdata"], { type: "image/jpeg" }), { status: 200 }));

    const res = await GET(makeReq(`http://localhost/api/fotos?url=${TOKENIZED}&kind=profiel&id=u2`));
    expect(res.status).toBe(200);
  });
});
