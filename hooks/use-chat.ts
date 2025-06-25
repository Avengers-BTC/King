import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/socket-context';
import { useSession } from 'next-auth/react';
import { ChatSounds } from '@/lib/chat-sounds';

interface MessageFormat {
  bold?: [number, number][];
  italic?: [number, number][];
  code?: [number, number][];
  link?: Array<{ range: [number, number], url: string }>;

}

interface Message {
  id: string;
  message: string;
  format?: MessageFormat;
  sender?: {
    id: string;
    name: string;
    role?: string;
    image?: string;
  };
  timestamp: string;
  reactions?: Record<string, string[]>; // emoji -> [userId1, userId2, ...]
}

export function useChat(roomId: string) {
  const { socket } = useSocket();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Function to load message history from database
  const loadMessageHistory = async () => {
    if (!session?.user?.id || isLoadingHistory) {
      console.log(`[Chat] Skipping message history load - no valid session or already loading`);
      return;
    }
    
    setIsLoadingHistory(true);
    try {
      console.log(`[Chat] Loading message history for room ${roomId}`);
      const response = await fetch(`/api/chat/${roomId}?limit=50`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.messages && Array.isArray(data.messages)) {
          console.log(`[Chat] Loaded ${data.messages.length} messages from database for room ${roomId}`);
          setMessages(data.messages);
        } else {
          console.log(`[Chat] No messages found for room ${roomId}`);
          setMessages([]);
        }
      } else if (response.status === 401) {
        console.error(`[Chat] Authentication failed when loading message history. Please log in again.`);
        // Don't show error to user immediately - they might not be logged in yet
        setMessages([]);
      } else {
        console.error(`[Chat] Failed to load message history: ${response.status} ${response.statusText}`);
        setMessages([]);
      }
    } catch (error) {
      console.error(`[Chat] Error loading message history:`, error);
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!socket) {
      setIsConnected(false);
      return;
    }

    // Initialize chat sounds
    ChatSounds.init();

    const handleConnect = () => {
      console.log(`[Chat] Connecting to room ${roomId}`);
      socket.emit('join_room', roomId);
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log(`[Chat] Disconnected from room ${roomId}`);
      setIsConnected(false);
    };

    // Handle initial connection
    handleConnect();    // Set up event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
      // Handle room join confirmation and load messages
    socket.on('room_joined', (data: { roomId: string, messages: Message[] }) => {
      console.log(`[Chat] Successfully joined room ${roomId}`, data);
      if (data.roomId === roomId) {
        // Load message history from database instead of relying on socket data
        loadMessageHistory();
      }
    });    // Handle messages
    socket.on('new_message', (message: Message) => {
      console.log(`[Chat] Received new message in room ${roomId}:`, message);
      
      // Check if message.sender exists before accessing properties
      if (!message.sender || !message.sender.id || message.sender.id === 'undefined' || message.sender.id === 'null') {
        console.error(`[Chat] Received message with undefined sender in room ${roomId}:`, message);
        // Don't skip - create a minimal sender object so UI can still display the message
        message.sender = {
          id: 'unknown',
          name: 'Unknown User'
        };
      }
      
      // Also validate sender name
      if (!message.sender.name || message.sender.name === 'undefined' || message.sender.name === 'null') {
        console.error(`[Chat] Received message with undefined sender name in room ${roomId}:`, message);
        message.sender.name = message.sender.id === 'unknown' ? 'Unknown User' : `User ${message.sender.id.slice(0, 8)}`;
      }
      
      // Diagnostics to help troubleshoot message display issues
      console.log(`[Chat] Current user ID: ${session?.user?.id || 'Unknown'}, Message sender ID: ${message.sender.id || 'Unknown'}`);
      
      // Play sound for received messages (not from current user)
      if (message.sender?.id !== session?.user?.id) {
        ChatSounds.playMessageReceived();
      }
      
      // Dedupe messages by ID in case we get the same message twice
      setMessages((prev) => {
        // Skip if we already have this exact message ID
        if (!message.id) {
          console.error('[Chat] Received message without ID:', message);
          return prev;
        }
        
        const existingMessage = prev.find(m => m.id === message.id);
        if (existingMessage) {
          console.log(`[Chat] Skipping duplicate message with ID: ${message.id}`);
          return prev;
        }
        
        // Don't add messages from the current user that were sent via the API
        // They should already be in the database and will be loaded via message history
        if (message.sender?.id === session?.user?.id) {
          // For messages from current user, only add if it's not already in history
          const userMessageExists = prev.find(m => 
            m.message === message.message && 
            m.sender?.id === session?.user?.id &&
            Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000 // Within 5 seconds
          );
          
          if (userMessageExists) {
            console.log(`[Chat] Skipping duplicate message from current user: ${message.id}`);
            return prev;
          }
        }
        
        // Otherwise add as a new message
        return [...prev, message];
      });
    });// Handle room errors
    socket.on('error', (error: { message: string }) => {
      console.error(`[Chat] Room error:`, error);
      setMessages(prev => {
        // If there was a temporary message at the end, remove it
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.id.startsWith('temp-')) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    });    // Handle reactions
    socket.on('reaction_added', ({ messageId, emoji, userId }: { messageId: string, emoji: string, userId: string }) => {
      setMessages(prev => 
        prev.map(msg => {
          if (msg.id === messageId) {
            const reactions = msg.reactions || {};
            const userIds = reactions[emoji] || [];
            
            if (!userIds.includes(userId)) {
              return {
                ...msg,
                reactions: {
                  ...reactions,
                  [emoji]: [...userIds, userId]
                }
              };
            }
          }
          return msg;
        })
      );
    });

    socket.on('reaction_removed', ({ messageId, emoji, userId }: { messageId: string, emoji: string, userId: string }) => {
      setMessages(prev => 
        prev.map(msg => {
          if (msg.id === messageId && msg.reactions && msg.reactions[emoji]) {
            const updatedUserIds = msg.reactions[emoji].filter(id => id !== userId);
            const updatedReactions = { ...msg.reactions };
            
            if (updatedUserIds.length === 0) {
              delete updatedReactions[emoji];
            } else {
              updatedReactions[emoji] = updatedUserIds;
            }
            
            return {
              ...msg,
              reactions: updatedReactions
            };
          }
          return msg;
        })
      );
    });
    return () => {
      console.log(`[Chat] Cleaning up room ${roomId}`);
      socket.emit('leave_room', roomId);
      socket.off('new_message');
      socket.off('room_joined');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error');
      socket.off('reaction_added');
      socket.off('reaction_removed');
      setIsConnected(false);
    };
  }, [socket, roomId, session?.user?.id]);  const sendMessage = async (message: string) => {
    if (!socket || !session?.user) {
      throw new Error('Cannot send message: Not connected');
    }

    // Parse formatting
    const format = parseMessageFormatting(message);

    try {
      // First, save message to database
      const response = await fetch(`/api/chat/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          format,
          type: 'TEXT'
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Failed to save message to database: ${response.status} ${response.statusText}`);
      }

      const { message: savedMessage } = await response.json();

      // Then broadcast via socket (the message will come back via socket with the real ID)
      const payload = {
        roomId,
        message,
        format,
        senderId: session.user.id,
        senderName: session.user.name || 'Anonymous',
        senderRole: session.user.role || 'USER',
        senderImage: session.user.image || undefined,
        messageId: savedMessage.id, // Use the database ID
        timestamp: savedMessage.timestamp
      };

      console.log('[Chat] Sending message with payload:', payload);

      return new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          console.warn('[Chat] Send message acknowledgment timed out');
          resolve(); // Resolve anyway to prevent UI from being stuck
        }, 5000);

        try {
          socket.emit('send_message', payload, (response: any) => {
            clearTimeout(timeoutId);
            
            if (response && response.success === false) {
              reject(response);
            } else {
              // Play sound for sent message
              ChatSounds.playMessageSent();
              resolve();
            }
          });
        } catch (err) {
          clearTimeout(timeoutId);
          reject(err);
        }
      });
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      throw error;
    }
  };

  // Helper function to parse message formatting
  const parseMessageFormatting = (message: string): MessageFormat | undefined => {
    const format: MessageFormat = {};
    let hasFormatting = false;
    
    // Parse bold (surrounded by **)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let boldMatch;
    const boldRanges: [number, number][] = [];
    
    while ((boldMatch = boldRegex.exec(message)) !== null) {
      const start = boldMatch.index;
      const end = start + boldMatch[0].length;
      boldRanges.push([start, end]);
      hasFormatting = true;
    }
    
    if (boldRanges.length > 0) {
      format.bold = boldRanges;
    }
    
    // Parse italic (surrounded by *)
    const italicRegex = /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g;
    let italicMatch;
    const italicRanges: [number, number][] = [];
    
    while ((italicMatch = italicRegex.exec(message)) !== null) {
      const start = italicMatch.index;
      const end = start + italicMatch[0].length;
      italicRanges.push([start, end]);
      hasFormatting = true;
    }
    
    if (italicRanges.length > 0) {
      format.italic = italicRanges;
    }
    
    // Parse code (surrounded by `)
    const codeRegex = /`(.*?)`/g;
    let codeMatch;
    const codeRanges: [number, number][] = [];
    
    while ((codeMatch = codeRegex.exec(message)) !== null) {
      const start = codeMatch.index;
      const end = start + codeMatch[0].length;
      codeRanges.push([start, end]);
      hasFormatting = true;
    }
    
    if (codeRanges.length > 0) {
      format.code = codeRanges;
    }
    
    // Parse links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch;
    const linkRanges: Array<{ range: [number, number], url: string }> = [];
    
    while ((linkMatch = linkRegex.exec(message)) !== null) {
      const start = linkMatch.index;
      const end = start + linkMatch[0].length;
      const url = linkMatch[2];
      linkRanges.push({ range: [start, end], url });
      hasFormatting = true;
    }
    
    if (linkRanges.length > 0) {
      format.link = linkRanges;
    }
    
    return hasFormatting ? format : undefined;
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!socket || !session?.user) {
      return;
    }
    
    try {
      // Save to database first
      const response = await fetch(`/api/chat/${roomId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          emoji,
          action: 'add'
        }),
      });

      if (response.ok) {
        // Then emit via socket for real-time updates
        socket.emit('add_reaction', {
          roomId,
          messageId,
          emoji,
          userId: session.user.id
        });
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!socket || !session?.user) {
      return;
    }
    
    try {
      // Save to database first
      const response = await fetch(`/api/chat/${roomId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          emoji,
          action: 'remove'
        }),
      });

      if (response.ok) {
        // Then emit via socket for real-time updates
        socket.emit('remove_reaction', {
          roomId,
          messageId,
          emoji,
          userId: session.user.id
        });
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };
  return {
    messages,
    sendMessage,
    addReaction,
    removeReaction,
    isConnected,
    isLoadingHistory,
    socket,
  };
}
