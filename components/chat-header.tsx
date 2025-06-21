'use client';

import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';
import { Headphones, Music, Zap } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  isLive?: boolean;
  djName?: string;
  userCount?: number;
  className?: string;
}

export function ChatHeader({ 
  title, 
  subtitle, 
  isLive = false, 
  djName, 
  userCount, 
  className 
}: ChatHeaderProps) {
  return (
    <div className={cn(
      "relative overflow-hidden p-4 rounded-t-lg",
      isLive ? "bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" : "bg-secondary/20",
      className
    )}>
      {/* Animated background effect for live sessions */}
      {isLive && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent bg-[length:400%_100%] animate-shimmer" />
      )}
      
      <div className="relative flex items-center z-10">
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full mr-3",
          isLive ? "bg-primary/20" : "bg-secondary"
        )}>
          {isLive ? (
            <Music className="w-5 h-5 text-primary" />
          ) : (
            <Headphones className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{title}</h3>
            {isLive && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
              >
                <Badge variant="default" className="bg-red-500 text-white">
                  <span className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    LIVE
                  </span>
                </Badge>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            {subtitle && <span className="mr-2">{subtitle}</span>}
            
            {djName && (
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                DJ: {djName}
              </span>
            )}
            
            {userCount && userCount > 0 && (
              <Badge variant="outline" className="ml-2 text-xs">
                {userCount} {userCount === 1 ? 'user' : 'users'}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
