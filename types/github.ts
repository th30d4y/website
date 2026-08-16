export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  clone_url: string;
  ssh_url: string;
  git_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  size: number;
  language: string | null;
  topics: string[];
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  archived: boolean;
  disabled: boolean;
  visibility: string;
  license: GitHubLicense | null;
  owner: GitHubOwner;
  fork: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_issues: boolean;
}

export interface GitHubOwner {
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
}

export interface GitHubLicense {
  key: string;
  name: string;
  spdx_id: string;
  url: string | null;
}

export interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    comment_count: number;
    tree: {
      sha: string;
      url: string;
    };
  };
  author: GitHubOwner | null;
  committer: GitHubOwner | null;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: GitHubCommitFile[];
}

export interface GitHubCommitFile {
  filename: string;
  additions: number;
  deletions: number;
  changes: number;
  status: string;
}

export interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

export interface GitHubLanguages {
  [language: string]: number;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  body: string | null;
  labels: GitHubLabel[];
  user: GitHubOwner | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  pull_request?: {
    url: string;
    html_url: string;
  };
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  user: GitHubOwner | null;
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  html_url: string;
  draft: boolean;
  labels: GitHubLabel[];
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export interface AggregatedActivity {
  repo: string;
  repoUrl: string;
  commits: Array<{
    sha: string;
    message: string;
    author: string;
    authorAvatar: string | null;
    date: string;
    url: string;
  }>;
}

export interface LanguageStat {
  language: string;
  bytes: number;
  percentage: number;
  color: string;
}

export interface RepoScore {
  repo: GitHubRepository;
  score: number;
}

export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface APIError {
  error: string;
  status?: number;
  rateLimited?: boolean;
}

export interface GitHubOrg {
  login: string;
  id: number;
  name: string | null;
  description: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  public_members_url: string;
  members_url: string;
  blog: string | null;
  location: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  type: 'Organization';
  followers: number;
}

export interface GitHubMember {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
  // enriched from full profile fetch
  name?: string | null;
  bio?: string | null;
  public_repos?: number;
  followers?: number;
  location?: string | null;
  blog?: string | null;
  company?: string | null;
}

export type GitHubEventType =
  | 'PushEvent'
  | 'PullRequestEvent'
  | 'IssuesEvent'
  | 'CreateEvent'
  | 'ForkEvent'
  | 'WatchEvent'
  | 'DeleteEvent'
  | 'ReleaseEvent'
  | 'IssueCommentEvent'
  | 'PullRequestReviewEvent';

export interface GitHubEventActor {
  id: number;
  login: string;
  display_login?: string;
  avatar_url: string;
  url: string;
}

export interface GitHubEventRepo {
  id: number;
  name: string;
  url: string;
}

export interface GitHubEventPayload {
  // PushEvent
  commits?: Array<{
    sha: string;
    message: string;
    author: { email: string; name: string };
    url: string;
    distinct: boolean;
  }>;
  ref?: string;
  ref_type?: string;
  size?: number;
  distinct_size?: number;
  // PullRequestEvent / IssuesEvent
  action?: string;
  pull_request?: {
    number: number;
    title: string;
    html_url: string;
    state: string;
    merged?: boolean;
    draft?: boolean;
  };
  issue?: {
    number: number;
    title: string;
    html_url: string;
    state: string;
  };
  // ForkEvent
  forkee?: {
    full_name: string;
    html_url: string;
    description: string | null;
  };
  // ReleaseEvent
  release?: {
    tag_name: string;
    name: string | null;
    html_url: string;
    prerelease: boolean;
  };
  // IssueCommentEvent
  comment?: {
    html_url: string;
    body: string;
  };
}

export interface GitHubEvent {
  id: string;
  type: GitHubEventType | string;
  actor: GitHubEventActor;
  repo: GitHubEventRepo;
  payload: GitHubEventPayload;
  public: boolean;
  created_at: string;
}

export interface NormalizedActivity {
  id: string;
  type: GitHubEventType | string;
  icon: string;
  title: string;
  detail: string | null;
  url: string | null;
  repo: string;
  repoUrl: string;
  actor: string;
  actorAvatar: string;
  date: string;
}
