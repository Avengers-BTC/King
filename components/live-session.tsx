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
import { AgoraStream } from '@/components/agora-stream';

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
  const [showPreview, setShowPreview] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const { socket, djLiveStatus, isDjLive, liveRooms } = useSocket();
  
  // Check if DJ is currently live
  const isLive = isDjLive(djId);

  const handleStartLiveSetup = () => {
    if (!selectedClub) {
      toast.error('Please select a club first');
      return;
    }
    setShowPreview(true);
  };

  const handleGoLive = () => {
    if (!selectedClub) {
      toast.error('Please select a club first');
      return;
    }

    const roomId = getDjChatRoomId(djId, selectedClub);
    setCurrentRoomId(roomId);
    djLiveStatus(roomId, true, djName, djId);
    setStreaming(true);
    toast.success('Starting live session... 🎵');
  };

  const handleEndSession = () => {
    if (!currentRoomId) {
      toast.error('No active session to end');
      return;
    }

    djLiveStatus(currentRoomId, false, djName, djId);
    setCurrentRoomId('');
    setStreaming(false);
    setShowPreview(false);
    toast.info('Live session ended');
  };

  const handleJoinChat = () => {
    const roomId = getDjChatRoomId(djId, selectedClub);
    router.push(`/chat/${roomId}`);
  };

  const handleStreamStarted = () => {
    setStreaming(true);
  };

  const handleStreamEnded = () => {
    setStreaming(false);
    if (isLive) {
      handleEndSession();
    }
  };

  // For testing, add some mock clubs if none provided
  const availableClubs = clubs.length > 0 ? clubs : [
    { id: 'club1', name: 'Club XYZ' },
    { id: 'club2', name: 'The Venue' },
    { id: 'club3', name: 'Nightclub One' },
  ];

  if (showPreview || streaming) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Live Session Setup</span>
              {streaming && (
                <Badge variant="destructive" className="animate-pulse">
                  LIVE
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Stream Preview/Live */}
              <div className="border rounded-lg p-4 bg-black/5">
                <AgoraStream 
                  djId={djId} 
                  isHost={true}
                  onStreamStarted={handleStreamStarted}
                  onStreamEnded={handleStreamEnded}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex gap-2">
                    <Radio className="w-3 h-3" />
                    {selectedClub ? availableClubs.find(c => c.id === selectedClub)?.name : 'No club selected'}
                  </Badge>
                  {streaming && (
                    <Badge variant="secondary" className="flex gap-2">
                      <Users className="w-3 h-3" />
                      Viewers: 0
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  {!streaming ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => setShowPreview(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleGoLive}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Go Live
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleEndSession}
                      variant="destructive"
                    >
                      End Live Session
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {streaming && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your live session is active! Connect with your fans in the chat.
                </p>
                <Button onClick={handleJoinChat} variant="secondary">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Open Live Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start a Live Session</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Club</label>
            <Select
              value={selectedClub}
              onValueChange={setSelectedClub}
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

          <div className="space-y-4">
            <Button
              onClick={handleStartLiveSetup}
              disabled={!selectedClub}
              className="w-full bg-red-500 hover:bg-red-600"
              size="lg"
            >
              <Radio className="w-4 h-4 mr-2" />
              Start Live Video
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Going live will notify your followers and allow them to join your session
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
