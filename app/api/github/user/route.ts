import { NextResponse } from 'next/server';
import { fetchUser } from '@/lib/github';
import { getCache, setCache, TTL } from '@/lib/cache';

export async function GET() {
  const cached = getCache('user');
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const user = await fetchUser();
    setCache('user', user, TTL.USER);
    return NextResponse.json({ data: user, cached: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'RATE_LIMITED') {
      return NextResponse.json(
        { error: 'GitHub API rate limit reached', rateLimited: true },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch GitHub profile' },
      { status: 500 }
    );
  }
}
