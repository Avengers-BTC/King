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

  // Utility to generate a consistent color from a string (user id)
  function getUserColor(userId: string) {
    const colors = [
      '#e57373', '#f06292', '#ba68c8', '#64b5f6', '#4dd0e1', '#81c784', '#ffd54f', '#ffb74d', '#a1887f', '#90a4ae',
      '#f44336', '#e91e63', '#9c27b0', '#2196f3', '#00bcd4', '#4caf50', '#ffeb3b', '#ff9800', '#795548', '#607d8b'
    ];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return <span style={{ color: getUserColor(typingUsers[0].id) }}>{typingUsers[0].name}</span>;
    } else if (typingUsers.length === 2) {
      return <><span style={{ color: getUserColor(typingUsers[0].id) }}>{typingUsers[0].name}</span> and <span style={{ color: getUserColor(typingUsers[1].id) }}>{typingUsers[1].name}</span> are typing</>;
    } else {
      return <><span style={{ color: getUserColor(typingUsers[0].id) }}>{typingUsers[0].name}</span> and {typingUsers.length - 1} others are typing</>;
    }
  };

  return (
    <div className={cn('flex flex-col items-start gap-1 mb-2', className)}>
      <div className="typing-indicator">
        <div className="flex items-center gap-2">
          {typingUsers.slice(0, 1).map((user) => (
            <UserAvatar
              key={user.id}
              user={user}
              size="sm"
              className="ring-1 ring-background"
            />
          ))}
          
          {typingUsers.length > 0 && (
            <span className="text-xs text-gray-600 mr-1">
              {typingUsers.length === 1 
                ? `${typingUsers[0].name} is typing` 
                : typingUsers.length === 2 
                  ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing` 
                  : `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing`
              }
            </span>
          )}
          
          <div className="flex items-center">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
}