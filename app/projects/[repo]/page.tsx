'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type {
  GitHubRepository,
  GitHubCommit,
  GitHubContributor,
  GitHubIssue,
  GitHubPullRequest,
  GitHubTreeItem,
} from '@/types/github';
import { formatDate, formatRelativeTime, getLanguageColor, GITHUB_USERNAME, formatBytes } from '@/lib/github';
import MarkdownRenderer from '@/components/MarkdownRenderer';

type Tab = 'overview' | 'commits' | 'issues' | 'pulls' | 'contributors' | 'files';

export default function RepoPage() {
  const params = useParams();
  const repoName = params.repo as string;

  const [repo, setRepo] = useState<GitHubRepository | null>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [contributors, setContributors] = useState<GitHubContributor[]>([]);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [pulls, setPulls] = useState<GitHubPullRequest[]>([]);
  const [tree, setTree] = useState<GitHubTreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [error, setError] = useState<string | null>(null);

  const fetchRepo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/github/repos`);
      const json = await res.json();
      const found = (json.data?.repos || []).find(
        (r: GitHubRepository) => r.name === repoName
      );
      if (!found) throw new Error('Repository not found');
      setRepo(found);
    } catch {
      setError('Repository not found or unavailable.');
    } finally {
      setLoading(false);
    }
  }, [repoName]);

  const fetchAll = useCallback(async () => {
    await Promise.allSettled([
      fetch(`/api/github/readme/${repoName}`)
        .then((r) => r.json())
        .then((j) => setReadme(j.data)),
      fetch(`/api/github/commits?repo=${repoName}&per_page=20`)
        .then((r) => r.json())
        .then((j) => setCommits(j.data || [])),
      fetch(`/api/github/contributors/${repoName}`)
        .then((r) => r.json())
        .then((j) => setContributors(j.data || [])),
      fetch(`/api/github/issues/${repoName}`)
        .then((r) => r.json())
        .then((j) => setIssues(j.data || [])),
      fetch(`/api/github/pulls/${repoName}`)
        .then((r) => r.json())
        .then((j) => setPulls(j.data || [])),
      fetch(`/api/github/tree/${repoName}`)
        .then((r) => r.json())
        .then((j) => setTree(j.data?.tree || [])),
    ]);
  }, [repoName]);

  useEffect(() => {
    fetchRepo();
    fetchAll();
  }, [fetchRepo, fetchAll]);

  if (loading) {
    return (
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-[#00e87a] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-mono text-sm text-[#4b5563]">Loading repository…</p>
        </div>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6b7280] mb-4">{error || 'Repository not found.'}</p>
          <Link href="/projects" className="font-mono text-xs text-[#00e87a] hover:underline">
            ← Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const langColor = repo.language ? getLanguageColor(repo.language) : '#8b949e';
  const cloneUrl = `git clone https://github.com/${GITHUB_USERNAME}/${repo.name}.git`;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'commits', label: 'Commits', count: commits.length },
    { key: 'issues', label: 'Issues', count: issues.length },
    { key: 'pulls', label: 'Pull Requests', count: pulls.length },
    { key: 'contributors', label: 'Contributors', count: contributors.length },
    { key: 'files', label: 'Files', count: tree.filter((t) => t.type === 'blob').length },
  ];

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-xs text-[#4b5563] mb-6">
          <Link href="/projects" className="hover:text-white transition-colors">
            projects
          </Link>
          <span>/</span>
          <span className="text-[#9ca3af]">{repo.name}</span>
        </div>

        {/* Repo header */}
        <div className="border border-[#1e1e1e] bg-[#0f0f0f] rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="font-mono text-xl font-bold text-white">{repo.name}</h1>
                <span
                  className={`font-mono text-xs px-2 py-0.5 rounded border ${
                    repo.archived
                      ? 'border-[#2a2a2a] text-[#4b5563]'
                      : 'border-[#00e87a]/30 text-[#00e87a]'
                  }`}
                >
                  {repo.archived ? '○ ARCHIVED' : '● ACTIVE'}
                </span>
                {repo.visibility !== 'public' && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded border border-[#2a2a2a] text-[#4b5563]">
                    {repo.visibility}
                  </span>
                )}
              </div>

              {repo.description && (
                <p className="text-[#9ca3af] text-sm mb-4 leading-relaxed">
                  {repo.description}
                </p>
              )}

              {/* Topics */}
              {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {repo.topics.map((topic) => (
                    <span
                      key={topic}
                      className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#141414] border border-[#1e1e1e] text-[#6b7280]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-[#6b7280]">
                {repo.language && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor }} />
                    {repo.language}
                  </span>
                )}
                <span>★ {repo.stargazers_count.toLocaleString()}</span>
                <span>⑂ {repo.forks_count.toLocaleString()}</span>
                <span>◉ {repo.open_issues_count.toLocaleString()} issues</span>
                {repo.license && <span>{repo.license.name}</span>}
                <span>{formatBytes(repo.size * 1024)}</span>
                <span>Updated {formatRelativeTime(repo.pushed_at)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-[#141414]">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00e87a] text-black text-xs font-semibold rounded hover:bg-[#00d470] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub ↗
            </a>
            {repo.open_issues_count > 0 && (
              <a
                href={`${repo.html_url}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#1e1e1e] text-[#9ca3af] text-xs font-mono rounded hover:border-[#2a2a2a] hover:text-white transition-colors"
              >
                Issues ({repo.open_issues_count})
              </a>
            )}
            <a
              href={`${repo.html_url}/pulls`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#1e1e1e] text-[#9ca3af] text-xs font-mono rounded hover:border-[#2a2a2a] hover:text-white transition-colors"
            >
              Pull Requests
            </a>
            {repo.homepage && (
              <a
                href={repo.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#1e1e1e] text-[#9ca3af] text-xs font-mono rounded hover:border-[#2a2a2a] hover:text-white transition-colors"
              >
                Homepage ↗
              </a>
            )}
          </div>

          {/* Clone command */}
          <div className="mt-4">
            <p className="font-mono text-xs text-[#4b5563] mb-2">Clone</p>
            <div className="flex items-center gap-2 bg-[#080808] border border-[#1e1e1e] rounded px-3 py-2">
              <code className="font-mono text-xs text-[#9ca3af] flex-1 overflow-x-auto">
                {cloneUrl}
              </code>
              <button
                onClick={() => navigator.clipboard?.writeText(cloneUrl)}
                className="text-[#4b5563] hover:text-white transition-colors flex-shrink-0"
                aria-label="Copy clone URL"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#1e1e1e] mb-6 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-3 font-mono text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
                  tab === key
                    ? 'border-[#00e87a] text-white'
                    : 'border-transparent text-[#6b7280] hover:text-white'
                }`}
                aria-selected={tab === key}
                role="tab"
              >
                {label}
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      tab === key ? 'bg-[#00e87a]/20 text-[#00e87a]' : 'bg-[#141414] text-[#4b5563]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div role="tabpanel">
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Repo stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Stars', value: repo.stargazers_count },
                  { label: 'Forks', value: repo.forks_count },
                  { label: 'Watchers', value: repo.watchers_count },
                  { label: 'Open Issues', value: repo.open_issues_count },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 border border-[#1e1e1e] bg-[#0f0f0f] rounded-lg">
                    <div className="font-mono text-2xl font-bold text-white">{value}</div>
                    <div className="font-mono text-xs text-[#4b5563] uppercase tracking-wider mt-1">{label}</div>
                  </div>
                ))}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Created', value: formatDate(repo.created_at) },
                  { label: 'Last Updated', value: formatDate(repo.updated_at) },
                  { label: 'Last Push', value: formatDate(repo.pushed_at) },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 border border-[#1e1e1e] bg-[#0f0f0f] rounded-lg">
                    <div className="font-mono text-xs text-[#4b5563] uppercase tracking-wider mb-1">{label}</div>
                    <div className="font-mono text-sm text-white">{value}</div>
                  </div>
                ))}
              </div>

              {/* README */}
              {readme ? (
                <div className="border border-[#1e1e1e] bg-[#0f0f0f] rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#141414]">
                    <svg className="w-4 h-4 text-[#4b5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-mono text-xs text-[#6b7280]">README.md</span>
                  </div>
                  <MarkdownRenderer content={readme} />
                </div>
              ) : (
                <div className="border border-[#1e1e1e] bg-[#0f0f0f] rounded-lg p-6 text-center">
                  <p className="font-mono text-sm text-[#4b5563]">No README available.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'commits' && (
            <div className="space-y-2">
              {commits.length === 0 ? (
                <p className="font-mono text-sm text-[#4b5563] text-center py-8">No commits found.</p>
              ) : (
                commits.map((commit) => (
                  <div
                    key={commit.sha}
                    className="flex items-start gap-4 p-4 border border-[#141414] bg-[#0a0a0a] rounded-lg hover:border-[#1e1e1e] transition-colors group"
                  >
                    {commit.author?.avatar_url && (
                      <Image
                        src={commit.author.avatar_url}
                        alt={commit.commit.author.name}
                        width={32}
                        height={32}
                        className="rounded-full flex-shrink-0 mt-0.5"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium leading-snug mb-1 line-clamp-2">
                        {commit.commit.message.split('\n')[0]}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#4b5563]">
                        <span>{commit.commit.author.name}</span>
                        <span>{formatRelativeTime(commit.commit.author.date)}</span>
                      </div>
                    </div>
                    <a
                      href={commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-[#00e87a] hover:underline flex-shrink-0"
                      aria-label={`View commit ${commit.sha.slice(0, 7)}`}
                    >
                      {commit.sha.slice(0, 7)}
                    </a>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'issues' && (
            <div className="space-y-2">
              {issues.length === 0 ? (
                <p className="font-mono text-sm text-[#4b5563] text-center py-8">No open issues.</p>
              ) : (
                issues.map((issue) => (
                  <a
                    key={issue.id}
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 border border-[#141414] bg-[#0a0a0a] rounded-lg hover:border-[#1e1e1e] transition-colors"
                  >
                    <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 ${issue.state === 'open' ? 'border-[#00e87a]' : 'border-[#6b7280]'}`} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium mb-1">{issue.title}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#4b5563]">
                        <span>#{issue.number}</span>
                        {issue.user && <span>by {issue.user.login}</span>}
                        <span>{formatRelativeTime(issue.created_at)}</span>
                        {issue.labels.map((l) => (
                          <span
                            key={l.id}
                            className="px-1.5 py-0.5 rounded-full text-xs"
                            style={{ backgroundColor: `#${l.color}20`, color: `#${l.color}` }}
                          >
                            {l.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}

          {tab === 'pulls' && (
            <div className="space-y-2">
              {pulls.length === 0 ? (
                <p className="font-mono text-sm text-[#4b5563] text-center py-8">No open pull requests.</p>
              ) : (
                pulls.map((pr) => (
                  <a
                    key={pr.id}
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 border border-[#141414] bg-[#0a0a0a] rounded-lg hover:border-[#1e1e1e] transition-colors"
                  >
                    <div className={`mt-0.5 flex-shrink-0 ${pr.state === 'open' ? 'text-[#00e87a]' : 'text-[#6b7280]'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium mb-1">{pr.title}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#4b5563]">
                        <span>#{pr.number}</span>
                        {pr.user && <span>by {pr.user.login}</span>}
                        <span>{formatRelativeTime(pr.created_at)}</span>
                        {pr.draft && <span className="text-[#fbbf24]">Draft</span>}
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}

          {tab === 'contributors' && (
            <div className="space-y-2">
              {contributors.length === 0 ? (
                <p className="font-mono text-sm text-[#4b5563] text-center py-8">No contributor data available.</p>
              ) : (
                contributors.map((c, i) => (
                  <a
                    key={c.login}
                    href={c.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 border border-[#141414] bg-[#0a0a0a] rounded-lg hover:border-[#1e1e1e] transition-colors"
                  >
                    <span className="font-mono text-xs text-[#4b5563] w-6 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    <Image
                      src={c.avatar_url}
                      alt={c.login}
                      width={32}
                      height={32}
                      className="rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-white">{c.login}</p>
                      <p className="font-mono text-xs text-[#4b5563]">{c.type}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono text-sm text-white font-semibold">{c.contributions}</p>
                      <p className="font-mono text-xs text-[#4b5563]">commits</p>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}

          {tab === 'files' && (
            <div className="border border-[#1e1e1e] bg-[#0f0f0f] rounded-lg overflow-hidden">
              {tree.length === 0 ? (
                <p className="font-mono text-sm text-[#4b5563] text-center py-8">No file tree available.</p>
              ) : (
                <div className="divide-y divide-[#141414]">
                  {tree
                    .sort((a, b) => {
                      if (a.type === b.type) return a.path.localeCompare(b.path);
                      return a.type === 'tree' ? -1 : 1;
                    })
                    .map((item) => (
                      <div
                        key={item.sha}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-[#141414] transition-colors"
                      >
                        <span aria-hidden="true" className="text-[#4b5563] flex-shrink-0">
                          {item.type === 'tree' ? '📁' : '📄'}
                        </span>
                        <a
                          href={`${repo.html_url}/blob/${repo.default_branch}/${item.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm text-[#9ca3af] hover:text-white transition-colors flex-1 truncate"
                        >
                          {item.path}
                        </a>
                        {item.size !== undefined && item.type === 'blob' && (
                          <span className="font-mono text-xs text-[#4b5563] flex-shrink-0">
                            {formatBytes(item.size)}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
