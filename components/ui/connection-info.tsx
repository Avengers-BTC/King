'use client';

import { useSocket } from '@/contexts/socket-context';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function ConnectionInfo() {
  const { isConnected, connectionState, reconnect } = useSocket();
  
  if (isConnected) return null;
  
  return (
    <div className="rounded-lg p-4 border border-amber-500/30 bg-amber-500/10 mb-6">
      <div className="flex gap-3 items-start">
        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-amber-500">
            {connectionState === 'connecting' || connectionState === 'reconnecting'
              ? 'Connecting to server...'
              : 'Connection issue'}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {connectionState === 'connecting' || connectionState === 'reconnecting'
              ? 'Please wait while we establish connection to the server. Live DJ status may not be accurate until connected.'
              : 'We\'re having trouble connecting to the server. Live DJ status may not be accurate.'}
          </p>
          
          {(connectionState === 'disconnected' || connectionState === 'failed') && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/20" 
              onClick={reconnect}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> 
              Try reconnecting
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
