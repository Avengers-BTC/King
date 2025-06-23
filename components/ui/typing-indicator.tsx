import React from 'react';
import { cn } from '@/lib/utils';
import { UserAvatar } from './user-avatar';

interface TypingUser {
  id: string;
  name: string;
  role?: string;
  image?: string;
}

interface TypingIndicatorProps {
  users: TypingUser[];
  currentUserId?: string;
  className?: string;
}

export function TypingIndicator({ users, currentUserId, className }: TypingIndicatorProps) {
  // Filter out current user
  const typingUsers = users.filter(user => user.id !== currentUserId);
  
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].name} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
    } else {
      return `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground animate-fade-in-up',
      className
    )}>
      <div className="flex -space-x-2">
        {typingUsers.slice(0, 3).map((user) => (
          <UserAvatar
            key={user.id}
            user={user}
            size="sm"
            className="ring-2 ring-background"
          />
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-typing-dots"></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-typing-dots" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-typing-dots" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <span className="text-xs font-medium">{getTypingText()}</span>
      </div>
    </div>
  );
} 