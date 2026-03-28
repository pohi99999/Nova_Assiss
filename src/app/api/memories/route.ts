import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface MemorySummary {
  id: string;
  text: string;
  source: string;
  createdAt: string;
}

export async function GET() {
  try {
    await db.init();

    const memories: MemorySummary[] = db.memories.map((m) => ({
      id: m.id,
      text: m.text,
      source: typeof m.metadata?.['source'] === 'string' ? m.metadata['source'] : 'unknown',
      createdAt: typeof m.metadata?.['createdAt'] === 'string' ? m.metadata['createdAt'] : '',
    }));

    return NextResponse.json({ memories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Szerver hiba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
