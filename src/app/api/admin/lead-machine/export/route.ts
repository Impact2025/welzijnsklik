import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const leads = await prisma.lead.findMany({
      where: { website: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: {
        organisatie: true,
        email: true,
        telefoon: true,
        website: true,
        plaats: true,
        aiScore: true,
        aiRationale: true,
        sbiBeschrijving: true,
        status: true,
        starred: true,
        createdAt: true,
      },
    });

    // Generate CSV
    const header = 'Organisatie;Email;Telefoon;Website;Plaats;AI Score;Status;Datum';
    const rows = leads.map((l) =>
      [
        l.organisatie ?? '',
        l.email ?? '',
        l.telefoon ?? '',
        l.website ?? '',
        l.plaats ?? '',
        l.aiScore ?? '',
        l.status,
        l.createdAt ? new Date(l.createdAt).toLocaleDateString('nl-NL') : '',
      ].join(';'),
    );

    const csv = '\uFEFF' + [header, ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="leads-welzijnsklik.csv"',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export mislukt' }, { status: 500 });
  }
}
