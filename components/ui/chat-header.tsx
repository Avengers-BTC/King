'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChatThemeSwitcher } from '@/components/ui/chat-theme-switcher';
import { SoundSettings } from '@/components/ui/sound-settings';
import { Users, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatHeaderProps {
  title: string;
  isConnected: boolean;
  subtitle?: string;
  className?: string;
  headerRight?: React.ReactNode;
  userCount?: number;
  soundEnabled?: boolean;
  onSoundToggle?: () => void;
  onlineUsers?: Array<{
    id: string;
    name: string;
    image?: string;
    role?: string;
    isActive?: boolean;
  }>;
}

export function ChatHeader({
  title,
  isConnected,
  subtitle,
  className,
  headerRight,
  userCount = 0,
  soundEnabled,
  onSoundToggle,
  onlineUsers = []
}: ChatHeaderProps) {
  return (
    <div className={cn(
      "p-3 border-b flex items-center justify-between",
      "bg-gradient-to-r from-background to-muted",
      "sticky top-0 z-10 backdrop-blur-sm bg-opacity-90",
      className
    )}>
      <div className="flex items-center gap-3">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {title}
            <Badge 
              variant={isConnected ? "default" : "destructive"} 
              className={cn(
                "h-5 text-xs transition-colors",
                isConnected ? "bg-green-600 hover:bg-green-700" : ""
              )}
            >
              {isConnected ? 'Live' : 'Offline'}
            </Badge>
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {/* Online Users List */}
        {onlineUsers.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <Users className="h-4 w-4" />
                <span>{userCount || onlineUsers.length}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60 p-0">
              <div className="px-3 py-2 border-b">
                <h4 className="font-medium">Online Users</h4>
                <p className="text-xs text-muted-foreground">
                  {onlineUsers.length} {onlineUsers.length === 1 ? 'person' : 'people'} in chat
                </p>
              </div>
              <ScrollArea className="h-60">
                <div className="p-2">
                  {onlineUsers.map(user => (
                    <div 
                      key={user.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          {user.image ? (
                            <AvatarImage src={user.image} alt={user.name} />
                          ) : (
                            <AvatarFallback>
                              {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {user.isActive && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        {user.role && (
                          <p className="text-xs text-muted-foreground">{user.role}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        )}
        
        {/* Sound Settings */}
        {onSoundToggle && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSoundToggle}
            className="h-8 w-8"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="sr-only">Toggle sound</span>
          </Button>
        )}
        
        {/* Advanced Sound Settings */}
        <SoundSettings />
        
        {/* Theme Switcher */}
        <ChatThemeSwitcher />
        
        {/* Additional header controls */}
        {headerRight && (
          <div className="flex items-center">
            {headerRight}
          </div>
        )}
      </div>
    </div>
  );
}
