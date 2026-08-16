import { NextResponse } from 'next/server';
import { fetchRepositories, fetchAggregatedLanguages } from '@/lib/github';
import { getCache, setCache, getStaleCache, TTL } from '@/lib/cache';

const cacheKey = 'repos';

export async function GET() {
  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const repos = await fetchRepositories();
    const languages = await fetchAggregatedLanguages(repos);
    const payload = { repos, languages };
    setCache(cacheKey, payload, TTL.REPOS);
    return NextResponse.json({ data: payload, cached: false });
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
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
