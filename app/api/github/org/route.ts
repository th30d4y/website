import { NextRequest, NextResponse } from 'next/server';
import { fetchOrganization } from '@/lib/github';
import { getCache, setCache, getStaleCache, invalidateCache, TTL } from '@/lib/cache';

const cacheKey = 'org';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('refresh') === '1') {
    invalidateCache(cacheKey);
  }

  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const org = await fetchOrganization();
    setCache(cacheKey, org, TTL.ORG);
    return NextResponse.json({ data: org, cached: false });
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
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}
