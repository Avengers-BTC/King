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
    <div className="w-full flex justify-center my-2 px-2 sm:px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs system-message">
        <span>{message}</span>
      </div>
    </div>
  );
}
