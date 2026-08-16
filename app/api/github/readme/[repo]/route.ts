import { NextRequest, NextResponse } from 'next/server';
import { fetchReadme } from '@/lib/github';
import { getCache, setCache, TTL } from '@/lib/cache';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
) {
  const { repo } = await params;
  const cacheKey = `readme:${repo}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const readme = await fetchReadme(repo);
    setCache(cacheKey, readme, TTL.README);
    return NextResponse.json({ data: readme, cached: false });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch README' }, { status: 500 });
  }
}
