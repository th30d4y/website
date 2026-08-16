import type {
  GitHubUser,
  GitHubRepository,
  GitHubCommit,
  GitHubContributor,
  GitHubLanguages,
  GitHubIssue,
  GitHubPullRequest,
  GitHubTree,
  LanguageStat,
  GitHubOrg,
  GitHubMember,
  GitHubEvent,
  NormalizedActivity,
} from '@/types/github';

export const GITHUB_USERNAME = 'th30d4y';
const GITHUB_API = 'https://api.github.com';

// Language color map
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Java: '#b07219',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Kotlin: '#A97BFF',
  Swift: '#ffac45',
  Dart: '#00B4AB',
  Lua: '#000080',
  Vim: '#199f4b',
  Makefile: '#427819',
  Dockerfile: '#384d54',
  Nix: '#7e7eff',
  Zig: '#ec915c',
};

export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] || '#8b949e';
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': '0d4y-website',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function githubFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: getHeaders(),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 403) {
      const remaining = res.headers.get('x-ratelimit-remaining');
      if (remaining === '0') {
        throw new Error('RATE_LIMITED');
      }
    }
    if (res.status === 404) {
      throw new Error('NOT_FOUND');
    }
    throw new Error(`GitHub API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchUser(): Promise<GitHubUser> {
  return githubFetch<GitHubUser>(`/users/${GITHUB_USERNAME}`);
}

export async function fetchRepositories(): Promise<GitHubRepository[]> {
  const perPage = 100;
  let page = 1;
  const allRepos: GitHubRepository[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const repos = await githubFetch<GitHubRepository[]>(
      `/users/${GITHUB_USERNAME}/repos?per_page=${perPage}&page=${page}&sort=pushed&direction=desc`
    );
    allRepos.push(...repos);
    if (repos.length < perPage) break;
    page++;
    if (page > 10) break; // safety cap at 1000 repos
  }

  return allRepos;
}

export async function fetchRepository(name: string): Promise<GitHubRepository> {
  return githubFetch<GitHubRepository>(`/repos/${GITHUB_USERNAME}/${name}`);
}

export async function fetchCommits(
  repoName: string,
  perPage = 30
): Promise<GitHubCommit[]> {
  try {
    return await githubFetch<GitHubCommit[]>(
      `/repos/${GITHUB_USERNAME}/${repoName}/commits?per_page=${perPage}`
    );
  } catch (err) {
    if ((err as Error).message === 'NOT_FOUND') return [];
    throw err; // propagate RATE_LIMITED + other errors
  }
}

export async function fetchCommit(
  repoName: string,
  sha: string
): Promise<GitHubCommit> {
  return githubFetch<GitHubCommit>(
    `/repos/${GITHUB_USERNAME}/${repoName}/commits/${sha}`
  );
}

export async function fetchContributors(
  repoName: string
): Promise<GitHubContributor[]> {
  try {
    return await githubFetch<GitHubContributor[]>(
      `/repos/${GITHUB_USERNAME}/${repoName}/contributors?per_page=30`
    );
  } catch (err) {
    if ((err as Error).message === 'NOT_FOUND') return [];
    throw err;
  }
}

export async function fetchLanguages(
  repoName: string
): Promise<GitHubLanguages> {
  try {
    return await githubFetch<GitHubLanguages>(
      `/repos/${GITHUB_USERNAME}/${repoName}/languages`
    );
  } catch {
    return {};
  }
}

export async function fetchReadme(repoName: string): Promise<string | null> {
  try {
    const data = await githubFetch<{ content: string; encoding: string }>(
      `/repos/${GITHUB_USERNAME}/${repoName}/readme`
    );
    if (data.encoding === 'base64') {
      const decoded = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8');
      return decoded;
    }
    return data.content;
  } catch (err) {
    if ((err as Error).message === 'NOT_FOUND') return null; // no README is valid
    throw err;
  }
}

export async function fetchTree(
  repoName: string,
  branch?: string
): Promise<GitHubTree | null> {
  const targetBranch = branch ?? 'main';
  try {
    return await githubFetch<GitHubTree>(
      `/repos/${GITHUB_USERNAME}/${repoName}/git/trees/${targetBranch}?recursive=0`
    );
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === 'RATE_LIMITED') throw err; // let stale cache handle it
    if (msg === 'NOT_FOUND' && !branch) {
      // Branch might be wrong — try fetching the repo to get the real default branch
      try {
        const repo = await fetchRepository(repoName);
        if (repo.default_branch !== targetBranch) {
          return await githubFetch<GitHubTree>(
            `/repos/${GITHUB_USERNAME}/${repoName}/git/trees/${repo.default_branch}?recursive=0`
          );
        }
      } catch (inner) {
        if ((inner as Error).message === 'RATE_LIMITED') throw inner;
      }
    }
    return null;
  }
}

export async function fetchIssues(
  repoName: string,
  state: 'open' | 'closed' | 'all' = 'all'
): Promise<GitHubIssue[]> {
  // Increase per_page so we catch more issues across the board
  const issues = await githubFetch<GitHubIssue[]>(
    `/repos/${GITHUB_USERNAME}/${repoName}/issues?state=${state}&per_page=50&sort=created&direction=desc`
  );
  // GitHub's issues endpoint also returns pull requests — filter them out
  return issues.filter((i) => !i.pull_request);
}

export async function fetchPullRequests(
  repoName: string,
  state: 'open' | 'closed' | 'all' = 'all'
): Promise<GitHubPullRequest[]> {
  return githubFetch<GitHubPullRequest[]>(
    `/repos/${GITHUB_USERNAME}/${repoName}/pulls?state=${state}&per_page=50&sort=created&direction=desc`
  );
}

export async function fetchAggregatedLanguages(
  repos: GitHubRepository[]
): Promise<LanguageStat[]> {
  const totals: Record<string, number> = {};

  const languageFetches = repos
    .filter((r) => !r.archived && r.language)
    .slice(0, 20) // Limit to top 20 repos to avoid rate limits
    .map(async (r) => {
      const langs = await fetchLanguages(r.name);
      for (const [lang, bytes] of Object.entries(langs)) {
        totals[lang] = (totals[lang] || 0) + bytes;
      }
    });

  await Promise.allSettled(languageFetches);

  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  return Object.entries(totals)
    .map(([language, bytes]) => ({
      language,
      bytes,
      percentage: Math.round((bytes / total) * 1000) / 10,
      color: getLanguageColor(language),
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 10);
}

// Scoring for featured projects
export function scoreRepository(repo: GitHubRepository): number {
  const now = Date.now();
  const pushedAt = new Date(repo.pushed_at).getTime();
  const daysSincePush = (now - pushedAt) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 100 - daysSincePush * 2);

  return (
    repo.stargazers_count * 5 +
    repo.forks_count * 3 +
    repo.watchers_count * 2 +
    recencyScore +
    (repo.description ? 10 : 0) +
    (repo.topics?.length || 0) * 2 +
    (repo.homepage ? 5 : 0)
  );
}

export function getFeaturedRepos(
  repos: GitHubRepository[],
  count = 6
): GitHubRepository[] {
  return repos
    .filter((r) => !r.archived && !r.fork)
    .sort((a, b) => scoreRepository(b) - scoreRepository(a))
    .slice(0, count);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeTime(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function truncateMessage(msg: string, len = 80): string {
  const firstLine = msg.split('\n')[0];
  if (firstLine.length <= len) return firstLine;
  return firstLine.slice(0, len) + '…';
}

// ─── Organization ─────────────────────────────────────────────────────────

export async function fetchOrganization(): Promise<GitHubOrg | GitHubUser> {
  try {
    return await githubFetch<GitHubOrg>(`/orgs/${GITHUB_USERNAME}`);
  } catch {
    // org not found — fall back to user profile
    return fetchUser();
  }
}

export async function fetchOrgMembers(): Promise<GitHubMember[]> {
  try {
    // Fetch all members — authenticated requests return private members too
    const members = await githubFetch<GitHubMember[]>(
      `/orgs/${GITHUB_USERNAME}/members?per_page=100&role=all`
    );

    if (!members || members.length === 0) {
      throw new Error('empty');
    }

    // Enrich each member's profile in parallel (cap at 30)
    const enriched = await Promise.allSettled(
      members.slice(0, 30).map(async (m) => {
        try {
          const profile = await githubFetch<GitHubUser>(`/users/${m.login}`);
          return {
            ...m,
            name: profile.name,
            bio: profile.bio,
            public_repos: profile.public_repos,
            followers: profile.followers,
            location: profile.location,
            blog: profile.blog,
            company: profile.company,
          } as GitHubMember;
        } catch {
          return m;
        }
      })
    );

    return enriched
      .filter((r): r is PromiseFulfilledResult<GitHubMember> => r.status === 'fulfilled')
      .map((r) => r.value);
  } catch {
    // Fall back: return the owner as sole member
    const user = await fetchUser();
    return [
      {
        login: user.login,
        id: user.id,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
        type: 'User',
        name: user.name,
        bio: user.bio,
        public_repos: user.public_repos,
        followers: user.followers,
        location: user.location,
        blog: user.blog,
        company: user.company,
      },
    ];
  }
}

// ─── Events ───────────────────────────────────────────────────────────────

export async function fetchPublicEvents(perPage = 60): Promise<GitHubEvent[]> {
  // Try both org and user event endpoints; works for both account types.
  // GitHub orgs use /orgs/{login}/events; personal accounts use /users/{login}/events/public.
  const [orgPage1, userPage1] = await Promise.allSettled([
    githubFetch<GitHubEvent[]>(`/orgs/${GITHUB_USERNAME}/events?per_page=30&page=1`),
    githubFetch<GitHubEvent[]>(`/users/${GITHUB_USERNAME}/events/public?per_page=30&page=1`),
  ]);

  const e1 = orgPage1.status === 'fulfilled' ? orgPage1.value : [];
  const e2 = userPage1.status === 'fulfilled' ? userPage1.value : [];

  // Merge + deduplicate by event id
  const seen = new Set<string>();
  const merged: GitHubEvent[] = [];
  for (const ev of [...e1, ...e2]) {
    if (!seen.has(ev.id)) {
      seen.add(ev.id);
      merged.push(ev);
    }
  }

  // If we have fewer than half of perPage, fetch page 2 of whichever returned more
  if (merged.length < perPage / 2 && perPage > 30) {
    const usePrimary = e1.length >= e2.length ? 'org' : 'user';
    const page2 = await githubFetch<GitHubEvent[]>(
      usePrimary === 'org'
        ? `/orgs/${GITHUB_USERNAME}/events?per_page=30&page=2`
        : `/users/${GITHUB_USERNAME}/events/public?per_page=30&page=2`
    ).catch(() => [] as GitHubEvent[]);
    for (const ev of page2) {
      if (!seen.has(ev.id)) {
        seen.add(ev.id);
        merged.push(ev);
      }
    }
  }

  return merged
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, perPage);
}

export function normalizeEvent(event: GitHubEvent): NormalizedActivity {
  const repoName = event.repo.name.replace(`${GITHUB_USERNAME}/`, '');
  const repoUrl = `https://github.com/${event.repo.name}`;

  let icon = '◈';
  let title = event.type.replace('Event', '');
  let detail: string | null = null;
  let url: string | null = repoUrl;

  switch (event.type) {
    case 'PushEvent': {
      const commits = event.payload.commits ?? [];
      const count = event.payload.distinct_size ?? commits.length;
      icon = '↑';
      title = `pushed ${count} commit${count !== 1 ? 's' : ''}`;
      detail = commits[0]?.message ? truncateMessage(commits[0].message, 72) : null;
      url = commits[0]
        ? `https://github.com/${event.repo.name}/commit/${commits[0].sha}`
        : repoUrl;
      break;
    }
    case 'PullRequestEvent': {
      const pr = event.payload.pull_request;
      const action = event.payload.action;
      icon = action === 'closed' && pr?.merged ? '⟳' : action === 'closed' ? '✕' : '⤷';
      const label = action === 'closed' && pr?.merged ? 'merged' : action ?? 'updated';
      title = `${label} PR #${pr?.number ?? ''}`;
      detail = pr?.title ? truncateMessage(pr.title, 72) : null;
      url = pr?.html_url ?? repoUrl;
      break;
    }
    case 'IssuesEvent': {
      const issue = event.payload.issue;
      icon = event.payload.action === 'opened' ? '◎' : '●';
      title = `${event.payload.action ?? 'updated'} issue #${issue?.number ?? ''}`;
      detail = issue?.title ? truncateMessage(issue.title, 72) : null;
      url = issue?.html_url ?? repoUrl;
      break;
    }
    case 'CreateEvent': {
      const refType = event.payload.ref_type ?? 'repository';
      const ref = event.payload.ref;
      icon = '✦';
      title = ref ? `created ${refType} ${ref}` : `created ${refType}`;
      url = ref && refType === 'branch'
        ? `https://github.com/${event.repo.name}/tree/${ref}`
        : repoUrl;
      break;
    }
    case 'ForkEvent': {
      icon = '⑂';
      title = 'forked';
      detail = event.payload.forkee?.full_name ?? null;
      url = event.payload.forkee?.html_url ?? repoUrl;
      break;
    }
    case 'WatchEvent': {
      icon = '★';
      title = 'starred';
      url = repoUrl;
      break;
    }
    case 'ReleaseEvent': {
      const release = event.payload.release;
      icon = '◈';
      title = `released ${release?.tag_name ?? ''}`;
      detail = release?.name ? truncateMessage(release.name, 72) : null;
      url = release?.html_url ?? repoUrl;
      break;
    }
    case 'IssueCommentEvent': {
      icon = '◇';
      title = 'commented on issue';
      detail = event.payload.comment?.body
        ? truncateMessage(event.payload.comment.body, 72)
        : null;
      url = event.payload.comment?.html_url ?? repoUrl;
      break;
    }
    case 'DeleteEvent': {
      icon = '✕';
      title = `deleted ${event.payload.ref_type ?? 'branch'} ${event.payload.ref ?? ''}`;
      url = repoUrl;
      break;
    }
    default: {
      icon = '◈';
      title = event.type.replace('Event', '').toLowerCase();
      url = repoUrl;
    }
  }

  return {
    id: event.id,
    type: event.type,
    icon,
    title,
    detail,
    url,
    repo: repoName,
    repoUrl,
    actor: event.actor.login,
    actorAvatar: event.actor.avatar_url,
    date: event.created_at,
  };
}
