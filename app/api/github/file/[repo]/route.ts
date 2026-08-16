import { NextRequest, NextResponse } from 'next/server';
import { GITHUB_USERNAME } from '@/lib/github';
import { getCache, setCache, getStaleCache, TTL } from '@/lib/cache';

const GITHUB_API = 'https://api.github.com';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
) {
  const { repo } = await params;
  const path = new URL(req.url).searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'path parameter required' }, { status: 400 });
  }

  const cacheKey = `file:${repo}:${path}`;
  const cached = getCache(cacheKey);
  if (cached) return NextResponse.json({ data: cached, cached: true });

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': '0d4y-website',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${GITHUB_USERNAME}/${repo}/contents/${encodeURIComponent(path)}`,
      { headers }
    );

    if (res.status === 403) {
      const stale = getStaleCache(cacheKey);
      if (stale) {
        return NextResponse.json({ data: stale.data, cached: true, stale: true, staleAgeMs: stale.ageMs });
      }
      return NextResponse.json({ error: 'Rate limited', rateLimited: true }, { status: 429 });
    }
    if (res.status === 404) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    if (!res.ok) {
      const stale = getStaleCache(cacheKey);
      if (stale) {
        return NextResponse.json({ data: stale.data, cached: true, stale: true });
      }
      return NextResponse.json({ error: `API error ${res.status}` }, { status: 500 });
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      return NextResponse.json({ error: 'Path is a directory' }, { status: 400 });
    }

    const isBinary = data.encoding !== 'base64' || !data.content;
    let content = '';
    let binary = false;

    if (isBinary || data.size > 500_000) {
      binary = true;
    } else {
      content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8');
      if (content.includes('\x00')) binary = true;
    }

    const result = {
      name: data.name,
      path: data.path,
      content: binary ? '' : content,
      binary,
      size: data.size,
      sha: data.sha,
      html_url: data.html_url,
    };

    setCache(cacheKey, result, TTL.README);
    return NextResponse.json({ data: result, cached: false });
  } catch {
    const stale = getStaleCache(cacheKey);
    if (stale) {
      return NextResponse.json({ data: stale.data, cached: true, stale: true });
    }
    return NextResponse.json({ error: 'Failed to fetch file content' }, { status: 500 });
  }
}
