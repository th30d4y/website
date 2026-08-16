import { NextResponse } from 'next/server';
import { fetchPublicEvents, normalizeEvent } from '@/lib/github';
import { getCache, setCache, TTL } from '@/lib/cache';

export async function GET() {
  const cached = getCache('events');
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const events = await fetchPublicEvents(60);
    const normalized = events.map(normalizeEvent);
    setCache('events', normalized, TTL.EVENTS);
    return NextResponse.json({ data: normalized, cached: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'RATE_LIMITED') {
      return NextResponse.json(
        { error: 'GitHub API rate limit reached', rateLimited: true },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
