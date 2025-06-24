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
  sender: {
    id: string;
    name: string;
    role?: string;
  };
  timestamp: string;
  reactions?: Record<string, string[]>; // emoji -> [userId1, userId2, ...]
}

export function useChat(roomId: string) {
  const { socket } = useSocket();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
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
      if (data.roomId === roomId && data.messages) {
        setMessages(data.messages);
      }
    });    // Handle messages
    socket.on('new_message', (message: Message) => {
      console.log(`[Chat] Received new message in room ${roomId}:`, message);
      
      // Diagnostics to help troubleshoot message display issues
      console.log(`[Chat] Current user ID: ${session?.user?.id}, Message sender ID: ${message.sender.id}`);
      
      // Play sound for received messages (not from current user)
      if (message.sender.id !== session?.user?.id) {
        ChatSounds.playMessageReceived();
      }
      
      // Dedupe messages by ID in case we get the same message twice
      setMessages((prev) => {
        // Skip if we already have this message
        if (prev.some(m => m.id === message.id)) {
          console.log(`[Chat] Skipping duplicate message with ID: ${message.id}`);
          return prev;
        }
        
        // Check if this is a server-confirmed version of a temp message
        const tempMessageIndex = prev.findIndex(m => 
          m.id.startsWith('temp-') && 
          m.message === message.message &&
          m.sender.id === message.sender.id
        );
        
        if (tempMessageIndex >= 0) {
          console.log(`[Chat] Replacing temp message with server version: ${message.id}`);
          // Replace the temp message with the confirmed one
          const newMessages = [...prev];
          newMessages[tempMessageIndex] = message;
          return newMessages;
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
  }, [socket, roomId]);  const sendMessage = async (message: string) => {
    if (!socket || !session?.user) {
      throw new Error('Cannot send message: Not connected');
    }

    // Parse formatting
    const format = parseMessageFormatting(message);

    const newMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID until server confirms
      message,
      format,
      sender: {
        id: session.user.id,
        name: session.user.name || 'Anonymous',
        role: session.user.role || 'USER',
      },
      timestamp: new Date().toISOString(),
    };

    // Optimistically add message to state
    setMessages(prev => [...prev, newMessage]);// Send message and wait for acknowledgment
    return new Promise<void>((resolve, reject) => {
      try {        const payload = {
          roomId,
          message,
          format,
          sender: newMessage.sender,
        };
        
        // Set a timeout in case the callback never fires
        const timeoutId = setTimeout(() => {
          console.warn('[Chat] Send message acknowledgment timed out');
          resolve(); // Resolve anyway to prevent UI from being stuck
        }, 5000);        socket.emit('send_message', payload, (response: any) => {
          clearTimeout(timeoutId);
          
          if (response && response.success === false) {
            // Remove the temporary message if there was an error
            setMessages(prev => prev.filter(m => m.id !== newMessage.id));
            reject(response);
          } else {
            // Play sound for sent message
            ChatSounds.playMessageSent();
            resolve();
          }
        });} catch (err) {
        reject(err);
      }
    });
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

  const addReaction = (messageId: string, emoji: string) => {
    if (!socket || !session?.user) {
      return;
    }
    
    socket.emit('add_reaction', {
      roomId,
      messageId,
      emoji,
      userId: session.user.id
    });
  };

  const removeReaction = (messageId: string, emoji: string) => {
    if (!socket || !session?.user) {
      return;
    }
    
    socket.emit('remove_reaction', {
      roomId,
      messageId,
      emoji,
      userId: session.user.id
    });
  };
  return {
    messages,
    sendMessage,
    addReaction,
    removeReaction,
    isConnected,
    socket,
  };
}
