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
import { GlowAnimation } from '@/components/ui/glow-animation';
import { GlowMessage } from '@/components/ui/glow-message';
import { UserAvatar } from '@/components/ui/user-avatar';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { MessageStatus } from '@/components/ui/message-status';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Loader2, 
  Users, 
  MoreVertical, 
  Volume2, 
  VolumeX,
  RefreshCw,
  User,
  UserCheck,
  UsersRound,
  Smile,
  SendHorizonal,
  ChevronDown,
  MoveRight,
  Music
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { SystemMessage } from '@/components/ui/system-message';
import { ChatDiagnosticTool } from '@/components/chat-diagnostic-tool';

interface ChatProps {
  roomId: string;
  className?: string;
}

export function Chat({ roomId, className }: ChatProps) {
  const { messages, sendMessage, addReaction, removeReaction, isConnected: chatConnected } = useChat(roomId);
  const { socket } = useSocket();
  const { userCount, isConnected: roomConnected, typingUsers, onlineUsers, isDJ, mutedUsers, muteUser, unmuteUser, resetRoomCount } = useChatRoom(roomId);  
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Calculate connection state
  const isFullyConnected = socket?.connected && chatConnected && roomConnected;

  // Log connection state changes
  useEffect(() => {
    console.log(`[Chat] Connection state for room ${roomId}:`, {
      socketConnected: socket?.connected,
      chatConnected,
      roomConnected,
      overall: isFullyConnected
    });
    
    // Show toast notification on disconnect
    if (!isFullyConnected && socket) {
      // Don't show a toast on initial load
      if (socket.connected === false) {
        toast.error("Chat disconnected. Attempting to reconnect...");
      }
    }
  }, [socket?.connected, chatConnected, roomConnected, roomId, isFullyConnected]);
  useEffect(() => {
    if (!socket || !chatConnected) {
      console.log(`[Chat] Room ${roomId}: Not connected`);
      return;
    }

    console.log(`[Chat] Room ${roomId}: Setting up connection`);

    // Join room
    socket.emit('join_room', roomId);

    // Handle room events
    const handleRoomJoined = (data: { roomId: string }) => {
      if (data.roomId === roomId) {
        console.log(`[Chat] Successfully joined room ${roomId}`);
        
        // If we're a DJ, send live status
        if (session?.user?.role === 'DJ') {
          console.log(`[Chat] Room ${roomId}: Sending DJ live status`);
          socket.emit('dj_live', { roomId, isLive: true });
        }
      }
    };

    const handleError = (error: { message: string }) => {
      console.error(`[Chat] Room ${roomId} error:`, error);
      toast.error(error.message);
    };

    socket.on('room_joined', handleRoomJoined);
    socket.on('error', handleError);

    // Cleanup
    return () => {
      console.log(`[Chat] Room ${roomId}: Cleaning up listeners`);
      socket.off('room_joined', handleRoomJoined);
      socket.off('error', handleError);
    };
  }, [socket, chatConnected, roomId, session?.user?.role, toast]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node) &&
        showEmojiPicker
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Track user join/leave events
  const [systemMessages, setSystemMessages] = useState<Array<{
    id: string;
    message: string;
    timestamp: string;
    type: 'join' | 'leave' | 'info';
  }>>([]);

  // Add event listeners for user join/leave
  useEffect(() => {
    if (!socket || !chatConnected) return;
    
    const handleUserJoined = (data: { 
      user: { id: string; name?: string; role?: string };
      message: string;
      timestamp: string;
      roomId: string;
    }) => {
      if (data.roomId !== roomId) return;
      
      // Add system message
      const userName = data.user.name || `User ${data.user.id.slice(0, 8)}`;
      const message = data.message || `${data.user.role === 'DJ' ? 'DJ' : 'User'} ${userName} joined the chat`;
        // Generate a unique ID with random component to prevent duplicates
      const uniqueId = `join_${data.user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setSystemMessages(prev => [
        ...prev,
        {
          id: uniqueId,
          message,
          timestamp: data.timestamp,
          type: 'join'
        }
      ]);
      
      // Play sound
      if (data.user.role === 'DJ') {
        // Special sound for DJ joining
        ChatSounds.playDJJoined();
      } else {
        ChatSounds.playUserJoined();
      }
    };
    
    const handleUserLeft = (data: { 
      userId: string;
      userName?: string;
      roomId: string;
      timestamp?: string;
    }) => {
      if (data.roomId !== roomId) return;
      
      const userName = data.userName || `User ${data.userId.slice(0, 8)}`;
        // Generate a unique ID with random component to prevent duplicates
      const uniqueId = `leave_${data.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setSystemMessages(prev => [
        ...prev,
        {
          id: uniqueId,
          message: `${userName} left the chat`,
          timestamp: data.timestamp || new Date().toISOString(),
          type: 'leave'
        }
      ]);
    };
    
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    
    return () => {
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
    };
  }, [socket, chatConnected, roomId]);
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

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_end', roomId);
    }, 1000);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const cursorPosition = inputRef.current?.selectionStart || newMessage.length;
    const textBeforeCursor = newMessage.substring(0, cursorPosition);
    const textAfterCursor = newMessage.substring(cursorPosition);
    
    // Insert emoji at cursor position
    const updatedMessage = textBeforeCursor + emoji + textAfterCursor;
    setNewMessage(updatedMessage);
    
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
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !socket || !session?.user) return;

    try {
      const messageToSend = newMessage.trim();
      setIsSending(true);
      
      // Set a timeout to prevent the UI from being stuck indefinitely
      const messageTimeout = setTimeout(() => {
        console.warn('[Chat] Message sending timed out');
        setIsSending(false);
      }, 8000);
      
      // Clear typing indicator immediately when message is sent
      if (isTyping) {
        setIsTyping(false);
        socket.emit('typing_end', roomId);
      }
      
      // Clear the input field right away for better UX
      setNewMessage('');
      
      // Send the message
      await sendMessage(messageToSend);
      clearTimeout(messageTimeout);
      
      // Focus input after sending
      inputRef.current?.focus();
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      // Add a small delay before enabling the input again to prevent double-sends
      setTimeout(() => {
        setIsSending(false);
      }, 300);
    }
  };

  const renderMessageActions = (msg: typeof messages[0]) => {
    if (!isDJ || msg.sender.id === session?.user?.id) return null;

    const isMuted = mutedUsers.has(msg.sender.id);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              if (isMuted) {
                unmuteUser(msg.sender.id);
                toast.success(`Unmuted ${msg.sender.name}`);
              } else {
                muteUser(msg.sender.id);
                toast.success(`Muted ${msg.sender.name}`);
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
  const renderFormattedMessage = (msg: typeof messages[0]) => {
    if (!msg.format) {
      return <div className="mt-1 break-words">{msg.message}</div>;
    }
    
    // Create a copy of the message to modify
    let formattedText = msg.message;
    
    // Process formatting - we'll just use regex to identify and replace formatting
    
    // Bold formatting (**text**)
    if (msg.format.bold) {
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    }
    
    // Italic formatting (*text*)
    if (msg.format.italic) {
      formattedText = formattedText.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<i>$1</i>');
    }
    
    // Code formatting (`text`)
    if (msg.format.code) {
      formattedText = formattedText.replace(/`(.*?)`/g, '<code>$1</code>');
    }
    
    // Link formatting ([text](url))
    if (msg.format.link) {
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

  // Emoji reaction options
  const reactionEmojis = ['👍', '❤️', '😂', '🔥', '👏', '🎵', '🙌'];
  
  // Render message reactions
  const renderReactions = (msg: typeof messages[0]) => {
    if (!msg.reactions || Object.keys(msg.reactions).length === 0) {
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

  return (
    <Card className={cn("flex flex-col h-full rounded-none md:rounded-xl", className)}>
      <div className="flex items-center gap-3 p-4 border-b bg-background/50 backdrop-blur-sm">
        <div className="relative">
          <GlowAnimation
            size="md"
            className={cn(
              "bg-red-500",
              isFullyConnected && "bg-green-500"
            )}
          />
          {isFullyConnected && (
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Live Chat</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs animate-fade-in">
              <Users className="h-3 w-3 mr-1" />
              {userCount} online
            </Badge>
            {typingUsers.length > 0 && (
              <Badge variant="secondary" className="text-xs animate-pulse">
                <div className="w-2 h-2 rounded-full bg-primary mr-1 animate-ping" />
                {typingUsers.length} typing
              </Badge>
            )}
          </div>
        </div>        <div className="flex items-center gap-1">
          {isDJ && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setIsResetting(true);
                  resetRoomCount();
                  setTimeout(() => setIsResetting(false), 1000);
                }}
                disabled={isResetting}
              >
                <RefreshCw className={cn("h-4 w-4", isResetting && "animate-spin")} />
              </Button>
              
              <ChatDiagnosticTool roomId={roomId} />
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1 h-8 px-2 hover:bg-background/50"
              >
                <Users className="h-4 w-4" />
                <span>{onlineUsers.length}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="p-3">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Online Users ({onlineUsers.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {onlineUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          user={user} 
                          size="sm" 
                          showRole={true}
                        />
                        <div>
                          <span className="text-sm font-medium">{user.name}</span>
                          {user.role === 'DJ' && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Music className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-muted-foreground">DJ</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  ))}
                  {onlineUsers.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No other users online
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">          {/* System messages - filter duplicates */}
          {systemMessages
            .filter((msg, index, self) => {
              // Keep only the last join message for each user
              if (msg.type === 'join' && msg.id.startsWith('join_')) {
                const userId = msg.id.split('_')[1]; // Extract user ID from the message ID
                const lastIndexForUser = self
                  .map((m, i) => m.id.startsWith(`join_${userId}`) ? i : -1)
                  .filter(i => i !== -1)
                  .pop();
                return index === lastIndexForUser;
              }
              return true; // Keep all other messages
            })
            .map((sysMsg) => (
              <SystemMessage 
                key={sysMsg.id}
                message={sysMsg.message}
                timestamp={sysMsg.timestamp}
                type={sysMsg.type}
                className="animate-float"
              />
            ))}
          
          
          {/* Chat messages */}
          {messages.map((msg) => {
            const isSender = msg.sender.id === session?.user?.id;
            const isNew = Date.now() - new Date(msg.timestamp).getTime() < 5000;
            
            return (              <div
                key={msg.id}
                className={cn(
                  'flex gap-2 max-w-[80vw]',
                  isSender ? 'ml-auto flex-row-reverse justify-start' : 'mr-auto'
                )}
              >
                {!isSender && (
                  <UserAvatar 
                    user={msg.sender} 
                    size="sm" 
                    className="mt-1"
                  />
                )}
                  <div className={cn('flex-1 flex', isSender ? 'justify-end' : 'justify-start')}>
                  <GlowMessage 
                    isSender={isSender} 
                    animate={isNew}
                    className={cn(
                      'group relative px-4 py-3 rounded-3xl max-w-[80vw] min-w-[40px] text-sm',
                      'bg-black', // Always black bubble
                      'text-white', // Message text is white
                      'whitespace-pre-line break-words',
                      'shadow-lg', // Soft box-shadow
                      isNew ? 'animate-fade-in-up' : '', // Animation for new messages
                      isSender ? 'ml-2' : 'mr-2', // Space for bubble tail
                      'touch:p-5' // Extra padding for touch
                    )}
                  >
                    {/* Bubble tail */}
                    {!isSender && (
                      <span className="absolute -left-2 bottom-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-black" />
                    )}
                    {isSender && (
                      <span className="absolute -right-2 bottom-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-black" />
                    )}
                    <span
                      className="block text-xs font-semibold mb-1"
                      style={{ color: isSender ? '#ffd54f' : getUserColor(msg.sender.id) }} // Gold for self, color for others
                    >
                      {msg.sender.name}
                    </span>
                    <span className="block text-base leading-snug">
                      {msg.message}
                    </span>
                  </GlowMessage>
                </div>
              </div>
            );
          })}
            {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/70 max-w-[60%] border border-secondary shadow-sm">
              <div className="flex -space-x-2">
                {typingUsers.slice(0, 3).map((user) => (
                  <UserAvatar 
                    key={user.id}
                    user={user}
                    size="sm"
                    className="border-2 border-background"
                  />
                ))}
              </div>
              
              <div className="text-sm font-medium">
                {typingUsers.length === 1 && (
                  <span>{typingUsers[0].name} is typing</span>
                )}
                {typingUsers.length === 2 && (
                  <span>{typingUsers[0].name} and {typingUsers[1].name} are typing</span>
                )}
                {typingUsers.length === 3 && (
                  <span>{typingUsers[0].name}, {typingUsers[1].name}, and {typingUsers[2].name} are typing</span>
                )}
                {typingUsers.length > 3 && (
                  <span>{typingUsers[0].name}, {typingUsers[1].name}, and {typingUsers.length - 2} others are typing</span>
                )}
                <span className="inline-flex ml-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-75">.</span>
                  <span className="animate-bounce delay-150">.</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <TypingIndicator
          users={typingUsers}
          currentUserId={session?.user?.id}
          className="mx-4 mb-2"
        />
      )}

      {/* Chat input */}
      <form onSubmit={handleSendMessage} className={cn(
        'flex items-center gap-2 p-4 border-t bg-background/50 backdrop-blur-sm',
        !isFullyConnected && 'opacity-50 pointer-events-none'
      )}>
        <div className="flex-1 relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
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
                placeholder={
                  !isFullyConnected 
                    ? "Connecting..." 
                    : mutedUsers.has(session?.user?.id as string) 
                      ? "You are muted" 
                      : "Type a message..."
                }
                className="w-full pr-10 rounded-full py-6 pl-5 border-primary/20 focus-visible:ring-primary/30 shadow-sm"
                disabled={!isFullyConnected || isSending || mutedUsers.has(session?.user?.id as string)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-secondary/80"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={!isFullyConnected || mutedUsers.has(session?.user?.id as string)}
              >
                <Smile className="h-5 w-5 text-primary/70 hover:text-primary" />
              </Button>
            </div>
            <Button 
              type="submit" 
              disabled={!isFullyConnected || isSending || !newMessage.trim() || mutedUsers.has(session?.user?.id as string)}
              className={cn(
                "rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-md",
                isSending ? "opacity-70" : ""
              )}
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : !isFullyConnected ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SendHorizonal className="h-5 w-5 animate-pulse-glow" />
              )}
            </Button>
          </div>
          {showEmojiPicker && (
            <div 
              className="absolute bottom-full mb-2 z-50 right-0 sm:right-auto"
              ref={emojiPickerRef}
            >
              <div className="p-1 bg-card border rounded-lg shadow-lg">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={window.innerWidth < 640 ? window.innerWidth - 20 : 300}
                  height={350}
                  theme={Theme.AUTO}
                  searchPlaceHolder="Search emoji..."
                  previewConfig={{
                    showPreview: window.innerWidth >= 640
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </Card>
  );
}
