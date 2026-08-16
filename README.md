# 0d4y.dev

Premium developer portfolio and GitHub intelligence dashboard for [0d4y.dev](https://0d4y.dev).

Powered entirely by live GitHub API data from [github.com/th30d4y](https://github.com/th30d4y/).

## Stack

- **Next.js 16** — App Router, server-side API routes
- **TypeScript** — strict mode
- **Tailwind CSS v4** — utility-first styling
- **react-markdown + rehype-sanitize** — secure README rendering

## Setup

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | No (but recommended) | GitHub PAT for 5000 req/hr (vs 60 unauthenticated) |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical URL for OG metadata |

Create a token at [github.com/settings/tokens/new](https://github.com/settings/tokens/new) with `public_repo` (read-only) scope.

## Project Structure

```
app/
  layout.tsx              — Root layout, metadata, fonts
  page.tsx                — Homepage (Hero, Stats, Featured, Activity, etc.)
  projects/
    page.tsx              — Repository explorer with search/filter/sort
    [repo]/page.tsx       — Repository detail (tabs: overview, commits, issues, PRs, contributors, files)
  activity/page.tsx       — Full commit activity timeline
  api/github/
    user/route.ts         — GitHub user profile
    repos/route.ts        — All repositories + language aggregates
    activity/route.ts     — Recent commits across repos
    commits/route.ts      — Per-repo commits
    readme/[repo]/        — Repository README (base64 decoded)
    contributors/[repo]/  — Repository contributors
    tree/[repo]/          — Repository file tree
    issues/[repo]/        — Repository issues
    pulls/[repo]/         — Repository pull requests
    commit/[repo]/[sha]/  — Single commit detail

components/
  Navbar.tsx              — Sticky nav with mobile menu
  Hero.tsx                — Full-screen hero with GitHub stats
  GitHubStats.tsx         — Animated stat cards
  FeaturedProjects.tsx    — Top repos by score algorithm
  ProjectCard.tsx         — Individual repo card
  ActivityFeed.tsx        — Live commit timeline
  ContributionGraph.tsx   — GitHub-style heatmap
  LanguageStats.tsx       — Bar chart + donut visualization
  WhatIBuild.tsx          — Focus areas grid
  Terminal.tsx            — Interactive shell with commands
  Footer.tsx              — Minimal branded footer
  MarkdownRenderer.tsx    — Sanitized markdown with GFM

lib/
  github.ts               — All GitHub API fetch functions, scoring, formatting
  cache.ts                — In-memory cache with TTL

types/
  github.ts               — Full TypeScript interfaces for GitHub API
```

## Deploy to 0d4y.dev

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

Set `GITHUB_TOKEN` in Vercel project settings under **Settings → Environment Variables**.

### Cloudflare Pages

```bash
npm run build
# Upload .next/static to Pages, configure build command as: next build
```

### Self-hosted (Docker / VPS)

```bash
npm run build
npm start
# Runs on port 3000 by default
# Reverse proxy with nginx/caddy to 0d4y.dev
```

### nginx config snippet

```nginx
server {
    listen 443 ssl;
    server_name 0d4y.dev;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Data Caching

API routes cache responses in memory to avoid hammering GitHub:

| Resource | TTL |
|---|---|
| User profile | 5 min |
| Repositories | 5 min |
| Commits | 3 min |
| Languages | 10 min |
| Contributors | 10 min |
| README | 15 min |
| File tree | 15 min |

The cache is per-process. Serverless deployments will have independent caches per instance.

## Rate Limits

Without a token: **60 requests/hour** (hits fast with multiple repos).  
With `GITHUB_TOKEN`: **5000 requests/hour**.

The `/api/github/repos` route also fetches languages for up to 20 repos in parallel, so a token is strongly recommended.
