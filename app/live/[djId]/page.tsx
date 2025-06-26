'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

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
  const [listeners, setListeners] = useState(0);
  
  // State for user following status - MOVED TO TOP
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);



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

  // Check following status for logged in users
  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (session?.user?.role === 'USER' && djId) {
        try {
          const response = await fetch(`/api/djs/${djId}/following`);
          if (response.ok) {
            const data = await response.json();
            setIsFollowing(data.isFollowing);
          }
        } catch (error) {
          console.error('Error checking following status:', error);
        }
      }
    };

    checkFollowingStatus();
  }, [session, djId]);

  // Require authentication
  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!session?.user || session.user.role !== 'USER') return;
    
    setFollowingLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/djs/${djId}/follow`, { method });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? 'Unfollowed DJ' : 'Following DJ');
      } else {
        throw new Error('Failed to update following status');
      }
    } catch (error) {
      console.error('Error updating following status:', error);
      toast.error('Failed to update following status');
    } finally {
      setFollowingLoading(false);
    }
  };

  // Allow non-authenticated users to view but not participate
  if (!session) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Navbar />
        <div className="container max-w-4xl mx-auto py-12 px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
                <Radio className="w-6 h-6 text-red-500" />
                Live Session Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {djData && (
                <div className="mb-6">
                  <img 
                    src={djData.user?.image || '/default-dj.jpg'} 
                    alt={djData.user?.name || 'DJ'} 
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-lg font-semibold mb-2">{djData.user?.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-500 font-medium">LIVE NOW</span>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    {djData.user?.name} is currently live! Sign in to join the session and chat with other fans.
                  </p>
                </div>
              )}
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => router.push('/login?callbackUrl=' + encodeURIComponent(`/live/${djId}`))}
                >
                  Sign In to Join Live Session
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => router.push('/signup')}
                >
                  Create Account
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => router.push('/djs')}
                >
                  Browse All DJs
                </Button>
              </div>
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
                    {/* Show follow button only for fans, not DJs or club owners */}
                    {session?.user?.role === 'USER' && djId !== session?.user?.id && (
                      <Button 
                        size="sm" 
                        variant={isFollowing ? "default" : "outline"}
                        className={`h-8 ${isFollowing ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                        onClick={handleFollowToggle}
                        disabled={followingLoading}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${isFollowing ? 'fill-current' : ''}`} />
                        {followingLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Show user status */}
                <div className="mb-4">
                  {session?.user?.role === 'USER' && djId !== session?.user?.id && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-app-surface/50 p-2 rounded-md">
                      {isFollowing ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>🔔 You&apos;ll get notifications when this DJ goes live</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>Follow to get notified when this DJ goes live</span>
                        </>
                      )}
                    </div>
                  )}
                  {session?.user?.id === djId && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>🎵 This is your live session</span>
                    </div>
                  )}
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
                    className="flex-1"
                    onClick={() => router.push(`/chat/${roomId}`)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Join Chat
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      // Scroll to the live stream section
                      document.querySelector('[data-section="live-stream"]')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Live Stream
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Chat Section - Always show Join Chat button */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">Live Chat</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Join the live chat to interact with {djData?.user?.name} and other fans
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
                      <span>Live audience</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live session</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    WhatsApp-style full-screen chat experience
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Live Stream Panel */}
          <div className="lg:col-span-2" data-section="live-stream">
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="text-xl flex items-center">
                  <Radio className="w-5 h-5 mr-2 animate-pulse" />
                  Live Stream
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-grow p-0">
                <div className="h-[600px] flex flex-col items-center justify-center p-6 text-center">
                  <Radio className="w-12 h-12 text-red-500 animate-pulse mb-4" />
                  <h3 className="text-xl font-bold mb-2">Live Audio Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">
                    We&apos;re working on bringing live audio streams to our platform.
                    For now, enjoy the chat and interaction with other fans!
                  </p>
                  <Button 
                    onClick={() => router.push(`/chat/${roomId}`)}
                    size="lg"
                    className="mt-4"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Join Live Chat Instead
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
