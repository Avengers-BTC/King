'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SessionDebugger() {
  const { data: session, status, update } = useSession();
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
    useEffect(() => {
    // This runs only on the client after hydration
    setIsClient(true);
    setCurrentPath(window.location.pathname);
    setLastUpdate(new Date().toISOString());
    
    // Log auth details
    console.log('[SessionDebugger] Auth state:', {
      status,
      user: session?.user,
      cookies: document.cookie
    });
    
    // Set up interval to refresh the timestamp every 10 seconds
    const interval = setInterval(() => {
      setLastUpdate(new Date().toISOString());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Separate effect for session/status changes
  useEffect(() => {
    if (isClient) {
      setLastUpdate(new Date().toISOString());
    }
  }, [session, status, isClient]);
  
  // Don't render anything during SSR to prevent hydration mismatch
  if (!isClient) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-app-surface rounded-lg shadow-lg max-w-sm text-xs">
      <h3 className="font-bold mb-2 text-neon-cyan">Session Debugger</h3>
      <div className="space-y-1 mb-2">
        <p><span className="font-semibold">Status:</span> {status}</p>
        <p><span className="font-semibold">Authenticated:</span> {status === 'authenticated' ? 'Yes' : 'No'}</p>
        <p><span className="font-semibold">User ID:</span> {session?.user?.id || 'None'}</p>
        <p><span className="font-semibold">Last Updated:</span> {lastUpdate}</p>
        <p><span className="font-semibold">Path:</span> {currentPath}</p>
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={() => update()}
          className="bg-neon-cyan text-black px-2 py-1 rounded text-xs"
        >
          Refresh Session
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="bg-electric-pink text-black px-2 py-1 rounded text-xs"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
