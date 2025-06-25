'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/socket-context';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

export function ConnectionStatus() {
  const { isConnected, connectionState, reconnect } = useSocket();
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [message, setMessage] = useState('Connecting...');

  useEffect(() => {
    if (isConnected) {
      setStatus('connected');
      setMessage('Connected');
      
      // Hide after 3 seconds when connected
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else if (connectionState === 'connecting' || connectionState === 'reconnecting') {
      setStatus('connecting');
      setMessage(connectionState === 'connecting' ? 'Connecting...' : 'Reconnecting...');
    } else {
      setStatus('disconnected');
      setMessage('Disconnected');
    }
    
    setVisible(true);
  }, [isConnected, connectionState]);

  // Show briefly when component mounts
  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      if (isConnected) {
        setVisible(false);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isConnected]);

  const handleClick = () => {
    if (status === 'disconnected') {
      reconnect();
    }
  };

  return (
    <div 
      className={cn(
        'connection-status',
        status,
        visible ? 'visible' : ''
      )}
      onClick={handleClick}
      style={{ cursor: status === 'disconnected' ? 'pointer' : 'default' }}
    >
      <div className="connection-status-dot" />
      {status === 'disconnected' ? (
        <div className="flex items-center gap-1">
          {message}
          <RefreshCw className="h-3 w-3 ml-1" />
        </div>
      ) : (
        message
      )}
    </div>
  );
}
