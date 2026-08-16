import { NextRequest, NextResponse } from 'next/server';
import { fetchTree } from '@/lib/github';
import { getCache, setCache, TTL } from '@/lib/cache';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
) {
  const { repo } = await params;
  const cacheKey = `tree:${repo}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const tree = await fetchTree(repo);
    setCache(cacheKey, tree, TTL.TREE);
    return NextResponse.json({ data: tree, cached: false });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tree' }, { status: 500 });
  }
}
