import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const config = await prisma.integrationConfig.findUnique({
      where: { key: 'ixc_erp' },
    });
    return NextResponse.json(config?.value || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, token } = body;

    if (!url || !token) {
      return NextResponse.json({ error: 'URL and Token are required' }, { status: 400 });
    }

    const config = await prisma.integrationConfig.upsert({
      where: { key: 'ixc_erp' },
      update: { value: { url, token } },
      create: { key: 'ixc_erp', value: { url, token } },
    });

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
