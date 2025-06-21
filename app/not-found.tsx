import Link from 'next/link';
import { Music, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full"></div>
          <Music className="relative w-24 h-24 mx-auto text-pink-500" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
        
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          Oops! Looks like this track doesn&apos;t exist. The page you&apos;re looking for might have been moved or deleted.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-pink-500 hover:bg-pink-600">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-500/10">
            <Link href="/dashboard">
              <Music className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
