import { NextRequest, NextResponse } from 'next/server';
import { fetchCommits } from '@/lib/github';
import { getCache, setCache, TTL } from '@/lib/cache';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const repo = searchParams.get('repo');
  const perPage = Math.min(parseInt(searchParams.get('per_page') || '20'), 100);

  if (!repo) {
    return NextResponse.json({ error: 'repo parameter required' }, { status: 400 });
  }

  const cacheKey = `commits:${repo}:${perPage}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const commits = await fetchCommits(repo, perPage);
    setCache(cacheKey, commits, TTL.COMMITS);
    return NextResponse.json({ data: commits, cached: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'RATE_LIMITED') {
      return NextResponse.json(
        { error: 'GitHub API rate limit reached', rateLimited: true },
        { status: 429 }
      );
    }
    if (msg === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to fetch commits' }, { status: 500 });
  }
}
