import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.init();
    const threads = await db.getThreads();
    return NextResponse.json({ threads });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Szerver hiba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, title, messages } = await req.json();

    if (!id || !title || !messages) {
      return NextResponse.json({ error: 'Hiányzó adatok: id, title vagy messages' }, { status: 400 });
    }

    await db.init();
    await db.saveThread(id, title, messages);
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Szerver hiba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
