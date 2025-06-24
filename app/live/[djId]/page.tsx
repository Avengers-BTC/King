'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Chat } from '@/components/chat';
import { useSocket } from '@/contexts/socket-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radio, Music, Users, Heart, ArrowLeft, Share2, MessageCircle, Volume2 } from 'lucide-react';
import { LiveConnectionStatus } from '@/components/ui/live-connection-status';
import { toast } from 'sonner';
import { getDjChatRoomId } from '@/lib/chat-room-utils';

export default function LiveSessionPage() {
  const { djId } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isConnected, isDjLive } = useSocket();
  const [djData, setDjData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeClub, setActiveClub] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [listeners, setListeners] = useState(0);

  // Fetch DJ data
  useEffect(() => {
    const fetchDj = async () => {
      try {
        const response = await fetch(`/api/djs/${djId}`);
        if (!response.ok) throw new Error('Failed to fetch DJ info');
        
        const data = await response.json();
        setDjData(data);
        setActiveClub(data.currentClub);
      } catch (error) {
        console.error('Error fetching DJ:', error);
        toast.error('Could not load DJ information');
      } finally {
        setIsLoading(false);
      }
    };

    if (djId) {
      fetchDj();
    }
  }, [djId]);

  // Check if DJ is actually live
  useEffect(() => {
    if (!isLoading && djData && !isDjLive(djId as string)) {
      toast.error('This DJ is not currently live');
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [isLoading, djData, isDjLive, djId, router]);

  // Require authentication
  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Navbar />
        <div className="container max-w-4xl mx-auto py-12 px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-center">Sign In Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6">You need to be signed in to join a live session.</p>
              <Button onClick={() => router.push('/login?callbackUrl=' + encodeURIComponent(`/live/${djId}`))}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Navbar />
        <div className="container max-w-6xl mx-auto py-12 px-4">
          <div className="animate-pulse">
            <div className="h-64 rounded-lg bg-app-surface/50 mb-6"></div>
            <div className="h-96 rounded-lg bg-app-surface/50"></div>
          </div>
        </div>
      </div>
    );
  }

  const roomId = getDjChatRoomId(djId as string, activeClub);

  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        {!isConnected && <LiveConnectionStatus />}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* DJ Info Panel */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="relative">
                <img 
                  src={djData?.user?.image || '/default-dj.jpg'} 
                  alt={djData?.user?.name || 'DJ'} 
                  className="w-full h-60 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                
                <div className="absolute top-4 right-4">
                  <div className="live-status-indicator">
                    <div className="live-status-dot"></div>
                    <span>LIVE</span>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-2xl font-bold text-white">{djData?.user?.name}</h1>
                  <div className="flex items-center text-white/80 text-sm mt-1">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{listeners > 0 ? `${listeners} listening` : 'Waiting for listeners'}</span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="px-3 py-1">
                    {djData?.genre || 'Various Genres'}
                  </Badge>
                  
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {activeClub && (
                  <div className="mb-4 p-3 bg-primary/10 rounded-md">
                    <p className="text-sm flex items-center">
                      <Music className="w-4 h-4 mr-2 text-primary" />
                      <span>
                        Playing at <span className="font-semibold">{activeClub}</span>
                      </span>
                    </p>
                  </div>
                )}
                
                <div className="mt-4 flex justify-between gap-2">
                  <Button
                    variant={showChat ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setShowChat(true)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                  <Button
                    variant={!showChat ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setShowChat(false)}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Listen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Chat/Live Panel */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="text-xl flex items-center">
                  {showChat ? (
                    <>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Live Chat
                    </>
                  ) : (
                    <>
                      <Radio className="w-5 h-5 mr-2 animate-pulse" />
                      Live Stream
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-grow p-0">
                {showChat ? (
                  <Chat
                    roomId={roomId}
                    className="h-[600px] border-0"
                    isLiveSession={true}
                  />
                ) : (
                  <div className="h-[600px] flex flex-col items-center justify-center p-6 text-center">
                    <Radio className="w-12 h-12 text-red-500 animate-pulse mb-4" />
                    <h3 className="text-xl font-bold mb-2">Live Audio Coming Soon</h3>
                    <p className="text-muted-foreground">
                      We're working on bringing live audio streams to our platform.
                      For now, enjoy the chat and interaction with other fans!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
