import './globals.css';
import './chat-mobile.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
// Removing ClearDataComponent as it's clearing user sessions on every page load

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NightVibe - The Ultimate Nightlife Social Experience',
  description: 'Connect with DJs, discover clubs, and share your nightlife moments',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {/* Removed ClearDataComponent to preserve authentication state */}
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
