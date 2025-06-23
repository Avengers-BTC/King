import { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/socket-context';
import { Socket } from 'socket.io-client';

interface CustomSocket extends Socket {
  data?: {
    user?: {
      role?: string;
    };
  };
}

interface TypingUser {
  id: string;
  name: string;
  role?: string;
  image?: string;
}

interface OnlineUser {
  id: string;
  name: string;
  role?: string;
}

interface UseChatRoomResult {
  userCount: number;
  typingUsers: TypingUser[];
  onlineUsers: OnlineUser[];
  mutedUsers: Set<string>;
  isDJ: boolean;
  muteUser: (userId: string) => void;
  unmuteUser: (userId: string) => void;
  isConnected: boolean;
  error: string | null;
  resetRoomCount: () => void;
}

export function useChatRoom(roomId: string): UseChatRoomResult {
  const { socket } = useSocket();
  const [userCount, setUserCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [isDJ, setIsDJ] = useState(false);  useEffect(() => {    if (!socket) {
      setIsConnected(false);
      return;
    }

    // Set initial connection state
    setIsConnected(socket.connected);    // Join the room immediately when socket is available
    if (socket.connected) {
      socket.emit('join_room', roomId);
    }    // Handle connection events
    const handleConnect = () => {
      setIsConnected(true);
      // Rejoin room on reconnect
      socket.emit('join_room', roomId);
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
      setUserCount(0);
      setTypingUsers([]);
    };    // Handle room join confirmation
    const handleRoomJoined = () => {
      setIsConnected(true);
    };socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('room_joined', handleRoomJoined);

    // Check if user is DJ
    const customSocket = socket as CustomSocket;
    setIsDJ(customSocket.data?.user?.role === 'DJ');
      // Handle room events
    socket.on('user_count', (count: number) => {
      // Ensure the count is not unreasonable (sometimes Socket.IO can report incorrect counts)
      if (count > 100) {
        return;
      }
      setUserCount(count);
    });
    
    socket.on('error', (data: { message: string }) => setError(data.message));
      // Handle online users updates
    socket.on('online_users', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    // Handle typing updates
    socket.on('user_typing', ({ userId, socketId, userName, userRole }: { 
      userId: string, 
      socketId: string, 
      userName?: string, 
      userRole?: string 
    }) => {
      setTypingUsers(prev => {
        const existing = prev.find(u => u.id === userId);
        if (!existing) {
          return [...prev, { 
            id: userId, 
            name: userName || `User ${userId.slice(0, 8)}`, 
            role: userRole 
          }];
        }
        return prev;
      });
    });

    socket.on('user_stopped_typing', ({ userId }: { userId: string }) => {
      setTypingUsers(prev => prev.filter(u => u.id !== userId));
    });    // Handle moderation events
    socket.on('user_muted', ({ userId }: { userId: string }) => {
      setMutedUsers(prev => new Set(prev).add(userId));
    });

    socket.on('user_unmuted', ({ userId }: { userId: string }) => {
      setMutedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });    // Clean up the update_online_users event listener
    socket.off('update_online_users');

    // Check if user is DJ
    if ((socket as CustomSocket).data?.user?.role === 'DJ') {
      setIsDJ(true);
    }    // Clean up
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('room_joined', handleRoomJoined);
      socket.off('user_count');
      socket.off('error');
      socket.off('online_users');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
      socket.off('user_muted');
      socket.off('user_unmuted');
    };
  }, [socket]);
  // Moderation functions
  const muteUser = (userId: string) => {
    if (socket && (isDJ || (socket as CustomSocket).data?.user?.role === 'DJ')) {
      socket.emit('mod_mute', { roomId, userId });
    }
  };
  const unmuteUser = (userId: string) => {
    if (socket && (isDJ || (socket as CustomSocket).data?.user?.role === 'DJ')) {
      socket.emit('mod_unmute', { roomId, userId });
    }
  };
    // Function to reset room count (for debugging)
  const resetRoomCount = () => {
    if (socket && (isDJ || (socket as CustomSocket).data?.user?.role === 'DJ')) {
      socket.emit('reset_room_count', { roomId });
    }
  };
  
  return {
    userCount,
    isConnected,
    error,
    typingUsers,
    onlineUsers,
    mutedUsers,
    isDJ,
    muteUser,
    unmuteUser,
    resetRoomCount,
  };
}
