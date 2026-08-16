import { NextRequest, NextResponse } from 'next/server';
import { fetchPullRequests } from '@/lib/github';
import { getCache, setCache, TTL } from '@/lib/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
) {
  const { repo } = await params;
  const state = (new URL(req.url).searchParams.get('state') || 'open') as
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
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch pull requests' },
      { status: 500 }
    );
  }
}
