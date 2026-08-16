import { NextRequest, NextResponse } from 'next/server';
import { fetchContributors } from '@/lib/github';
import { getCache, setCache, TTL } from '@/lib/cache';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
) {
  const { repo } = await params;
  const cacheKey = `contributors:${repo}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const contributors = await fetchContributors(repo);
    setCache(cacheKey, contributors, TTL.CONTRIBUTORS);
    return NextResponse.json({ data: contributors, cached: false });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch contributors' },
      { status: 500 }
    );
  }
}
