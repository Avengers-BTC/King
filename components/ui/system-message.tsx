'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemMessageProps {
  message: string;
  timestamp: string;
  type?: 'join' | 'leave' | 'info';
  className?: string;
}

export function SystemMessage({ message, timestamp, type = 'info', className }: SystemMessageProps) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    setShow(true);
    // Auto hide after 10 seconds
    const timer = setTimeout(() => {
      setShow(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!show) return null;
    return (
    <div 
      className={cn(
        'flex items-center justify-center my-2 animate-in fade-in slide-in-from-bottom-5 duration-300',
        className
      )}
    >
      <div className={cn(
        'px-3 py-2 rounded-lg bg-secondary/60 text-sm flex items-center gap-2 shadow-sm border border-secondary/30',
        type === 'join' && 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
        type === 'leave' && 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
      )}>
        <User className="h-3.5 w-3.5" />
        <span className="font-medium">{message}</span>
        <span className="text-xs opacity-70">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
