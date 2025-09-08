import { NextRequest, NextResponse } from 'next/server';
import { logServerEvent } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.name) return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    logServerEvent(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('analytics error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
