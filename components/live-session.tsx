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
import { Radio, MessageCircle, Users, Calendar, Clock, Activity } from 'lucide-react';
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

interface Club {
  id: string;
  name: string;
  image?: string;
  location?: string;
}

export function LiveSession({ djId, djName, clubs = [] }: LiveSessionProps) {
  const router = useRouter();
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [availableClubs, setAvailableClubs] = useState<Club[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);
  const [listeners, setListeners] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const { socket, djLiveStatus, isDjLive, liveRooms } = useSocket();
  
  // Check if DJ is currently live
  const isLive = isDjLive(djId);

  // Fetch available clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        if (clubs.length > 0) {
          setAvailableClubs(clubs);
          setIsLoadingClubs(false);
          return;
        }

        const response = await fetch('/api/clubs');
        if (response.ok) {
          const data = await response.json();
          setAvailableClubs(data.clubs || []);
        } else {
          // Fallback to mock data if API fails
          setAvailableClubs([
            { id: 'club1', name: 'Club XYZ', location: 'Downtown' },
            { id: 'club2', name: 'The Venue', location: 'City Center' },
            { id: 'club3', name: 'Nightclub One', location: 'Uptown' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching clubs:', error);
        // Fallback to mock data
        setAvailableClubs([
          { id: 'club1', name: 'Club XYZ', location: 'Downtown' },
          { id: 'club2', name: 'The Venue', location: 'City Center' },
          { id: 'club3', name: 'Nightclub One', location: 'Uptown' },
        ]);
      } finally {
        setIsLoadingClubs(false);
      }
    };

    fetchClubs();
  }, [clubs]);

  // Track session duration when live
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLive) {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } else {
      setSessionDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive]);

  // Listen for room updates to track listeners
  useEffect(() => {
    if (socket && currentRoomId) {
      socket.on('room_users_update', (data) => {
        if (data.roomId === currentRoomId) {
          setListeners(data.userCount || 0);
        }
      });

      return () => {
        socket.off('room_users_update');
      };
    }
  }, [socket, currentRoomId]);

  const handleGoLive = async () => {
    if (!selectedClub) {
      toast.error('Please select a club first');
      return;
    }

    try {
      const roomId = getDjChatRoomId(djId, selectedClub);
      setCurrentRoomId(roomId);
      
      // Start live session via API
      const response = await fetch(`/api/live/${djId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'start',
          clubId: selectedClub 
        }),
      });

      if (response.ok) {
        djLiveStatus(roomId, true, djName, djId);
        toast.success('You are now live! 🎵');
      } else {
        throw new Error('Failed to start session');
      }
    } catch (error) {
      console.error('Error going live:', error);
      toast.error('Failed to start live session');
    }
  };

  const handleEndSession = async () => {
    if (!currentRoomId) {
      toast.error('No active session to end');
      return;
    }

    try {
      // End live session via API
      const response = await fetch(`/api/live/${djId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'end'
        }),
      });

      if (response.ok) {
        djLiveStatus(currentRoomId, false, djName, djId);
        setCurrentRoomId('');
        setListeners(0);
        toast.info('Live session ended');
      } else {
        throw new Error('Failed to end session');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
    }
  };

  const handleJoinChat = () => {
    const roomId = getDjChatRoomId(djId, selectedClub);
    router.push(`/chat/${roomId}`);
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Session</span>
            {isLive && (
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="animate-pulse">
                  LIVE
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDuration(sessionDuration)}
                </Badge>
              </div>
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
                disabled={isLive || isLoadingClubs}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingClubs ? "Loading clubs..." : "Select a club"} />
                </SelectTrigger>
                <SelectContent>
                  {availableClubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      <div className="flex flex-col">
                        <span>{club.name}</span>
                        {club.location && (
                          <span className="text-xs text-muted-foreground">{club.location}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLive && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-md">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Listeners</div>
                  <div className="text-xl font-bold flex items-center justify-center gap-1">
                    <Users className="w-4 h-4" />
                    {listeners}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="text-xl font-bold flex items-center justify-center gap-1">
                    <Activity className="w-4 h-4" />
                    {formatDuration(sessionDuration)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {!isLive ? (
                <Button
                  onClick={handleGoLive}
                  disabled={!selectedClub || isLoadingClubs}
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
                  <span>{listeners} listening</span>
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
