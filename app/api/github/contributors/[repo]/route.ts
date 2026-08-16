import { NextRequest, NextResponse } from 'next/server';
import { fetchContributors } from '@/lib/github';
import { getCache, setCache, getStaleCache, TTL } from '@/lib/cache';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
) {
  const { repo } = await params;
  const cacheKey = `contributors:${repo}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const contributors = await fetchContributors(repo);
    setCache(cacheKey, contributors, TTL.CONTRIBUTORS);
    return NextResponse.json({ data: contributors, cached: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'RATE_LIMITED') {
      const stale = getStaleCache(cacheKey);
      if (stale) {
        return NextResponse.json({ data: stale.data, cached: true, stale: true, staleAgeMs: stale.ageMs });
      }
      return NextResponse.json({ error: 'Rate limited', rateLimited: true }, { status: 429 });
    }
    const stale = getStaleCache(cacheKey);
    if (stale) {
      return NextResponse.json({ data: stale.data, cached: true, stale: true });
    }
    return NextResponse.json(
      { error: 'Failed to fetch contributors' },
      { status: 500 }
    );
  }
}
