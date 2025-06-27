import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { PWAInstallBanner } from '@/components/pwa-install-banner';
// Removing ClearDataComponent as it's clearing user sessions on every page load

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NightVibe - The Ultimate Nightlife Social Experience',
  description: 'Connect with DJs, discover clubs, and share your nightlife moments',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NightVibe',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'NightVibe',
    title: 'NightVibe - Ultimate Nightlife Platform',
    description: 'Discover DJs, clubs, and nightlife experiences',
  },
  icons: {
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NightVibe" />
        <meta name="application-name" content="NightVibe" />
        <meta name="msapplication-TileColor" content="#ff006e" />
        <meta name="theme-color" content="#ff006e" />
        <link rel="apple-touch-icon" href="/apple-icon-180.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          {/* Removed ClearDataComponent to preserve authentication state */}
          {children}
          <PWAInstallBanner />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
