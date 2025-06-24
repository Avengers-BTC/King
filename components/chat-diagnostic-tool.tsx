'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/socket-context';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ChatDiagnosticToolProps {
  roomId: string;
  className?: string;
}

export function ChatDiagnosticTool({ roomId, className }: ChatDiagnosticToolProps) {
  const { socket, isConnected } = useSocket();
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);

  const runDiagnostic = async () => {
    if (!socket || !isConnected) {
      toast.error('Socket connection is not available');
      return;
    }

    setIsChecking(true);
    setStatus('checking');

    try {
      // Check socket connection
      const socketConnected = socket.connected;
      
      // Request room debug info
      socket.emit('debug_room', roomId);
      
      // Wait for response with timeout
      const debugInfo = await new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Diagnostic request timed out'));
        }, 5000);
        
        socket.once('debug_room_info', (info) => {
          clearTimeout(timeout);
          resolve(info);
        });
        
        socket.once('error', (error) => {
          clearTimeout(timeout);
          reject(new Error(error.message || 'Unknown error'));
        });
      });
      
      // Collect diagnostic information
      const info = {
        timestamp: new Date().toISOString(),
        socketId: socket.id,
        socketConnected,
        room: debugInfo,
        transportType: socket.io.engine.transport.name,
        latency: await checkLatency(socket)
      };
      
      setDiagnosticInfo(info);
      setStatus('success');
      toast.success('Diagnostic complete');
      
      // Request a resync of the room
      socket.emit('resync_room', roomId);
    } catch (error) {
      console.error('Chat diagnostic error:', error);
      setStatus('error');
      toast.error(`Diagnostic failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsChecking(false);
    }
  };
  
  // Helper function to measure socket latency
  const checkLatency = (socket: any): Promise<number> => {
    return new Promise((resolve) => {
      const start = Date.now();
      
      socket.emit('heartbeat', null, () => {
        const latency = Date.now() - start;
        resolve(latency);
      });
      
      // Fallback if callback doesn't work
      setTimeout(() => {
        resolve(-1); // Negative indicates timeout
      }, 3000);
    });
  };

  return (
    <div className={className}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={runDiagnostic}
        disabled={isChecking || !isConnected}
        className="flex items-center gap-2"
      >
        {isChecking ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking...
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            Run Diagnostic
          </>
        ) : status === 'error' ? (
          <>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Run Diagnostic
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Run Diagnostic
          </>
        )}
      </Button>
      
      {diagnosticInfo && status === 'success' && (
        <div className="mt-2 p-3 bg-secondary/50 rounded-md text-xs font-mono">
          <p><strong>Socket ID:</strong> {diagnosticInfo.socketId}</p>
          <p><strong>Transport:</strong> {diagnosticInfo.transportType}</p>
          <p><strong>Latency:</strong> {diagnosticInfo.latency}ms</p>
          <p><strong>Room Users:</strong> {diagnosticInfo.room?.userCount || 0}</p>
        </div>
      )}
    </div>
  );
}
