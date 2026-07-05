import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function mapLead(l: Record<string, unknown>) {
  return {
    id: l.id,
    naam: l.naam,
    organisatie: l.organisatie,
    email: l.email,
    telefoon: l.telefoon,
    website: l.website,
    kvkNummer: l.kvkNummer,
    sbiCode: l.sbiCode,
    sbiBeschrijving: l.sbiBeschrijving,
    plaats: l.plaats,
    postcode: l.postcode,
    adres: l.adres,
    contactPersoon: l.contactPersoon,
    notitie: l.notitie,
    aiScore: l.aiScore != null ? Number(l.aiScore) : null,
    aiRationale: l.aiRationale,
    status: l.status,
    starred: l.starred,
    scrapedAt: l.scrapedAt,
    scoredAt: l.scoredAt,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  };
}

// GET — fetch saved leads
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { organisatie: { contains: search, mode: 'insensitive' } },
        { plaats: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { naam: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: [{ starred: 'desc' }, { aiScore: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({ leads, total, limit, offset });
  } catch (error) {
    console.error('Leads GET error:', error);
    return NextResponse.json({ error: 'Ophalen mislukt', leads: [] }, { status: 500 });
  }
}

// POST — save a new lead
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { naam, organisatie: org, email, telefoon, website, aiScore, aiRationale, sbiDescription } = body;

    if (!email && !org) {
      return NextResponse.json({ error: 'E-mail of organisatie is verplicht' }, { status: 400 });
    }

    const now = new Date();
    const lead = await prisma.lead.create({
      data: {
        naam: naam ?? null,
        organisatie: org ?? null,
        email: email ?? '',
        telefoon: telefoon ?? null,
        website: website ?? null,
        aiScore: aiScore ?? null,
        aiRationale: aiRationale ?? null,
        sbiBeschrijving: sbiDescription ?? null,
        scrapedAt: email || telefoon ? now : null,
        scoredAt: aiScore != null ? now : null,
        status: 'nieuw',
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error('Leads POST error:', error);
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
  }
}

// PUT — update status / starred
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, starred, notitie } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (starred !== undefined) data.starred = starred;
    if (notitie !== undefined) data.notitie = notitie;

    const lead = await prisma.lead.update({ where: { id }, data });

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Leads PUT error:', error);
    return NextResponse.json({ error: 'Bijwerken mislukt' }, { status: 500 });
  }
}

// DELETE — remove a lead
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });

    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leads DELETE error:', error);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
