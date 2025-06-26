'use client';

import { useEffect, useState, useRef } from 'react';
import { EnhancedMobileChat } from '@/components/enhanced-mobile-chat';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/contexts/socket-context';
import { getDjChatRoomId } from '@/lib/chat-room-utils';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LiveChatProps {
  clubId: string;
  clubName: string;
  currentDj?: {
    id: string;
    name: string;
  };
}

export function LiveChat({ clubId, clubName, currentDj }: LiveChatProps) {
  const { data: session } = useSession();
  const { socket, liveRooms } = useSocket();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  
  // Use unified room ID if there's a DJ, otherwise use club room
  const roomId = currentDj ? getDjChatRoomId(currentDj.id, clubId) : `club-${clubId}`;
  const isRoomLive = liveRooms.has(roomId) || (currentDj && liveRooms.has(getDjChatRoomId(currentDj.id)));

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!currentDj) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {isMobile ? (
        <div className="p-4 text-center space-y-4 border rounded-lg bg-muted/50">
          <div className="text-sm text-muted-foreground">
            For the best mobile chat experience
          </div>
          <Button 
            onClick={() => router.push(`/chat/${roomId}`)}
            className="w-full"
            size="lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Open Full Chat
          </Button>
          <div className="text-xs text-muted-foreground">
            WhatsApp-style full-screen experience
          </div>
        </div>
      ) : (
        <EnhancedMobileChat
          roomId={roomId}
          className="border rounded-lg"
        />
      )}
    </div>
  );
}
