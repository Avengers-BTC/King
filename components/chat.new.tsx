'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useChat } from '@/hooks/use-chat';
import { useChatRoom } from '@/hooks/use-chat-room';
import { useSocket } from '@/contexts/socket-context';
import { cn } from '@/lib/utils';
import { ChatSounds } from '@/lib/chat-sounds';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { MessageStatus } from '@/components/ui/message-status';
import { SystemMessage } from '@/components/ui/system-message';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Loader2, 
  MoreVertical, 
  Volume2, 
  VolumeX,
  Smile,
  SendHorizonal,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

interface ChatHookResult {
  messages: Message[];
  sendMessage: (message: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  isConnected: boolean;
}

interface ChatRoomHookResult {
  userCount: number;
  isConnected: boolean;
  typingUsers: Array<{
    id: string;
    name: string;
    role?: string;
    image?: string;
  }>;
  onlineUsers: Array<{
    id: string;
    name: string;
    role?: string;
  }>;
  isDJ: boolean;
  mutedUsers: Set<string>;
  muteUser: (userId: string) => void;
  unmuteUser: (userId: string) => void;
  resetRoomCount: () => void;
}

interface MessageFormat {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  link?: boolean;
}

interface MessageReactions {
  [emoji: string]: string[]; // Array of user IDs who reacted
}

interface Message {
  id?: string;
  message: string;
  sender?: {
    id: string;
    name: string;
    role?: string;
    image?: string;
  };
  timestamp: string;
  type?: 'system' | 'message';
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
  format?: MessageFormat;
  reactions?: MessageReactions;
}

interface ChatProps {
  roomId: string;
  className?: string;
}

export function Chat({ roomId, className }: ChatProps) {
  const { sendMessage, addReaction, removeReaction, isConnected: chatConnected } = useChat(roomId) as ChatHookResult;
  const { socket } = useSocket();
  const { userCount, isConnected: roomConnected, typingUsers, onlineUsers, isDJ, mutedUsers, muteUser, unmuteUser } = useChatRoom(roomId) as ChatRoomHookResult;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [systemMessages, setSystemMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  // Calculate connection state
  const isFullyConnected = socket?.connected && chatConnected && roomConnected;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTyping = () => {
    if (!socket || !session?.user) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', {
        roomId,
        userName: session.user.name,
        userRole: session.user.role,
        userId: session.user.id,
        image: session.user.image
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_end', roomId);
    }, 1000);
  };

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const cursorPosition = inputRef.current?.selectionStart || newMessage.length;
    const textBeforeCursor = newMessage.substring(0, cursorPosition);
    const textAfterCursor = newMessage.substring(cursorPosition);
    
    const updatedMessage = textBeforeCursor + emoji + textAfterCursor;
    setNewMessage(updatedMessage);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPosition = cursorPosition + emoji.length;
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 10);
  };

  const updateMessageStatus = (messageId: string, newStatus: Message['status']) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: newStatus }
        : msg
    ));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !socket || !session?.user) return;

    try {
      const messageToSend = newMessage.trim();
      setIsSending(true);
      
      const tempId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const tempMessage: Message = {
        id: tempId,
        message: messageToSend,
        sender: {
          id: session.user.id,
          name: session.user.name || 'Unknown User',
          role: session.user.role,
          image: session.user.image || undefined
        },
        timestamp: new Date().toISOString(),
        status: 'sending'
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      const messageTimeout = setTimeout(() => {
        console.warn('[Chat] Message sending timed out');
        updateMessageStatus(tempId, 'failed');
        setIsSending(false);
      }, 8000);
      
      if (isTyping) {
        setIsTyping(false);
        socket.emit('typing_end', roomId);
      }
      
      setNewMessage('');
      
      await sendMessage(messageToSend);
      clearTimeout(messageTimeout);
      updateMessageStatus(tempId, 'sent');
      
      inputRef.current?.focus();
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setTimeout(() => {
        setIsSending(false);
      }, 300);
    }
  };

  const renderMessageActions = (msg: Message) => {
    if (!isDJ || !msg.sender || msg.sender.id === session?.user?.id) return null;

    const isMuted = mutedUsers.has(msg.sender.id);
    const senderName = msg.sender.name;
    const senderId = msg.sender.id;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              if (isMuted) {
                unmuteUser(senderId);
                toast.success(`Unmuted ${senderName}`);
              } else {
                muteUser(senderId);
                toast.success(`Muted ${senderName}`);
              }
            }}
          >
            {isMuted ? (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                Unmute User
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 mr-2" />
                Mute User
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderReactions = (msg: Message) => {
    if (!msg.reactions || !msg.id || Object.keys(msg.reactions).length === 0) {
      return null;
    }
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(msg.reactions).map(([emoji, userIds]) => (
          <Badge 
            key={emoji}
            variant="outline" 
            className={cn(
              "px-1.5 py-0.5 cursor-pointer hover:bg-primary/10",
              userIds.includes(session?.user?.id as string) && "bg-primary/20"
            )}
            onClick={() => {
              if (!msg.id) return;
              if (userIds.includes(session?.user?.id as string)) {
                removeReaction(msg.id, emoji);
              } else {
                addReaction(msg.id, emoji);
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
    <Card className={cn('chat-container overflow-hidden', className)}>
      {!isFullyConnected && (
        <div className="p-2 bg-yellow-500/10 text-yellow-600 text-sm flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting to chat...
        </div>
      )}

      <ScrollArea ref={scrollRef} className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={msg.id ?? index} 
            className={cn(
              'flex',
              msg.sender?.id === session?.user?.id ? 'justify-end' : 'justify-start'
            )}
          >
            {msg.type === 'system' ? (
              <SystemMessage message={msg.message} timestamp={msg.timestamp} />
            ) : (
              <div className={cn(
                'chat-message group',
                msg.sender?.id === session?.user?.id 
                  ? 'bg-primary text-primary-foreground ml-12'
                  : 'bg-muted mr-12'
              )}>
                <div className="chat-message-sender flex items-center gap-2">
                  {msg.sender && (
                    <>
                      <UserAvatar 
                        user={msg.sender}
                        className="h-5 w-5"
                      />
                      <span className={cn(
                        'font-medium',
                        msg.sender.role === 'DJ' ? 'text-purple-400' : 'text-muted-foreground'
                      )}>
                        {msg.sender.name}
                      </span>
                    </>
                  )}
                  {renderMessageActions(msg)}
                </div>

                <div className="mt-1 space-y-1">
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  {renderReactions(msg)}
                  {msg.status && (
                    <MessageStatus 
                      status={msg.status}
                      timestamp={msg.timestamp}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {typingUsers.length > 0 && (
          <div className="flex items-end gap-2 mt-2">
            <TypingIndicator users={typingUsers} />
          </div>
        )}
      </ScrollArea>

      <div className="chat-input-area border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
              className="chat-input pr-10"
              disabled={!isFullyConnected || isSending}
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-transparent"
                  >
                    <Smile className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  side="top" 
                  align="end"
                  className="emoji-picker-container"
                >
                  <EmojiPicker
                    theme={Theme.AUTO}
                    onEmojiClick={handleEmojiSelect}
                    width={300}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Button 
            type="submit"
            className="chat-button"
            disabled={!newMessage.trim() || !isFullyConnected || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-5 w-5" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </Card>
  );
}
