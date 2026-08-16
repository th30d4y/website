import { NextRequest, NextResponse } from 'next/server';
import { fetchOrgMembers } from '@/lib/github';
import { getCache, setCache, getStaleCache, invalidateCache, TTL } from '@/lib/cache';

const cacheKey = 'org:members';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const forceRefresh = searchParams.get('refresh') === '1';

  if (forceRefresh) {
    invalidateCache(cacheKey);
  }

  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const members = await fetchOrgMembers();
    const isFallback = members.length === 1;
    setCache(cacheKey, members, isFallback ? 60_000 : TTL.MEMBERS);
    return NextResponse.json({ data: members, cached: false, fallback: isFallback });
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
      { error: 'Failed to fetch organization members' },
      { status: 500 }
    );
  }
}
