'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
          <AlertTriangle className="relative w-24 h-24 mx-auto text-red-500" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">Something went wrong!</h1>
        
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          We apologize for the inconvenience. An unexpected error occurred while processing your request.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={reset}
            className="bg-pink-500 hover:bg-pink-600"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          <Button asChild variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-500/10">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-red-400 text-sm font-mono">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
