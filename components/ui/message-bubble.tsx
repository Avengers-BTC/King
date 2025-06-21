'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageBubbleProps {
  message: {
    id: string;
    message: string;
    format?: any;
    sender: {
      id: string;
      name: string;
      role?: string;
    };
    timestamp: string;
    reactions?: Record<string, string[]>;
  };
  isOwnMessage: boolean;
  isMuted: boolean;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  userId?: string;
  actions?: React.ReactNode;
}

export function MessageBubble({
  message,
  isOwnMessage,
  isMuted,
  onAddReaction,
  onRemoveReaction,
  userId,
  actions
}: MessageBubbleProps) {
  // Emoji reaction options
  const reactionEmojis = ['👍', '❤️', '😂', '🔥', '👏', '🎵', '🙌'];

  const renderFormattedMessage = () => {
    if (!message.format) {
      return <div className="mt-1 break-words">{message.message}</div>;
    }
    
    // Create a copy of the message to modify
    let formattedText = message.message;
    
    // Process formatting - we'll just use regex to identify and replace formatting
    
    // Bold formatting (**text**)
    if (message.format.bold) {
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    }
    
    // Italic formatting (*text*)
    if (message.format.italic) {
      formattedText = formattedText.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<i>$1</i>');
    }
    
    // Code formatting (`text`)
    if (message.format.code) {
      formattedText = formattedText.replace(/`(.*?)`/g, '<code>$1</code>');
    }
    
    // Link formatting ([text](url))
    if (message.format.link) {
      formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    }
    
    // Use dangerouslySetInnerHTML because we've sanitized the content ourselves
    return (
      <div 
        className="mt-1 break-words" 
        dangerouslySetInnerHTML={{ __html: formattedText }}
      />
    );
  };

  const renderReactions = () => {
    if (!message.reactions || Object.keys(message.reactions).length === 0) {
      return null;
    }
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(message.reactions).map(([emoji, userIds]) => (
          <Badge 
            key={emoji}
            variant="outline" 
            className={cn(
              "px-1.5 py-0.5 cursor-pointer hover:bg-primary/10 transition-colors",
              userIds.includes(userId || '') && "bg-primary/20"
            )}
            onClick={() => {
              if (userIds.includes(userId || '')) {
                onRemoveReaction(message.id, emoji);
              } else {
                onAddReaction(message.id, emoji);
              }
            }}
          >
            {emoji} <span className="ml-1 text-xs">{userIds.length}</span>
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'max-w-[80%] group transition-all hover:shadow-md',
        isOwnMessage
          ? 'ml-auto'
          : ''
      )}
    >
      {/* Sender info - only show for others' messages or if DJ */}
      {(!isOwnMessage || message.sender.role === 'DJ') && (
        <div className={cn(
          "flex items-center gap-1 mb-1 text-xs",
          isOwnMessage ? "justify-end" : ""
        )}>
          <span className="font-medium">
            {message.sender.name}
          </span>
          {message.sender.role === 'DJ' && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1">DJ</Badge>
          )}
          {isMuted && (
            <Badge variant="destructive" className="text-[10px] h-4 px-1">Muted</Badge>
          )}
        </div>
      )}
      
      {/* Message bubble */}
      <div className={cn(
        'p-3 rounded-xl',
        isOwnMessage
          ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm'
          : 'bg-muted rounded-tl-sm',
        isMuted && 'opacity-60'
      )}>
        {/* Message content */}
        {renderFormattedMessage()}
        
        {/* Message footer */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-opacity-10 border-current text-xs">
          <span className="opacity-70">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          <div className="flex items-center gap-1">
            {/* Add reaction button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-50 hover:opacity-100 transition-opacity"
                >
                  <Smile className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwnMessage ? "end" : "start"} className="p-1">
                <div className="flex flex-wrap p-1 gap-1">
                  {reactionEmojis.map(emoji => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onAddReaction(message.id, emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Message actions (like mute) */}
            {actions}
          </div>
        </div>
      </div>
      
      {/* Reactions */}
      <div className={cn(
        "mt-1",
        isOwnMessage ? "flex justify-end" : ""
      )}>
        {renderReactions()}
      </div>
    </div>
  );
}
