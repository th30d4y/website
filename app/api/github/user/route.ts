import { NextRequest, NextResponse } from 'next/server';
import { fetchUser } from '@/lib/github';
import { getCache, setCache, getStaleCache, invalidateCache, TTL } from '@/lib/cache';

const cacheKey = 'user';

export async function GET(req: NextRequest) {
  if (new URL(req.url).searchParams.get('refresh') === '1') {
    invalidateCache(cacheKey);
  }

  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const user = await fetchUser();
    setCache(cacheKey, user, TTL.USER);
    return NextResponse.json({ data: user, cached: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'RATE_LIMITED') {
      const stale = getStaleCache(cacheKey);
      if (stale) {
        return NextResponse.json({ data: stale.data, cached: true, stale: true, staleAgeMs: stale.ageMs });
      }
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
