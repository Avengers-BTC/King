import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'failed';
  timestamp?: string;
  className?: string;
}

export function MessageStatus({ status, timestamp, className }: MessageStatusProps) {
  const getStatusContent = () => {
    switch (status) {
      case 'sending':
        return (
          <>
            <Loader2 className="h-3 w-3 inline animate-spin mr-1" />
            <span>Sending{timestamp ? ` • ${formatTime(timestamp)}` : '...'}</span>
          </>
        );
      case 'sent':
        return (
          <>
            <Check className="h-3 w-3 inline mr-1" />
            <span>Sent{timestamp ? ` • ${formatTime(timestamp)}` : ''}</span>
          </>
        );
      case 'delivered':
        return (
          <>
            <CheckCheck className="h-3 w-3 inline mr-1 text-green-500" />
            <span>Delivered{timestamp ? ` • ${formatTime(timestamp)}` : ''}</span>
          </>
        );
      case 'failed':
        return (
          <>
            <AlertCircle className="h-3 w-3 inline mr-1 text-destructive" />
            <span>Failed to send{timestamp ? ` • ${formatTime(timestamp)}` : ''}</span>
          </>
        );
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) { // 24 hours
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={cn("flex justify-end items-center gap-1 mt-1", className)}>
      <span className="text-[10px] sm:text-xs text-muted-foreground/75">
        {getStatusContent()}
      </span>
    </div>
  );
}