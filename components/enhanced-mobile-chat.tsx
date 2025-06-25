'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useChat } from '@/hooks/use-chat';
import { useChatRoom } from '@/hooks/use-chat-room';
import { useSocket } from '@/contexts/socket-context';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Loader2, 
  Users, 
  MoreVertical, 
  Volume2, 
  VolumeX,
  Smile,
  SendHorizonal,
  ArrowLeft,
  Maximize2,
  Minimize2,
  MessageCircle,
  X
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
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
  reactions?: { [emoji: string]: string[] };
}

interface EnhancedMobileChatProps {
  roomId: string;
  className?: string;
  isLiveSession?: boolean;
  clubName?: string;
  djName?: string;
}

export function EnhancedMobileChat({ 
  roomId, 
  className, 
  isLiveSession = false,
  clubName,
  djName
}: EnhancedMobileChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  
  const { data: session } = useSession();
  const { socket } = useSocket();
  const { sendMessage, addReaction, removeReaction, isConnected: chatConnected, messages: hookMessages, isLoadingHistory } = useChat(roomId);
  const { userCount, isConnected: roomConnected, typingUsers, onlineUsers, isDJ, mutedUsers } = useChatRoom(roomId);

  const isFullyConnected = socket?.connected && chatConnected && roomConnected;

  // Auto-scroll to bottom function
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollRef.current) {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
        inline: 'nearest'
      };
      
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView(scrollOptions);
      } else {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Sync messages from hook
  useEffect(() => {
    if (hookMessages && hookMessages.length > 0) {
      const mappedMessages = hookMessages.map(msg => ({
        id: msg.id,
        message: msg.message,
        sender: msg.sender || {
          id: 'system',
          name: 'System',
          role: 'system',
          image: '/images/system-avatar.png'
        },
        timestamp: msg.timestamp,
        reactions: msg.reactions,
        status: (msg as any).status || (msg.id.startsWith('temp-') ? 'sending' : 'sent')
      }));
      
      setMessages(mappedMessages);
      
      // Auto-scroll to bottom when new messages arrive
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [hookMessages, scrollToBottom]);

  // Handle typing
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

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !isFullyConnected) return;

    try {
      setIsSending(true);
      await sendMessage(newMessage);
      setNewMessage('');
      inputRef.current?.focus();
      
      if (isTyping) {
        setIsTyping(false);
        socket.emit('typing_end', roomId);
      }
      
      // Auto-scroll after sending
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    if (inputRef.current) {
      const start = inputRef.current.selectionStart || 0;
      const end = inputRef.current.selectionEnd || 0;
      const newValue = newMessage.slice(0, start) + emoji + newMessage.slice(end);
      setNewMessage(newValue);
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(start + emoji.length, start + emoji.length);
        }
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  // Toggle full screen
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    // Auto-scroll when entering full screen
    if (!isFullScreen) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  };

  // Render message actions
  const renderMessageActions = (msg: Message) => {
    if (!isDJ || msg.sender?.id === session?.user?.id || !session?.user) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="p-2">
            <p className="text-xs text-muted-foreground">DJ Controls</p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Render reactions
  const renderReactions = (msg: Message) => {
    if (!msg.reactions || Object.keys(msg.reactions).length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(msg.reactions).map(([emoji, userIds]) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              if (userIds.includes(session?.user?.id || '')) {
                removeReaction(msg.id, emoji);
              } else {
                addReaction(msg.id, emoji);
              }
            }}
          >
            {emoji} {userIds.length}
          </Button>
        ))}
      </div>
    );
  };

  if (!session || !session.user) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-full border rounded-lg bg-muted/10">
        <MessageCircle className="w-12 h-12 mb-2 text-muted-foreground" />
        <p className="text-center text-muted-foreground">
          You need to be signed in to join the chat
        </p>
        <Button 
          className="mt-4" 
          onClick={() => window.location.href = '/login'}
        >
          Sign In
        </Button>
      </div>
    );
  }

  // Mobile minimized view
  if (isMobile && isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full shadow-lg h-14 w-14"
          size="lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        {userCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
            {userCount}
          </Badge>
        )}
      </motion.div>
    );
  }

  // Full screen mobile view
  if (isMobile && isFullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background"
      >
        {/* Full screen header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary/5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullScreen(false)}
            className="h-9 w-9"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-center">
            <h3 className="font-semibold">{clubName || 'Chat'}</h3>
            {djName && (
              <p className="text-xs text-muted-foreground">with {djName}</p>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            {userCount} online
          </Badge>
        </div>

        {/* Messages area - full height minus header and input */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{ height: 'calc(100vh - 120px)' }}
        >
          {isLoadingHistory && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div 
              key={msg.id} 
              ref={index === messages.length - 1 ? lastMessageRef : undefined}
              className={cn(
                'flex',
                msg.sender?.id === session?.user?.id ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.type === 'system' ? (
                <SystemMessage message={msg.message} timestamp={msg.timestamp} />
              ) : (
                <div className={cn(
                  'max-w-[85%] p-3 rounded-2xl group',
                  msg.sender?.id === session?.user?.id
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted rounded-bl-md'
                )}>
                  {msg.sender?.id !== session?.user?.id && (
                    <div className="flex items-center gap-2 mb-1">
                      <UserAvatar user={msg.sender!} className="h-4 w-4" />
                      <span className="text-xs font-medium opacity-70">
                        {msg.sender?.name}
                      </span>
                      {renderMessageActions(msg)}
                    </div>
                  )}
                  
                  <p className="text-sm break-words">{msg.message}</p>
                  
                  {renderReactions(msg)}
                  
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-50">
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {msg.status && msg.sender?.id === session?.user?.id && (
                      <MessageStatus status={msg.status} timestamp={msg.timestamp} />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <TypingIndicator users={typingUsers} />
            </div>
          )}
        </div>

        {/* Input area - fixed at bottom */}
        <div className="border-t bg-background p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                disabled={!isFullyConnected || isSending}
                className="pr-12 rounded-full h-12"
              />
              
              <DropdownMenu open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" className="p-0">
                  <EmojiPicker
                    theme={Theme.AUTO}
                    onEmojiClick={handleEmojiSelect}
                    width="100%"
                    height="300px"
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Button 
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-full"
              disabled={!newMessage.trim() || !isFullyConnected || isSending}
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SendHorizonal className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    );
  }

  // Regular mobile/desktop view
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          "fixed z-40",
          isMobile ? "bottom-0 left-0 right-0" : "bottom-4 right-4"
        )}
      >
        <Card className={cn(
          "shadow-xl",
          isMobile ? "rounded-b-none h-[70vh]" : "w-96 h-[500px]",
          className
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <h3 className="font-semibold text-sm">{clubName || 'Chat'}</h3>
                {djName && (
                  <span className="text-xs text-muted-foreground">with {djName}</span>
                )}
              </div>
              {isLiveSession && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  Live
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-2">
                {userCount} online
              </span>
              
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={toggleFullScreen}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsMinimized(true)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isFullyConnected && (
            <div className="p-2 bg-yellow-500/10 text-yellow-600 text-sm flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting...
            </div>
          )}

          {/* Messages area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-2"
            style={{ height: isMobile ? 'calc(70vh - 140px)' : '380px' }}
          >
            {messages.map((msg, index) => (
              <div 
                key={msg.id}
                ref={index === messages.length - 1 ? lastMessageRef : undefined}
                className={cn(
                  'flex',
                  msg.sender?.id === session?.user?.id ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.type === 'system' ? (
                  <SystemMessage message={msg.message} timestamp={msg.timestamp} />
                ) : (
                  <div className={cn(
                    'max-w-[80%] p-2 rounded-lg group',
                    msg.sender?.id === session?.user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}>
                    {msg.sender?.id !== session?.user?.id && (
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs font-medium opacity-70">
                          {msg.sender?.name}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-sm break-words">{msg.message}</p>
                    {renderReactions(msg)}
                    
                    <span className="text-xs opacity-50 block mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {typingUsers.length > 0 && (
              <TypingIndicator users={typingUsers} />
            )}
          </div>

          {/* Input area */}
          <div className="border-t p-3">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  disabled={!isFullyConnected || isSending}
                  className="pr-10 rounded-full"
                />
                
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                type="submit"
                size="icon"
                disabled={!newMessage.trim() || !isFullyConnected || isSending}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizonal className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
} 