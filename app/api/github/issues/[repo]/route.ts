import { NextRequest, NextResponse } from 'next/server';
import { fetchIssues } from '@/lib/github';
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

  const cacheKey = `issues:${repo}:${state}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const issues = await fetchIssues(repo, state);
    setCache(cacheKey, issues, TTL.ISSUES);
    return NextResponse.json({ data: issues, cached: false });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}
