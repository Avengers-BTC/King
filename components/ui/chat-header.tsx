'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ChatHeaderProps {
  title: string;
  isConnected: boolean;
  subtitle?: string;
  className?: string;
  headerRight?: React.ReactNode;
}

export function ChatHeader({
  title,
  isConnected,
  subtitle,
  className,
  headerRight
}: ChatHeaderProps) {
  return (
    <div className={cn("p-4 border-b flex items-center justify-between bg-gradient-to-r from-background to-muted", className)}>
      <div className="flex items-center gap-3">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <Badge 
          variant={isConnected ? "default" : "destructive"} 
          className={cn(
            "h-5 text-xs transition-colors",
            isConnected ? "bg-green-600 hover:bg-green-700" : ""
          )}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>
      
      {headerRight && (
        <div className="flex items-center">
          {headerRight}
        </div>
      )}
    </div>
  );
}
