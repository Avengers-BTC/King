'use client';

import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Smile, SendHorizonal, Loader2 } from 'lucide-react';
import { RefObject } from 'react';

interface ChatFooterProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  isSending?: boolean;
  isConnected?: boolean;
  isMuted?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
  onEmojiToggle?: () => void;
  showTypingIndicator?: boolean;
  typingMessage?: string;
  userCountMessage?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ChatFooter({
  message,
  onMessageChange,
  onSendMessage,
  isSending = false,
  isConnected = true,
  isMuted = false,
  inputRef,
  onEmojiToggle,
  showTypingIndicator = false,
  typingMessage,
  userCountMessage,
  className,
  children
}: ChatFooterProps) {
  return (
    <form onSubmit={onSendMessage} className={cn(
      "p-4 border-t bg-background/50",
      className
    )}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder={
                  !isConnected 
                    ? "Connecting..." 
                    : isMuted 
                      ? "You are muted" 
                      : "Type a message..."
                }
                className="w-full pr-10 rounded-full py-5 pl-4 border-primary/20 focus-visible:ring-primary/30"
                disabled={!isConnected || isSending || isMuted}
              />
              {onEmojiToggle && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={onEmojiToggle}
                  disabled={!isConnected || isMuted}
                >
                  <Smile className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Button>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={!isConnected || isSending || !message.trim() || isMuted}
              className={cn(
                "rounded-full w-10 h-10 p-0 flex items-center justify-center",
                isSending ? "opacity-70" : ""
              )}
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : !isConnected ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SendHorizonal className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {children}
            <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-x-3 gap-y-1">
            <span className="font-mono hidden sm:inline">**bold**</span>
            <span className="font-mono hidden sm:inline">*italic*</span>
            <span className="font-mono hidden sm:inline">`code`</span>
            <span className="font-mono hidden sm:inline">[text](url)</span>
            <span className="inline sm:hidden">Use ** * ` for formatting</span>
            
            {showTypingIndicator && typingMessage && (
              <span className="ml-auto animate-pulse flex items-center">
                <div className="flex items-center space-x-1 mr-1">
                  <div className="w-1 h-1 rounded-full bg-primary animate-ping"></div>
                  <div className="w-1 h-1 rounded-full bg-primary animate-ping" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-1 rounded-full bg-primary animate-ping" style={{ animationDelay: '0.4s' }}></div>
                </div>
                {typingMessage}
              </span>
            )}
            
            {!showTypingIndicator && userCountMessage && (
              <span className="ml-auto text-muted-foreground/60">{userCountMessage}</span>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
