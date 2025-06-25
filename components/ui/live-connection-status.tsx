'use client';

import { useSocket } from '@/contexts/socket-context';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

export function LiveConnectionStatus() {
  const { isConnected, connectionState, reconnect } = useSocket();

  if (isConnected) return null;
  
  return (
    <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm mb-4">
      <AlertTriangle className="h-4 w-4 text-red-500" />
      <span className="flex-1">
        {connectionState === 'connecting' || connectionState === 'reconnecting'
          ? 'Connecting to live status service...'
          : 'Connection to live service failed'
        }
      </span>
      
      {(connectionState === 'disconnected' || connectionState === 'failed') && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={reconnect}
          className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
}
