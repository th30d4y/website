import { NextRequest, NextResponse } from 'next/server';
import { fetchIssues } from '@/lib/github';
import { getCache, setCache, getStaleCache, invalidateCache, TTL } from '@/lib/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
) {
  const { repo } = await params;
  const { searchParams } = new URL(req.url);
  const state = (searchParams.get('state') || 'all') as 'open' | 'closed' | 'all';

  const cacheKey = `issues:${repo}:${state}`;

  if (searchParams.get('refresh') === '1') {
    invalidateCache(cacheKey);
  }

  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const issues = await fetchIssues(repo, state);
    setCache(cacheKey, issues, TTL.ISSUES);
    return NextResponse.json({ data: issues, cached: false });
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
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}
