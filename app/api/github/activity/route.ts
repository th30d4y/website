import { NextResponse } from 'next/server';
import { fetchRepositories, fetchCommits, truncateMessage } from '@/lib/github';
import { getCache, setCache, TTL } from '@/lib/cache';
import type { GitHubRepository } from '@/types/github';

export interface ActivityItem {
  repo: string;
  repoUrl: string;
  sha: string;
  message: string;
  author: string;
  authorAvatar: string | null;
  date: string;
  url: string;
}

export async function GET() {
  const cached = getCache<ActivityItem[]>('activity');
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const repos = await fetchRepositories();

    // Get top repos by recent push date (non-archived, non-fork)
    const activeRepos = repos
      .filter((r: GitHubRepository) => !r.archived)
      .sort(
        (a: GitHubRepository, b: GitHubRepository) =>
          new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
      )
      .slice(0, 8);

    const allActivity: ActivityItem[] = [];

    await Promise.allSettled(
      activeRepos.map(async (repo: GitHubRepository) => {
        const commits = await fetchCommits(repo.name, 5);
        for (const commit of commits) {
          allActivity.push({
            repo: repo.name,
            repoUrl: repo.html_url,
            sha: commit.sha.slice(0, 7),
            message: truncateMessage(commit.commit.message),
            author: commit.commit.author.name,
            authorAvatar: commit.author?.avatar_url || null,
            date: commit.commit.author.date,
            url: commit.html_url,
          });
        }
      })
    );

    // Sort by date descending
    allActivity.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const recent = allActivity.slice(0, 30);
    setCache('activity', recent, TTL.COMMITS);
    return NextResponse.json({ data: recent, cached: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'RATE_LIMITED') {
      return NextResponse.json(
        { error: 'GitHub API rate limit reached', rateLimited: true },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
