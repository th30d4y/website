import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MouseGlow from '@/components/MouseGlow';

export const metadata: Metadata = {
  metadataBase: new URL('https://0d4y.dev'),
  title: {
    default: '0d4y.dev — Developer & Open Source',
    template: '%s | 0d4y.dev',
  },
  description:
    'Developer portfolio, open-source projects, GitHub activity and engineering work.',
  keywords: [
    '0d4y',
    'developer',
    'security',
    'open source',
    'github',
    'portfolio',
  ],
  authors: [{ name: '0d4y', url: 'https://github.com/th30d4y/' }],
  creator: '0d4y',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://0d4y.dev',
    siteName: '0d4y.dev',
    title: '0d4y.dev — Developer & Open Source',
    description:
      'Developer portfolio, open-source projects, GitHub activity and engineering work.',
  },
  twitter: {
    card: 'summary',
    title: '0d4y.dev — Developer & Open Source',
    description:
      'Developer portfolio, open-source projects, GitHub activity and engineering work.',
    creator: '@th30d4y',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: 'https://0d4y.dev',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080808',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/avatar.png" type="image/png" />
        <link rel="apple-touch-icon" href="/avatar.png" />
      </head>
      <body style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <MouseGlow />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
