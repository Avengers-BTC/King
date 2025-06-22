'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SessionDebugger() {
  const { data: session, status, update } = useSession();
  const [lastUpdate, setLastUpdate] = useState<string>('Not updated');
  
  useEffect(() => {
    setLastUpdate(new Date().toISOString());
  }, [session, status]);
  
  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-app-surface rounded-lg shadow-lg max-w-sm text-xs">
      <h3 className="font-bold mb-2 text-neon-cyan">Session Debugger</h3>
      <div className="space-y-1 mb-2">
        <p><span className="font-semibold">Status:</span> {status}</p>
        <p><span className="font-semibold">Authenticated:</span> {status === 'authenticated' ? 'Yes' : 'No'}</p>
        <p><span className="font-semibold">User ID:</span> {session?.user?.id || 'None'}</p>
        <p><span className="font-semibold">Last Updated:</span> {lastUpdate}</p>
        <p><span className="font-semibold">Path:</span> {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
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
