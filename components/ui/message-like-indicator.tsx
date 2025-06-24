'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

interface MessageLikeIndicatorProps {
  emoji?: string;
  count?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MessageLikeIndicator({
  emoji = '❤️',
  count = 1,
  className,
  size = 'md'
}: MessageLikeIndicatorProps) {
  const sizes = {
    sm: {
      container: 'h-5 w-5',
      emoji: 'text-xs',
      countBadge: 'h-3.5 w-3.5 text-[8px]'
    },
    md: {
      container: 'h-6 w-6',
      emoji: 'text-sm',
      countBadge: 'h-4 w-4 text-[10px]'
    },
    lg: {
      container: 'h-8 w-8',
      emoji: 'text-base',
      countBadge: 'h-5 w-5 text-xs'
    }
  };
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "relative flex items-center justify-center rounded-full bg-primary/10 border border-primary/20",
        sizes[size].container,
        className
      )}
    >
      <span className={sizes[size].emoji}>{emoji}</span>
      
      {count > 1 && (
        <div className={cn(
          "absolute -bottom-1 -right-1 flex items-center justify-center",
          "rounded-full bg-primary text-primary-foreground font-medium",
          sizes[size].countBadge
        )}>
          {count > 99 ? '99+' : count}
        </div>
      )}
    </motion.div>
  );
}

export function AnimatedHeartReaction({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ 
          scale: [0, 1.2, 1],
          y: [0, -20, -40],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 1.5,
          ease: "easeOut"
        }}
        className="absolute"
      >
        <Heart className="h-5 w-5 text-red-500 fill-red-500" />
      </motion.div>
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ 
          scale: [0, 1.2, 1],
          y: [0, -15, -30],
          x: [0, 10, 20],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 1.5,
          delay: 0.1,
          ease: "easeOut"
        }}
        className="absolute"
      >
        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
      </motion.div>
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ 
          scale: [0, 1.2, 1],
          y: [0, -15, -30],
          x: [0, -10, -20],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 1.5,
          delay: 0.2,
          ease: "easeOut"
        }}
        className="absolute"
      >
        <Heart className="h-3 w-3 text-red-500 fill-red-500" />
      </motion.div>
    </div>
  );
}
