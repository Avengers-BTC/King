'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Radio, MessageCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useSocket } from '@/contexts/socket-context';
import { getDjChatRoomId } from '@/lib/chat-room-utils';

interface LiveSessionProps {
  djId: string;
  djName: string;
  clubs?: Array<{
    id: string;
    name: string;
  }>;
}

export function LiveSession({ djId, djName, clubs = [] }: LiveSessionProps) {
  const router = useRouter();
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const { socket, djLiveStatus, isDjLive, liveRooms } = useSocket();
  
  // Check if DJ is currently live
  const isLive = isDjLive(djId);

  const handleGoLive = () => {
    if (!selectedClub) {
      toast.error('Please select a club first');
      return;
    }

    const roomId = getDjChatRoomId(djId, selectedClub);
    setCurrentRoomId(roomId);
    djLiveStatus(roomId, true, djName, djId);
    toast.success('You are now live! 🎵');
  };

  const handleEndSession = () => {
    if (!currentRoomId) {
      toast.error('No active session to end');
      return;
    }

    djLiveStatus(currentRoomId, false, djName, djId);
    setCurrentRoomId('');
    toast.info('Live session ended');
  };

  const handleJoinChat = () => {
    const roomId = getDjChatRoomId(djId, selectedClub);
    router.push(`/chat/${roomId}`);
  };

  // For testing, add some mock clubs if none provided
  const availableClubs = clubs.length > 0 ? clubs : [
    { id: 'club1', name: 'Club XYZ' },
    { id: 'club2', name: 'The Venue' },
    { id: 'club3', name: 'Nightclub One' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Session</span>
            {isLive && (
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Club</label>
              <Select
                value={selectedClub}
                onValueChange={setSelectedClub}
                disabled={isLive}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a club" />
                </SelectTrigger>
                <SelectContent>
                  {availableClubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              {!isLive ? (
                <Button
                  onClick={handleGoLive}
                  disabled={!selectedClub}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Radio className="w-4 h-4 mr-2 animate-pulse" />
                  Go Live
                </Button>
              ) : (
                <Button
                  onClick={handleEndSession}
                  variant="destructive"
                >
                  End Session
                </Button>
              )}
              
              {selectedClub && (
                <Button
                  onClick={handleJoinChat}
                  variant="outline"
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Open Chat
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isLive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                Your live session chat is active! Fans can join to interact with you.
              </div>
              
              <Button 
                onClick={handleJoinChat}
                className="w-full"
                size="lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Join Live Chat
              </Button>
              
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Live audience waiting</span>
                </div>
                <div className="flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>Broadcasting</span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                WhatsApp-style full-screen chat experience
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
