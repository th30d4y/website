import { NextResponse } from 'next/server';
import { fetchOrgMembers } from '@/lib/github';
import { getCache, setCache, TTL } from '@/lib/cache';

export async function GET() {
  const cached = getCache('org:members');
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const members = await fetchOrgMembers();
    setCache('org:members', members, TTL.MEMBERS);
    return NextResponse.json({ data: members, cached: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'RATE_LIMITED') {
      return NextResponse.json(
        { error: 'GitHub API rate limit reached', rateLimited: true },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch organization members' },
      { status: 500 }
    );
  }
}
