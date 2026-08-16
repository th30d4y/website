import { NextResponse } from 'next/server';
import { fetchRepositories, fetchAggregatedLanguages } from '@/lib/github';
import { getCache, setCache, TTL } from '@/lib/cache';

export async function GET() {
  const cached = getCache('repos');
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const repos = await fetchRepositories();
    const languages = await fetchAggregatedLanguages(repos);

    const payload = { repos, languages };
    setCache('repos', payload, TTL.REPOS);
    return NextResponse.json({ data: payload, cached: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'RATE_LIMITED') {
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
