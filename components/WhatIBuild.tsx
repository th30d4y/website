const categories = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Security',
    description: 'Building security tools, researching vulnerabilities, and developing utilities for offensive and defensive security work.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Automation',
    description: 'Writing scripts and tools that eliminate repetitive tasks, streamline workflows, and reduce manual overhead.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    title: 'Web Development',
    description: 'Building fast, clean web applications and APIs. Focus on modern stacks, good architecture, and developer experience.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: 'Developer Tools',
    description: 'Creating utilities, CLIs, and extensions that improve development workflows and save engineers time.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Open Source',
    description: 'Contributing to and building open-source projects. Sharing code, collaborating with the community, and learning in public.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
    title: 'Systems',
    description: 'Working close to the metal. Systems programming, networking, low-level tooling, and understanding how things actually work.',
  },
];

export default function WhatIBuild() {
  return (
    <section id="about" aria-label="What I Build" className="section">
      <div className="section__container">
        <div className="section__eyebrow">
          <span className="section-label">06 / Focus</span>
        </div>
        <h2 className="section__heading">What I Build</h2>
        <p className="section__sub">
          Engineering work spanning security, systems, web, and open source.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 12 }} className="focus-grid">
          {categories.map((cat) => (
            <div key={cat.title} className="card" style={{ padding: '20px 22px' }}>
              <div style={{ color: 'var(--text-4)', marginBottom: 14, transition: 'color 0.2s' }} className="focus-icon">
                {cat.icon}
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{cat.title}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', lineHeight: 1.65 }}>{cat.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) { .focus-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (min-width: 1024px) { .focus-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        .card:hover .focus-icon { color: var(--accent) !important; }
      `}</style>
    </section>
  );
}
