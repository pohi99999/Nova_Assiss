import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await db.init();
    const { id } = await params;

    const thread = await db.getThread(id);
    if (!thread) {
      return NextResponse.json({ error: 'Beszélgetés nem található' }, { status: 404 });
    }

    return NextResponse.json({ thread });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Szerver hiba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await db.init();
    const { id } = await params;

    await db.deleteThread(id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Szerver hiba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
