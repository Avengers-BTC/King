'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AgoraStream } from '@/components/agora-stream';
import { useSocket } from '@/contexts/socket-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radio, Music, Users, Heart, ArrowLeft, Share2, MessageCircle, Volume2, MapPin, Star } from 'lucide-react';
import { LiveConnectionStatus } from '@/components/ui/live-connection-status';
import { toast } from 'sonner';
import { getDjChatRoomId } from '@/lib/chat-room-utils';

export default function LiveSessionPage() {
  const { djId } = useParams() as { djId: string };
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isConnected, isDjLive } = useSocket();
  const [djData, setDjData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeClub, setActiveClub] = useState<string | null>(null);
  const [listeners, setListeners] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  // Check live status
  const isLive = isDjLive(djId);

  // Fetch DJ data
  useEffect(() => {
    const fetchDj = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/djs/${djId}`);
        if (!response.ok) throw new Error('Failed to fetch DJ info');
        
        const data = await response.json();
        setDjData(data);
        setActiveClub(data.currentClub);
      } catch (error) {
        console.error('Error fetching DJ data:', error);
        toast.error('Failed to load DJ information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDj();
  }, [djId]);

  // Check if user is following this DJ
  useEffect(() => {
    const checkFollowing = async () => {
      try {
        setFollowingLoading(true);
        const response = await fetch(`/api/djs/${djId}/following`);
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setFollowingLoading(false);
      }
    };

    if (session?.user) {
      checkFollowing();
    }
  }, [djId, session?.user]);

  const handleFollow = async () => {
    try {
      setFollowingLoading(true);
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/djs/${djId}/follow`, { method });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? 'Unfollowed DJ' : 'Now following DJ');
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleJoinChat = () => {
    const roomId = getDjChatRoomId(djId, activeClub);
    router.push(`/chat/${roomId}`);
  };

  const handleBack = () => {
    router.push('/djs');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Navbar />
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-app-surface rounded w-1/4"></div>
            <div className="h-64 bg-app-surface rounded"></div>
            <div className="h-32 bg-app-surface rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!djData) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Navbar />
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">DJ not found</h1>
            <p className="text-muted-foreground mt-2">This DJ profile does not exist</p>
            <Button onClick={handleBack} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to DJs
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Button variant="outline" onClick={handleBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to DJs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Stream */}
            <Card className="bg-app-surface border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Live Stream
                  </div>
                  {isLive && (
                    <Badge variant="destructive" className="animate-pulse">
                      LIVE
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLive ? (
                    <div className="border rounded-lg p-4 bg-black/5">
                      <AgoraStream 
                        djId={djId} 
                        isHost={false}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Radio className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold">{djData.user.name} is not live</h3>
                      <p className="text-sm text-muted-foreground">
                        Follow them to get notified when they start streaming
                      </p>
                    </div>
                  )}

                  {isLive && (
                    <div className="flex flex-wrap gap-4">
                      <Button onClick={handleJoinChat} variant="default">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Join Chat
                      </Button>
                      {session?.user && (
                        <Button
                          onClick={handleFollow}
                          variant="outline"
                          disabled={followingLoading}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                          {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* DJ Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the DJ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4 flex-wrap">
                    <Badge variant="secondary" className="flex gap-2 items-center">
                      <Music className="w-4 h-4" /> {djData.genre}
                    </Badge>
                    {djData.user.location && (
                      <Badge variant="secondary" className="flex gap-2 items-center">
                        <MapPin className="w-4 h-4" /> {djData.user.location}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="flex gap-2 items-center">
                      <Users className="w-4 h-4" /> {djData.fans} fans
                    </Badge>
                    {djData.rating > 0 && (
                      <Badge variant="secondary" className="flex gap-2 items-center">
                        <Star className="w-4 h-4" /> {djData.rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>

                  {djData.bio && (
                    <p className="text-sm text-muted-foreground">
                      {djData.bio}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle>Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <LiveConnectionStatus />
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard');
                  }}
                >
                  Copy Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
