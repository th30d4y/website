import { NextResponse } from 'next/server';
import { fetchOrganization } from '@/lib/github';
import { getCache, setCache, TTL } from '@/lib/cache';

export async function GET() {
  const cached = getCache('org');
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const org = await fetchOrganization();
    setCache('org', org, TTL.ORG);
    return NextResponse.json({ data: org, cached: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'RATE_LIMITED') {
      return NextResponse.json(
        { error: 'GitHub API rate limit reached', rateLimited: true },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}
