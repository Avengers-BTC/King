'use client';

import { useState, useEffect } from 'react';
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
import { Radio } from 'lucide-react';
import { Chat } from '@/components/chat';
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
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [showChat, setShowChat] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const { socket, djLiveStatus, isDjLive, liveRooms } = useSocket();
  
  // Check if DJ is currently live
  const isLive = isDjLive(djId);



  // Auto-show chat when DJ goes live
  useEffect(() => {
    if (isLive) {
      setShowChat(true);
    }
  }, [isLive]);

  const handleGoLive = () => {
    if (!selectedClub) {
      toast.error('Please select a club first');
      return;
    }

    const roomId = getDjChatRoomId(djId, selectedClub);
    setCurrentRoomId(roomId);
    djLiveStatus(roomId, true, djName, djId);
    setShowChat(true);
    toast.success('You are now live! 🎵');
  };

  const handleEndSession = () => {
    if (!currentRoomId) {
      toast.error('No active session to end');
      return;
    }

    djLiveStatus(currentRoomId, false, djName, djId);
    setShowChat(false);
    setCurrentRoomId('');
    toast.info('Live session ended');
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

            <div className="flex justify-end">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {showChat && (
        <Card>
          <CardHeader>
            <CardTitle>Live Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <Chat
              roomId={getDjChatRoomId(djId, selectedClub)}
              className="h-[400px] border rounded-lg"
              isLiveSession={isLive}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
