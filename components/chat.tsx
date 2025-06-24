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
  const [messages, setMessages] = useState<Message[]>([]);
  const { sendMessage, addReaction, removeReaction, isConnected: chatConnected } = useChat(roomId);
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

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
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
  const updateMessageStatus = (messageId: string, newStatus: 'sending' | 'sent' | 'delivered' | 'failed') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: newStatus }
        : msg
    ));
  };
  // Message sending handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event propagation
    
    if (!newMessage.trim() || isSending || !socket || !session?.user) return;

    try {
      const messageToSend = newMessage.trim();
      setIsSending(true);
      
      // Create a temporary message ID
      const tempId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Add message to local state immediately with 'sending' status
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
      
      // Clear the input field right away for better UX
      setNewMessage('');
      
      // Add message to local state
      setMessages(prev => [...prev, tempMessage]);
      
      // Clear typing indicator immediately when message is sent
      if (isTyping) {
        setIsTyping(false);
        socket.emit('typing_end', roomId);
      }
      
      // Send the message with a timeout
      const messagePromise = sendMessage(messageToSend);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Message sending timed out'));
        }, 8000);
      });
      
      try {
        await Promise.race([messagePromise, timeoutPromise]);
        updateMessageStatus(tempId, 'sent');
      } catch (error) {
        console.warn('[Chat] Message sending failed:', error);
        updateMessageStatus(tempId, 'failed');
      }
      
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
  };  const renderMessageActions = (msg: Message) => {
    if (!isDJ || !msg.sender || msg.sender.id === session?.user?.id) return null;

    const isMuted = mutedUsers.has(msg.sender.id);
    const senderName = msg.sender.name;
    const senderId = msg.sender.id;

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

  // Emoji reaction options
  const reactionEmojis = ['👍', '❤️', '😂', '🔥', '👏', '🎵', '🙌'];

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

  // Format message content
  const renderFormattedMessage = (msg: Message) => {
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

  return (
    <Card className="chat-container overflow-hidden">
      {/* Connection status */}
      {!isFullyConnected && (
        <div className="p-2 bg-yellow-500/10 text-yellow-600 text-sm flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting to chat...
        </div>
      )}

      {/* Chat messages area */}
      <ScrollArea ref={scrollRef} className="h-[calc(100vh-10rem)] p-4">
        {messages.map((msg, index) => (
          <div 
            key={msg.id ?? index}
            className="flex flex-col p-2"
          >
            {msg.type === 'system' ? (
              <SystemMessage message={msg.message} timestamp={msg.timestamp} />
            ) : (
              <div className="chat-message">
                {/* Sender name with color */}
                {msg.sender && (
                  <div 
                    className="chat-message-sender"
                    data-user-index={parseInt(msg.sender.id.slice(-1), 16) % 6}
                  >
                    {msg.sender.name}
                  </div>
                )}

                {/* Message content */}
                <div className="mt-1">
                  {renderFormattedMessage(msg)}
                </div>

                {/* Message status for sending state */}
                {msg.status && (
                  <div className="text-xs opacity-70 mt-1">
                    <MessageStatus 
                      status={msg.status} 
                      timestamp={msg.timestamp}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-end gap-2 mt-2 px-3">
            <TypingIndicator users={typingUsers} />
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <div className="chat-input-area">
        <form onSubmit={handleSendMessage} method="post" className="flex gap-2 p-4">
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
                  e.stopPropagation();
                  if (newMessage.trim() && isFullyConnected && !isSending) {
                    handleSendMessage(e as React.FormEvent);
                  }
                }
              }}
              className="pr-10"
              disabled={!isFullyConnected || isSending}
            />
            
            {/* Emoji picker */}
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

          {/* Send button */}
          <Button 
            type="submit"
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
