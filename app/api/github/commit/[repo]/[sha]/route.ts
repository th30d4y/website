import { NextRequest, NextResponse } from 'next/server';
import { fetchCommit } from '@/lib/github';
import { getCache, setCache, TTL } from '@/lib/cache';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ repo: string; sha: string }> }
) {
  const { repo, sha } = await params;
  const cacheKey = `commit:${repo}:${sha}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const commit = await fetchCommit(repo, sha);
    setCache(cacheKey, commit, TTL.README); // commits are immutable, long cache
    return NextResponse.json({ data: commit, cached: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Commit not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to fetch commit' }, { status: 500 });
  }
}
