'use client';

import { Card } from '@/components/ui/card';
import { Chat } from '@/components/chat';
import { Badge } from '@/components/ui/badge';
import { Users, Star, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from './ui/button';

interface FanChatProps {
  djId: string;
  djName: string;
  className?: string;
}

export function FanChat({ djId, djName, className }: FanChatProps) {
  const roomId = `dj-${djId}-fans`;
  const [isExpanded, setIsExpanded] = useState(false);

  return (    <Card className={cn(
      "overflow-hidden transition-all duration-300 ease-in-out border-primary/10 w-full",
      isExpanded ? "h-[600px] sm:h-[600px]" : "h-[450px] sm:h-[450px]",
      className
    )}>
      <div className="flex items-center justify-between p-3 bg-primary/5">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-full mr-3">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Fan Community</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-5 text-xs flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {djName}
              </Badge>              <span className="text-xs text-muted-foreground hidden sm:inline">
                Connect with fans
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Collapse" : "Expand"}
        </Button>
      </div>
        <Chat
        roomId={roomId}
        className={cn(
          "border-0 shadow-none",
          isExpanded 
            ? "h-[545px] sm:h-[545px]" 
            : "h-[395px] sm:h-[400px]"
        )}
      />
    </Card>
  );
}
