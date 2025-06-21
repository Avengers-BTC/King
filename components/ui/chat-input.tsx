'use client';

import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Smile, SendHorizontal, ChevronDown, Info } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  isSending?: boolean;
  placeholder?: string;
  showFormatGuide?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isSending = false,
  placeholder = "Type a message...",
  showFormatGuide = true
}: ChatInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const cursorPosition = inputRef.current?.selectionStart || value.length;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    
    // Insert emoji at cursor position
    const updatedMessage = textBeforeCursor + emoji + textAfterCursor;
    onChange(updatedMessage);
    
    // Focus back on input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Set cursor position after the inserted emoji
        const newCursorPosition = cursorPosition + emoji.length;
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 10);
  };
  
  return (
    <form onSubmit={onSubmit} className="relative">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-10 focus-visible:ring-1 focus-visible:ring-primary"
          />
          
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                disabled={disabled}
              >
                <Smile className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-0" align="end">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={300}
                height={400}
                theme={Theme.AUTO}
                searchPlaceHolder="Search emoji..."
                previewConfig={{
                  showPreview: true
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <Button 
          type="submit" 
          disabled={disabled || isSending || !value.trim()}
          className={isSending ? "opacity-70" : ""}
          size="icon"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {showFormatGuide && (
        <div className="flex items-center mt-1.5 text-xs text-muted-foreground">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 mr-1.5 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Use these formatting options to style your messages</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          Format with: 
          <span className="font-mono mx-1">**bold**</span>
          <span className="font-mono mx-1">*italic*</span>
          <span className="font-mono mx-1">`code`</span>
          <span className="font-mono mx-1">[text](url)</span>
        </div>
      )}
    </form>
  );
}
