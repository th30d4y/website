import { NextRequest, NextResponse } from 'next/server';
import { fetchPullRequests } from '@/lib/github';
import { getCache, setCache, getStaleCache, TTL } from '@/lib/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
) {
  const { repo } = await params;
  const state = (new URL(req.url).searchParams.get('state') || 'all') as
    | 'open'
    | 'closed'
    | 'all';

  const cacheKey = `pulls:${repo}:${state}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const pulls = await fetchPullRequests(repo, state);
    setCache(cacheKey, pulls, TTL.PULLS);
    return NextResponse.json({ data: pulls, cached: false });
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
      { error: 'Failed to fetch pull requests' },
      { status: 500 }
    );
  }
}
