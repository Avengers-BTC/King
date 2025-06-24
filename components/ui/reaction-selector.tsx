'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ReactionSelectorProps {
  onSelect: (emoji: string) => void;
  quickReactions?: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  position?: 'top' | 'bottom';
  className?: string;
}

export function ReactionSelector({
  onSelect,
  quickReactions = ['👍', '❤️', '😂', '😮', '😢', '👏', '🔥', '🎵'],
  isOpen,
  onOpenChange,
  position = 'top',
  className
}: ReactionSelectorProps) {
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? 10 : -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position === 'top' ? 10 : -10, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "absolute z-50 p-2 rounded-full bg-background border shadow-lg",
            position === 'top' ? "bottom-full mb-2" : "top-full mt-2",
            "flex items-center gap-1",
            className
          )}
        >
          {quickReactions.map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onSelect(emoji);
                onOpenChange(false);
              }}
              className="text-lg w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent/20 transition-colors"
            >
              {emoji}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ReactionDisplayProps {
  reactions: { emoji: string; count: number; userIds: string[] }[];
  currentUserId: string;
  onReactionClick: (emoji: string) => void;
  className?: string;
}

export function ReactionDisplay({
  reactions,
  currentUserId,
  onReactionClick,
  className
}: ReactionDisplayProps) {
  if (!reactions.length) return null;
  
  return (
    <div className={cn("flex flex-wrap gap-1 mt-1", className)}>
      {reactions.map((reaction) => {
        const hasReacted = reaction.userIds.includes(currentUserId);
        
        return (
          <motion.button
            key={reaction.emoji}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onReactionClick(reaction.emoji)}
            className={cn(
              "text-sm rounded-full px-2 py-0.5 border flex items-center gap-1 transition-all",
              hasReacted 
                ? "bg-primary/10 border-primary/30" 
                : "bg-background hover:bg-accent/10"
            )}
          >
            <span>{reaction.emoji}</span>
            <span className="text-xs font-medium">{reaction.count}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
