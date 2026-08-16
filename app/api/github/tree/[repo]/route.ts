import { NextRequest, NextResponse } from 'next/server';
import { fetchTree } from '@/lib/github';
import { getCache, setCache, getStaleCache, invalidateCache, TTL } from '@/lib/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
) {
  const { repo } = await params;
  const { searchParams } = new URL(req.url);
  const branch = searchParams.get('branch') ?? undefined;

  const cacheKey = `tree:${repo}:${branch ?? 'auto'}`;

  if (searchParams.get('refresh') === '1') {
    invalidateCache(cacheKey);
  }

  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const tree = await fetchTree(repo, branch);
    if (tree) setCache(cacheKey, tree, TTL.TREE);
    return NextResponse.json({ data: tree, cached: false });
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
    return NextResponse.json({ error: 'Failed to fetch tree' }, { status: 500 });
  }
}
