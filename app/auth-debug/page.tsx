'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthDebugPage() {
  const { data: session, status, update } = useSession();
  const [debugInfo, setDebugInfo] = useState('Loading...');

  useEffect(() => {
    setDebugInfo(JSON.stringify({ 
      status, 
      session: session || null,
      authenticated: status === 'authenticated',
      timestamp: new Date().toISOString()
    }, null, 2));
  }, [session, status]);

  return (
    <div className="min-h-screen bg-app-bg p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>NextAuth Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
              <div className="p-2 bg-app-surface rounded-md">
                <span className={`inline-block px-2 py-1 rounded text-sm ${
                  status === 'authenticated' 
                    ? 'bg-green-500/20 text-green-300' 
                    : status === 'loading' 
                      ? 'bg-yellow-500/20 text-yellow-300' 
                      : 'bg-red-500/20 text-red-300'
                }`}>
                  {status}
                </span>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2">Session Data</h2>
              <pre className="p-4 bg-app-surface rounded-md overflow-auto max-h-80 text-sm">
                {debugInfo}
              </pre>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => update()}>
                Refresh Session
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/api/auth/signin'}>
                Sign In (Direct)
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/login'}>
                Go to Login Page
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
              <Button variant="destructive" onClick={() => window.location.href = '/api/auth/signout'}>
                Sign Out (Direct)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
