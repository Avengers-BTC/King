'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Radio } from 'lucide-react';
import { getDjChatRoomId } from '@/lib/chat-room-utils';

interface FanChatProps {
  djId: string;
  djName?: string;
  isLive?: boolean;
  memberCount?: number;
  clubId?: string;
}

export function FanChat({ djId, djName, isLive = false, memberCount = 0, clubId }: FanChatProps) {
  const router = useRouter();
  const roomId = getDjChatRoomId(djId, clubId);

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MessageCircle className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Fan Chat</h3>
          {isLive && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              LIVE
            </Badge>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {isLive ? (
              <>Connect with {djName} and other fans during this live session</>
            ) : (
              <>Join the community chat for {djName}</>
            )}
          </div>
          
          <Button 
            onClick={() => router.push(`/chat/${roomId}`)}
            className="w-full"
            size="lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Join Chat
          </Button>
          
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{memberCount} members</span>
            </div>
            {isLive && (
              <div className="flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>Live session</span>
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            WhatsApp-style full-screen chat experience
          </div>
        </div>
      </div>
    </Card>
  );
}
