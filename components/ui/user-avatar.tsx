import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Music, Crown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: {
    id: string;
    name: string;
    role?: string;
    image?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showRole?: boolean;
  className?: string;
}

export function UserAvatar({ user, size = 'md', showRole = false, className }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case 'DJ':
        return <Music className="h-3 w-3" />;
      case 'ADMIN':
        return <Crown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'DJ':
        return 'bg-blue-500';
      case 'ADMIN':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(sizeClasses[size], 'border-2 border-background')}>
        <AvatarImage src={user.image} alt={user.name} />
        <AvatarFallback className={cn(
          'text-xs font-medium',
          user.role === 'DJ' && 'bg-blue-100 text-blue-700',
          user.role === 'ADMIN' && 'bg-purple-100 text-purple-700'
        )}>
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      
      {showRole && user.role && user.role !== 'USER' && (
        <div className={cn(
          'absolute -bottom-1 -right-1 rounded-full p-1 text-white',
          getRoleColor(),
          'border-2 border-background'
        )}>
          {getRoleIcon()}
        </div>
      )}
    </div>
  );
} 