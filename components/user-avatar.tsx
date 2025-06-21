'use client';

import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface UserAvatarProps {
  name: string;
  role?: string;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ 
  name, 
  role = 'user', 
  isOnline = false, 
  size = 'md',
  className 
}: UserAvatarProps) {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
    
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  const statusSizes = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };
  
  const roleColors = {
    dj: 'bg-primary/20 text-primary',
    admin: 'bg-blue-500/20 text-blue-500',
    moderator: 'bg-amber-500/20 text-amber-500',
    user: 'bg-muted text-muted-foreground',
  };
  
  const roleKey = role.toLowerCase() as keyof typeof roleColors;
  const bgColor = roleColors[roleKey] || roleColors.user;
  
  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "relative flex overflow-hidden rounded-full items-center justify-center font-medium",
        bgColor,
        sizeClasses[size]
      )}>
        {initials || <User className={iconSizes[size]} />}
      </div>
      
      {isOnline && (
        <span className={cn(
          "absolute bottom-0 right-0 rounded-full ring-1 ring-background",
          statusSizes[size],
          "bg-green-500"
        )}>
          <span className="absolute inset-0 rounded-full animate-ping bg-green-500 opacity-75"></span>
        </span>
      )}
    </div>
  );
}
