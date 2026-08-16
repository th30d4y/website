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
import {
  formatDate,
  formatRelativeTime,
  getLanguageColor,
  GITHUB_USERNAME,
  formatBytes,
} from '@/lib/github';
import MarkdownRenderer from '@/components/MarkdownRenderer';

type Tab = 'overview' | 'commits' | 'issues' | 'pulls' | 'contributors' | 'files';
// Only two states: loading (skeleton shown) or the actual data
type AsyncState<T> = 'loading' | T;

interface FileContent {
  name: string;
  path: string;
  content: string;
  binary: boolean;
  size: number;
  sha: string;
  html_url: string;
}

interface CommitDetail extends Omit<GitHubCommit, 'stats' | 'files'> {
  stats?: { additions: number; deletions: number; total: number };
  files?: Array<{ filename: string; additions: number; deletions: number; status: string }>;
}

/* ─── GH icon path ────────────────────────────────────────────────────────── */
const GH = 'M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z';

/* ─── Skeleton rows ───────────────────────────────────────────────────────── */
function Skeleton({ rows = 5, type = 'list' }: { rows?: number; type?: 'list' | 'card' }) {
  if (type === 'card') return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ padding: '16px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div className="skeleton" style={{ height: 24, width: '50%', borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 10, width: '70%', borderRadius: 3 }} />
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 3, marginBottom: 7 }} />
            <div className="skeleton" style={{ height: 10, width: '35%', borderRadius: 3 }} />
          </div>
          <div className="skeleton" style={{ height: 10, width: 48, borderRadius: 3 }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Empty / retry state ─────────────────────────────────────────────────── */
function Empty({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-4)', marginBottom: onRetry ? 20 : 0 }}>
        {text || 'Loading…'}
      </p>
      {onRetry && (
        <button onClick={onRetry} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', background: 'none', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius)', padding: '7px 16px', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,232,122,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
          ↻ Retry
        </button>
      )}
    </div>
  );
}

/* ─── Inline file viewer ──────────────────────────────────────────────────── */
function FileViewer({ repoName, item, onClose }: { repoName: string; item: GitHubTreeItem; onClose: () => void }) {
  const [state, setState] = useState<AsyncState<FileContent>>('loading');

  useEffect(() => {
    setState('loading');
    fetch(`/api/github/file/${repoName}?path=${encodeURIComponent(item.path)}`)
      .then(r => r.json())
      .then(j => {
        if (j.rateLimited || j.error) return; // stay loading silently
        setState(j.data as FileContent);
      })
      .catch(() => { /* stay loading */ });
  }, [repoName, item.path]);

  const ext = item.path.split('.').pop()?.toLowerCase() ?? '';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext);

  return (
    <div style={{ marginTop: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
      {/* Viewer header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          📄 {item.path}
        </span>
        {item.size !== undefined && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-4)', flexShrink: 0 }}>
            {formatBytes(item.size)}
          </span>
        )}
        <button onClick={onClose} aria-label="Close file viewer"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', fontFamily: 'var(--font-mono)', fontSize: '1rem', lineHeight: 1, padding: '0 4px', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-4)')}>
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', maxHeight: 560, overflow: 'auto' }}>
        {state === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 13, width: `${50 + (i % 4) * 12}%`, borderRadius: 3 }} />
            ))}
          </div>
        )}
        {typeof state === 'object' && state !== null && (
          state.binary ? (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-4)', textAlign: 'center', padding: '32px 0' }}>
              Binary file — cannot display content
            </p>
          ) : isImage ? (
            <div style={{ textAlign: 'center' }}>
              <img src={`https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repoName}/HEAD/${item.path}`} alt={item.path} style={{ maxWidth: '100%', borderRadius: 'var(--radius)' }} />
            </div>
          ) : (
            <pre style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', lineHeight: 1.65,
              color: 'var(--text-2)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              tabSize: 2,
            }}>
              <code>{state.content}</code>
            </pre>
          )
        )}
      </div>
    </div>
  );
}

/* ─── Inline commit detail ────────────────────────────────────────────────── */
function CommitDetail({ repoName, sha, onClose }: { repoName: string; sha: string; onClose: () => void }) {
  const [state, setState] = useState<AsyncState<CommitDetail>>('loading');

  useEffect(() => {
    setState('loading');
    fetch(`/api/github/commit/${repoName}/${sha}`)
      .then(r => r.json())
      .then(j => {
        if (j.rateLimited || j.error) return; // stay loading silently
        setState(j.data as CommitDetail);
      })
      .catch(() => { /* stay loading */ });
  }, [repoName, sha]);

  return (
    <div style={{ marginTop: 8, background: 'var(--bg)', border: '1px solid var(--accent-dim, var(--border))', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent)' }}>{sha.slice(0, 7)}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', padding: '0 4px' }}>✕</button>
      </div>
      <div style={{ padding: 16 }}>
        {state === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ height: 14, width: '80%', borderRadius: 3 }} />
            <div className="skeleton" style={{ height: 11, width: '40%', borderRadius: 3 }} />
          </div>
        )}
        {typeof state === 'object' && state !== null && (
          <>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text)', fontWeight: 500, lineHeight: 1.5, marginBottom: 10 }}>
              {state.commit.message}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-4)', marginBottom: state.stats ? 16 : 0 }}>
              <span>Author: <span style={{ color: 'var(--text-3)' }}>{state.commit.author.name}</span></span>
              <span><time dateTime={state.commit.author.date}>{new Date(state.commit.author.date).toLocaleString()}</time></span>
            </div>
            {state.stats && (
              <div style={{ display: 'flex', gap: 12, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginBottom: state.files?.length ? 16 : 0 }}>
                <span style={{ color: '#4ade80' }}>+{state.stats.additions}</span>
                <span style={{ color: '#f87171' }}>−{state.stats.deletions}</span>
                <span style={{ color: 'var(--text-4)' }}>{state.stats.total} changes</span>
              </div>
            )}
            {state.files && state.files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {state.files.slice(0, 15).map(f => (
                  <div key={f.filename} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.status === 'added' ? '#4ade80' : f.status === 'removed' ? '#f87171' : '#60a5fa', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.filename}</span>
                    <span style={{ color: '#4ade80', flexShrink: 0 }}>+{f.additions}</span>
                    <span style={{ color: '#f87171', flexShrink: 0 }}>−{f.deletions}</span>
                  </div>
                ))}
                {state.files.length > 15 && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-4)', textAlign: 'center', padding: '6px 0' }}>+{state.files.length - 15} more files</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function RepoPage() {
  const params = useParams();
  const repoName = params.repo as string;

  const [repo, setRepo] = useState<GitHubRepository | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [copied, setCopied] = useState(false);

  // Tab data
  const [readme, setReadme] = useState<AsyncState<string | null>>('loading');
  const [commits, setCommits] = useState<AsyncState<GitHubCommit[]>>('loading');
  const [issues, setIssues] = useState<AsyncState<GitHubIssue[]>>('loading');
  const [pulls, setPulls] = useState<AsyncState<GitHubPullRequest[]>>('loading');
  const [contributors, setContributors] = useState<AsyncState<GitHubContributor[]>>('loading');
  const [treeItems, setTreeItems] = useState<AsyncState<GitHubTreeItem[]>>('loading');

  // Inline viewers
  const [selectedFile, setSelectedFile] = useState<GitHubTreeItem | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);

  /* ── Fetch helpers ────────────────────────────────────────────────────── */
  const fetchReadme = useCallback(async (force = false) => {
    setReadme('loading');
    try {
      const url = `/api/github/readme/${repoName}${force ? '?refresh=1' : ''}`;
      const j = await fetch(url).then(r => r.json());
      if (j.rateLimited || j.error) return; // stay 'loading', auto-retry later
      setReadme(j.data ?? null);
    } catch { /* stay loading */ }
  }, [repoName]);

  const fetchCommits = useCallback(async (force = false) => {
    setCommits('loading');
    try {
      const url = `/api/github/commits?repo=${repoName}&per_page=30${force ? '&refresh=1' : ''}`;
      const j = await fetch(url).then(r => r.json());
      if (j.rateLimited || j.error) return;
      setCommits(j.data || []);
    } catch { /* stay loading */ }
  }, [repoName]);

  const fetchIssues = useCallback(async (force = false) => {
    setIssues('loading');
    try {
      const url = `/api/github/issues/${repoName}?state=all${force ? '&refresh=1' : ''}`;
      const j = await fetch(url).then(r => r.json());
      if (j.rateLimited || j.error) return;
      setIssues(j.data || []);
    } catch { /* stay loading */ }
  }, [repoName]);

  const fetchPulls = useCallback(async (force = false) => {
    setPulls('loading');
    try {
      const url = `/api/github/pulls/${repoName}?state=all${force ? '&refresh=1' : ''}`;
      const j = await fetch(url).then(r => r.json());
      if (j.rateLimited || j.error) return;
      setPulls(j.data || []);
    } catch { /* stay loading */ }
  }, [repoName]);

  const fetchContributors = useCallback(async (force = false) => {
    setContributors('loading');
    try {
      const url = `/api/github/contributors/${repoName}${force ? '?refresh=1' : ''}`;
      const j = await fetch(url).then(r => r.json());
      if (j.rateLimited || j.error) return;
      setContributors(j.data || []);
    } catch { /* stay loading */ }
  }, [repoName]);

  const fetchTree = useCallback(async (defaultBranch?: string, force = false) => {
    setTreeItems('loading');
    try {
      const branch = defaultBranch ?? 'main';
      const url = `/api/github/tree/${repoName}?branch=${encodeURIComponent(branch)}${force ? '&refresh=1' : ''}`;
      const j = await fetch(url).then(r => r.json());
      if (j.rateLimited || j.error) return;
      setTreeItems(j.data?.tree || []);
    } catch { /* stay loading */ }
  }, [repoName]);

  /* ── Load repo, then fire all fetches ─────────────────────────────────── */
  useEffect(() => {
    (async () => {
      setPageLoading(true);
      try {
        const j = await fetch('/api/github/repos').then(r => r.json());
        const found = (j.data?.repos || []).find((r: GitHubRepository) => r.name === repoName);
        if (!found) throw new Error('not found');
        setRepo(found);
        fetchReadme();
        fetchCommits();
        fetchIssues();
        fetchPulls();
        fetchContributors();
        fetchTree(found.default_branch);
      } catch {
        setPageError('Repository not found or unavailable.');
      } finally {
        setPageLoading(false);
      }
    })();
  }, [repoName, fetchReadme, fetchCommits, fetchIssues, fetchPulls, fetchContributors, fetchTree]);

  /* ── Auto-refresh volatile data every 5 minutes ──────────────────────── */
  useEffect(() => {
    const id = setInterval(() => {
      fetchIssues(true);
      fetchCommits(true);
      fetchPulls(true);
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchIssues, fetchCommits, fetchPulls]);

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (pageLoading) return (
    <div style={{ minHeight: '100vh', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 28, height: 28, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-4)' }}>Loading repository…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (pageError || !repo) return (
    <div style={{ minHeight: '100vh', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <p style={{ color: 'var(--text-3)', marginBottom: 20 }}>{pageError || 'Repository not found.'}</p>
        <Link href="/projects" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>
          ← Back to projects
        </Link>
      </div>
    </div>
  );

  const langColor = repo.language ? getLanguageColor(repo.language) : 'var(--text-4)';
  const cloneUrl = `git clone https://github.com/${GITHUB_USERNAME}/${repo.name}.git`;

  const isArray = <T,>(v: AsyncState<T>): v is T => Array.isArray(v);

  const tabDefs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'commits', label: 'Commits', count: isArray(commits) ? (commits as GitHubCommit[]).length : undefined },
    { key: 'issues', label: 'Issues', count: isArray(issues) ? (issues as GitHubIssue[]).length : undefined },
    { key: 'pulls', label: 'Pull Requests', count: isArray(pulls) ? (pulls as GitHubPullRequest[]).length : undefined },
    { key: 'contributors', label: 'Contributors', count: isArray(contributors) ? (contributors as GitHubContributor[]).length : undefined },
    { key: 'files', label: 'Files', count: isArray(treeItems) ? (treeItems as GitHubTreeItem[]).filter(t => t.type === 'blob').length : undefined },
  ];

  const sortedTree = isArray(treeItems)
    ? [...(treeItems as GitHubTreeItem[])].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
        return a.path.localeCompare(b.path);
      })
    : [];

  return (
    <div style={{ minHeight: '100vh', paddingTop: 64 }}>
      <div className="section__container" style={{ paddingTop: 36, paddingBottom: 96 }}>

        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginBottom: 24 }}>
          <Link href="/projects" style={{ color: 'var(--text-3)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
            projects
          </Link>
          <span style={{ color: 'var(--text-4)' }}>/</span>
          <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{repo.name}</span>
        </nav>

        {/* ── Header card ────────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(20px,4vw,28px)', marginBottom: 24 }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(1rem,3vw,1.375rem)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                {repo.name}
              </h1>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 100, border: repo.archived ? '1px solid var(--border-hi)' : '1px solid rgba(0,232,122,0.25)', color: repo.archived ? 'var(--text-4)' : 'var(--accent)', background: repo.archived ? 'transparent' : 'rgba(0,232,122,0.06)', flexShrink: 0 }}>
                {repo.archived ? '○ Archived' : '● Active'}
              </span>
            </div>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="btn btn--primary" style={{ flexShrink: 0, height: 36, padding: '0 14px', fontSize: '0.8125rem' }}>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d={GH} /></svg>
              GitHub ↗
            </a>
          </div>

          {repo.description && <p style={{ fontSize: '0.9375rem', color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 14, maxWidth: 680 }}>{repo.description}</p>}

          {repo.topics?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
              {repo.topics.map(t => (
                <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', padding: '3px 9px', borderRadius: 100, background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text-3)', letterSpacing: '0.04em' }}>{t}</span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: 20 }}>
            {repo.language && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: langColor }} />{repo.language}</span>}
            {repo.stargazers_count > 0 && <span>★ {repo.stargazers_count.toLocaleString()}</span>}
            {repo.forks_count > 0 && <span>⑂ {repo.forks_count.toLocaleString()}</span>}
            {repo.open_issues_count > 0 && <span>◎ {repo.open_issues_count} issues</span>}
            {repo.license && <span>{repo.license.name}</span>}
            <span style={{ color: 'var(--text-4)' }}>{formatBytes(repo.size * 1024)}</span>
            <span style={{ color: 'var(--text-4)' }}>pushed {formatRelativeTime(repo.pushed_at)}</span>
          </div>

          {/* Clone */}
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-4)', marginBottom: 7 }}>Clone</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '9px 14px' }}>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cloneUrl}</code>
              <button onClick={() => { navigator.clipboard?.writeText(cloneUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--accent)' : 'var(--text-4)', flexShrink: 0, padding: 2, display: 'flex', transition: 'color 0.15s' }} aria-label="Copy clone URL">
                {copied
                  ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────── */}
        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto' }}>
          <div style={{ display: 'flex', minWidth: 'max-content' }} role="tablist">
            {tabDefs.map(({ key, label, count }) => {
              const active = tab === key;
              return (
                <button key={key} onClick={() => { setTab(key); setSelectedFile(null); setSelectedCommit(null); }}
                  role="tab" aria-selected={active}
                  style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: active ? 600 : 400, color: active ? 'var(--text)' : 'var(--text-3)', background: 'none', border: 'none', borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`, cursor: 'pointer', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', marginBottom: -1 }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)'; }}>
                  {label}
                  {count !== undefined && count > 0 && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', padding: '2px 6px', borderRadius: 100, fontWeight: 600, background: active ? 'rgba(0,232,122,0.14)' : 'var(--bg-raised)', color: active ? 'var(--accent)' : 'var(--text-4)' }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── OVERVIEW ────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="repo-g4">
              {[['Stars', repo.stargazers_count], ['Forks', repo.forks_count], ['Watchers', repo.watchers_count], ['Open Issues', repo.open_issues_count]].map(([l, v]) => (
                <div key={l as string} style={{ padding: '16px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 6 }}>{(v as number).toLocaleString()}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-4)', fontWeight: 500 }}>{l as string}</p>
                </div>
              ))}
            </div>
            <div className="repo-g3">
              {[['Created', formatDate(repo.created_at)], ['Updated', formatDate(repo.updated_at)], ['Last Push', formatDate(repo.pushed_at)]].map(([l, v]) => (
                <div key={l as string} style={{ padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-4)', marginBottom: 7 }}>{l as string}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500 }}>{v as string}</p>
                </div>
              ))}
            </div>

            {/* README */}
            {readme === 'loading' && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(20px,4vw,28px)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                  <div className="skeleton" style={{ width: 14, height: 14, borderRadius: 3 }} />
                  <div className="skeleton" style={{ width: 80, height: 11, borderRadius: 3 }} />
                </div>
                {[1, 2, 3, 5].map(w => <div key={w} className="skeleton" style={{ height: 13, width: `${w * 18 + 10}%`, borderRadius: 3, marginBottom: 10 }} />)}
              </div>
            )}
            {(readme === null || typeof readme === 'string') && readme !== 'loading' && (
              typeof readme === 'string' ? (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(20px,4vw,28px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-4)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)' }}>README.md</span>
                  </div>
                  <MarkdownRenderer content={readme} />
                </div>
              ) : (
                <Empty text="No README found for this repository." />
              )
            )}
          </div>
        )}

        {/* ── COMMITS ─────────────────────────────────────────────── */}
        {tab === 'commits' && (
          commits === 'loading' ? <Skeleton rows={6} />
          : !(commits as GitHubCommit[]).length ? <Empty text="No commits found." />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(commits as GitHubCommit[]).map(c => (
                <div key={c.sha}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', background: 'var(--bg-surface)', border: `1px solid ${selectedCommit === c.sha ? 'var(--accent)' : 'var(--border)'}`, borderRadius: selectedCommit === c.sha ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)', transition: 'border-color 0.15s, background 0.15s', cursor: 'pointer' }}
                    onClick={() => setSelectedCommit(selectedCommit === c.sha ? null : c.sha)}
                    onMouseEnter={e => { if (selectedCommit !== c.sha) { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hi)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-raised)'; }}}
                    onMouseLeave={e => { if (selectedCommit !== c.sha) { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)'; }}}>
                    {c.author?.avatar_url && (
                      <Image src={c.author.avatar_url} alt={c.commit.author.name} width={30} height={30} style={{ borderRadius: '50%', flexShrink: 0, marginTop: 1, border: '1px solid var(--border)' }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500, lineHeight: 1.45, marginBottom: 5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.commit.message.split('\n')[0]}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-4)' }}>
                        <span>{c.commit.author.name}</span>
                        <span>·</span>
                        <time dateTime={c.commit.author.date}>{formatRelativeTime(c.commit.author.date)}</time>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: selectedCommit === c.sha ? 'var(--accent)' : 'var(--text-4)', background: 'var(--bg-raised)', padding: '2px 6px', borderRadius: 4 }}>
                        {c.sha.slice(0, 7)}
                      </code>
                      <span style={{ color: 'var(--text-4)', fontSize: '0.75rem' }}>{selectedCommit === c.sha ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {selectedCommit === c.sha && (
                    <CommitDetail repoName={repoName} sha={c.sha} onClose={() => setSelectedCommit(null)} />
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* ── ISSUES ──────────────────────────────────────────────── */}
        {tab === 'issues' && (
          issues === 'loading' ? <Skeleton rows={4} />
          : !(issues as GitHubIssue[]).length ? <Empty text="No issues found." />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* State summary */}
              <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginBottom: 8 }}>
                <span style={{ color: 'var(--accent)' }}>◎ {(issues as GitHubIssue[]).filter(i => i.state === 'open').length} open</span>
                <span style={{ color: 'var(--text-4)' }}>● {(issues as GitHubIssue[]).filter(i => i.state === 'closed').length} closed</span>
              </div>
              {(issues as GitHubIssue[]).map(issue => (
                <div key={issue.id} style={{ padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', transition: 'border-color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hi)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-raised)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)'; }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${issue.state === 'open' ? 'var(--accent)' : 'var(--text-4)'}`, flexShrink: 0, marginTop: 3 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.9375rem', color: 'var(--text)', fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{issue.title}</p>
                      {issue.body && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', lineHeight: 1.55, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {issue.body.replace(/\r\n|\n/g, ' ')}
                        </p>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-4)' }}>
                        <span>#{issue.number}</span>
                        {issue.user && <span>by {issue.user.login}</span>}
                        <time dateTime={issue.created_at}>{formatRelativeTime(issue.created_at)}</time>
                        {issue.labels.map(l => (
                          <span key={l.id} style={{ padding: '1px 7px', borderRadius: 100, fontSize: '0.5625rem', background: `#${l.color}18`, color: `#${l.color}`, border: `1px solid #${l.color}40` }}>{l.name}</span>
                        ))}
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.1em', padding: '2px 7px', borderRadius: 100, background: issue.state === 'open' ? 'rgba(0,232,122,0.08)' : 'var(--bg-raised)', color: issue.state === 'open' ? 'var(--accent)' : 'var(--text-4)', border: `1px solid ${issue.state === 'open' ? 'rgba(0,232,122,0.2)' : 'var(--border)'}`, flexShrink: 0, textTransform: 'uppercase' }}>
                      {issue.state}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── PULL REQUESTS ───────────────────────────────────────── */}
        {tab === 'pulls' && (
          pulls === 'loading' ? <Skeleton rows={3} />
          : !(pulls as GitHubPullRequest[]).length ? <Empty text="No pull requests found." />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginBottom: 8 }}>
                <span style={{ color: 'var(--accent)' }}>⤷ {(pulls as GitHubPullRequest[]).filter(p => p.state === 'open').length} open</span>
                <span style={{ color: 'var(--text-4)' }}>✓ {(pulls as GitHubPullRequest[]).filter(p => p.merged_at).length} merged</span>
                <span style={{ color: 'var(--text-4)' }}>✕ {(pulls as GitHubPullRequest[]).filter(p => p.state === 'closed' && !p.merged_at).length} closed</span>
              </div>
              {(pulls as GitHubPullRequest[]).map(pr => (
                <div key={pr.id} style={{ padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', transition: 'border-color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hi)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-raised)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)'; }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <svg width="14" height="14" fill="none" stroke={pr.state === 'open' ? 'var(--accent)' : pr.merged_at ? '#a78bfa' : 'var(--text-4)'} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 3 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500, marginBottom: 5 }}>{pr.title}</p>
                      {pr.body && pr.body.trim() && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--border-hi)' }}>
                          {pr.body.replace(/\r\n|\n/g, ' ').replace(/#+\s/g, '').trim()}
                        </p>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-4)' }}>
                        <span>#{pr.number}</span>
                        {pr.user && <span>by {pr.user.login}</span>}
                        <time dateTime={pr.created_at}>{formatRelativeTime(pr.created_at)}</time>
                        {pr.draft && <span style={{ color: 'var(--yellow)' }}>Draft</span>}
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.1em', padding: '2px 7px', borderRadius: 100, background: pr.merged_at ? 'rgba(167,139,250,0.1)' : pr.state === 'open' ? 'rgba(0,232,122,0.08)' : 'var(--bg-raised)', color: pr.merged_at ? '#a78bfa' : pr.state === 'open' ? 'var(--accent)' : 'var(--text-4)', border: `1px solid ${pr.merged_at ? 'rgba(167,139,250,0.25)' : pr.state === 'open' ? 'rgba(0,232,122,0.2)' : 'var(--border)'}`, flexShrink: 0, textTransform: 'uppercase' }}>
                      {pr.merged_at ? 'merged' : pr.state}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── CONTRIBUTORS ────────────────────────────────────────── */}
        {tab === 'contributors' && (
          contributors === 'loading' ? <Skeleton rows={4} />
          : !(contributors as GitHubContributor[]).length ? <Empty text="No contributor data available." />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(contributors as GitHubContributor[]).map((c, i) => (
                <div key={c.login} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', transition: 'border-color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hi)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-raised)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)'; }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-4)', width: 22, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ padding: '1.5px', borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg,rgba(0,232,122,0.4),transparent)' : 'none', flexShrink: 0 }}>
                    <Image src={c.avatar_url} alt={c.login} width={36} height={36} style={{ borderRadius: '50%', display: 'block', border: '1px solid var(--border)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', color: 'var(--text)', fontWeight: 600, marginBottom: 3 }}>{c.login}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {i === 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--accent)', background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.2)', padding: '1px 6px', borderRadius: 100 }}>top contributor</span>}
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-4)', letterSpacing: '0.06em', textTransform: 'lowercase' }}>{c.type}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 3 }}>{c.contributions.toLocaleString()}</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>commits</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── FILES ───────────────────────────────────────────────── */}
        {tab === 'files' && (
          treeItems === 'loading' ? (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: i < 7 ? '1px solid var(--border)' : 'none' }}>
                  <div className="skeleton" style={{ width: 14, height: 14, borderRadius: 3 }} />
                  <div className="skeleton" style={{ height: 11, width: `${40 + (i % 4) * 12}%`, borderRadius: 3 }} />
                </div>
              ))}
            </div>
          ) : !sortedTree.length ? (
            <Empty text="No files found." />
          ) : (
            <>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                {/* Branch bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-4)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3v12m0 0a3 3 0 103 3m-3-3a3 3 0 003-3m-3 3h12m0 0a3 3 0 103 3m-3-3a3 3 0 00-3-3m3 3V3m0 0a3 3 0 103 3m-3-3a3 3 0 003 3" />
                  </svg>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-2)', fontWeight: 500 }}>{repo.default_branch}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-4)', marginLeft: 'auto' }}>
                    {sortedTree.filter(t => t.type === 'tree').length} dirs · {sortedTree.filter(t => t.type === 'blob').length} files
                  </span>
                </div>
                {/* File rows */}
                {sortedTree.map((item, idx) => (
                  <div key={item.sha} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 18px', borderBottom: idx < sortedTree.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s', cursor: item.type === 'blob' ? 'pointer' : 'default' }}
                    onClick={() => {
                      if (item.type === 'blob') {
                        setSelectedFile(selectedFile?.sha === item.sha ? null : item);
                      }
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-raised)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                    <span style={{ fontSize: '0.8125rem', flexShrink: 0, width: 18, textAlign: 'center' }}>{item.type === 'tree' ? '📁' : '📄'}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.8125rem',
                      color: selectedFile?.sha === item.sha ? 'var(--accent)' : item.type === 'tree' ? 'var(--text)' : 'var(--text-2)',
                      flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      fontWeight: item.type === 'tree' ? 500 : 400,
                    }}>
                      {item.path}
                    </span>
                    {item.type === 'blob' && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: selectedFile?.sha === item.sha ? 'var(--accent)' : 'var(--text-4)', flexShrink: 0 }}>
                        {item.size !== undefined ? formatBytes(item.size) : ''}
                      </span>
                    )}
                    {item.type === 'blob' && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-4)', flexShrink: 0, marginLeft: 4 }}>
                        {selectedFile?.sha === item.sha ? '▲ close' : '▼ view'}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Inline file viewer */}
              {selectedFile && (
                <FileViewer
                  repoName={repoName}
                  item={selectedFile}
                  onClose={() => setSelectedFile(null)}
                />
              )}
            </>
          )
        )}

      </div>

      <style>{`
        .repo-g4 { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
        .repo-g3 { display: grid; grid-template-columns: repeat(1,1fr); gap: 10px; }
        @media (min-width: 640px) {
          .repo-g4 { grid-template-columns: repeat(4,1fr); }
          .repo-g3 { grid-template-columns: repeat(3,1fr); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
