import { NextRequest, NextResponse } from 'next/server';
import {
  fetchPublicEvents,
  normalizeEvent,
  fetchRepositories,
  fetchCommits,
  truncateMessage,
} from '@/lib/github';
import { getCache, setCache, getStaleCache, invalidateCache, TTL } from '@/lib/cache';
import type { NormalizedActivity, GitHubRepository } from '@/types/github';

const cacheKey = 'events';

async function buildCommitFallback(): Promise<NormalizedActivity[]> {
  const repos = await fetchRepositories();

  const activeRepos = repos
    .filter((r: GitHubRepository) => !r.archived)
    .sort(
      (a: GitHubRepository, b: GitHubRepository) =>
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    )
    .slice(0, 8);

  const results: NormalizedActivity[] = [];

  await Promise.allSettled(
    activeRepos.map(async (repo: GitHubRepository) => {
      const commits = await fetchCommits(repo.name, 8);
      for (const commit of commits) {
        results.push({
          id: `commit-${commit.sha}`,
          type: 'PushEvent',
          icon: '↑',
          title: 'pushed commit',
          detail: truncateMessage(commit.commit.message, 72),
          url: commit.html_url,
          repo: repo.name,
          repoUrl: repo.html_url,
          actor: commit.commit.author.name,
          actorAvatar: commit.author?.avatar_url ?? '',
          date: commit.commit.author.date,
        });
      }
    })
  );

  return results.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const forceRefresh = searchParams.get('refresh') === '1';

  if (forceRefresh) {
    invalidateCache(cacheKey);
  }

  const cached = getCache<NormalizedActivity[]>(cacheKey);
  if (cached && cached.length > 0) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const events = await fetchPublicEvents(60);
    let normalized: NormalizedActivity[] = events.map(normalizeEvent);

    if (normalized.length === 0) {
      normalized = await buildCommitFallback();
    }

    if (normalized.length > 0) {
      setCache(cacheKey, normalized, TTL.EVENTS);
    }

    return NextResponse.json({
      data: normalized,
      cached: false,
      source: events.length > 0 ? 'github_events' : 'commits',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'RATE_LIMITED') {
      const stale = getStaleCache(cacheKey);
      if (stale) {
        return NextResponse.json({ data: stale.data, cached: true, stale: true, staleAgeMs: stale.ageMs });
      }
      return NextResponse.json(
        { error: 'GitHub API rate limit reached', rateLimited: true },
        { status: 429 }
      );
    }
    const stale = getStaleCache(cacheKey);
    if (stale) {
      return NextResponse.json({ data: stale.data, cached: true, stale: true });
    }
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
