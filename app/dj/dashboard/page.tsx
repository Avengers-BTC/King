'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { 
  Music, Users, Star, Calendar, MapPin, Edit, Plus, 
  Instagram, Twitter, Facebook, TrendingUp, Heart, Eye, MessageCircle
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LiveSession } from '@/components/live-session';
import { getDjChatRoomId } from '@/lib/chat-room-utils';

interface DJProfile {
  id: string;
  genre: string;
  rating: number;
  fans: number;
  bio: string;
  currentClub: string | null;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  status?: 'PERFORMING' | 'OFFLINE' | 'SCHEDULED' | 'ON_BREAK';
  user: {
    name: string;
    username: string;
    location: string;
    image: string | null;
  };
  events: Array<{
    id: string;
    name: string;
    date: string;
    club: {
      name: string;
      location: string;
    };
  }>;
}

export default function DJDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [djProfile, setDjProfile] = useState<DJProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'DJ') {
      toast.error('Access denied. DJ account required.');
      router.push('/dashboard');
      return;
    }

    if (user?.id) {
      fetchDJProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

  const fetchDJProfile = async () => {
    try {
      if (!user?.id) return;

      const response = await fetch(`/api/djs/${user.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          // User doesn't have a DJ profile yet
          toast.error('DJ profile not found');
          router.push('/signup/dj');
          return;
        }
        throw new Error('Failed to fetch DJ profile');
      }

      const data = await response.json();
      if (!data) {
        toast.error('DJ profile not found');
        router.push('/signup/dj');
        return;
      }

      setDjProfile(data);
    } catch (error) {
      console.error('Error fetching DJ profile:', error);
      toast.error('Failed to load DJ profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white">Loading your DJ dashboard...</div>
        </div>
      </div>
    );
  }

  if (!djProfile) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">DJ Profile Not Found</h2>
            <p className="text-gray-400 mb-4">Create your DJ profile to get started</p>
            <Button asChild className="bg-pink-500 hover:bg-pink-600">
              <a href="/signup/dj">Create DJ Profile</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-500 bg-gray-700">
              {djProfile.user.image ? (
                <img 
                  src={djProfile.user.image} 
                  alt={djProfile.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                  {djProfile.user.name[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome back, {djProfile.user.name}!</h1>
              <p className="text-gray-400">@{djProfile.user.username} • {djProfile.genre}</p>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm">{djProfile.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-1 text-pink-500">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{djProfile.fans.toLocaleString()} fans</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button asChild variant="outline" className="border-gray-600">
              <a href={`/dj/profile/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </a>
            </Button>
            <Button asChild className="bg-pink-500 hover:bg-pink-600">
              <a href="/dj/events/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </a>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Fans</p>
                  <p className="text-2xl font-bold text-white">{djProfile.fans.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Rating</p>
                  <p className="text-2xl font-bold text-white">{djProfile.rating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Upcoming Events</p>
                  <p className="text-2xl font-bold text-white">{djProfile.events.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Profile Views</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tabs Navigation */}
          <TabsList className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="live"
              className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              Go Live
            </TabsTrigger>
            <TabsTrigger 
              value="events"
              className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              Events
            </TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Tabs Content */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Status */}
              <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {djProfile.currentClub ? (
                    <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/30">
                      <div className="flex items-center space-x-2">
                        <Music className="h-5 w-5 text-pink-500" />
                        <span className="text-white">
                          Currently playing at <span className="font-semibold text-pink-500">{djProfile.currentClub}</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <p className="text-gray-400">No current venue set</p>
                      <Button asChild className="mt-2 bg-pink-500 hover:bg-pink-600" size="sm">
                        <a href="/dj/profile/edit">Update Status</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-start bg-pink-500 hover:bg-pink-600">
                    <a href="/dj/events/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Event
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start border-gray-600">
                    <a href="/dj/profile/edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start border-gray-600">
                    <a href="/moments/upload">
                      <Music className="h-4 w-4 mr-2" />
                      Share Moment
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="live">
            <div className="space-y-6">
              <LiveSession
                djId={djProfile?.id || ''}
                djName={djProfile?.user?.name || ''}
                clubs={[]}  // You can pass actual clubs data here
              />
              
              {/* Enhanced DJ Live Host Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Host Controls */}
                <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Music className="w-5 h-5 text-pink-500" />
                      Host Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                                        <div className={`p-4 rounded-lg border ${
                       djProfile?.status === 'PERFORMING' 
                         ? 'bg-pink-500/10 border-pink-500/30' 
                         : 'bg-gray-700/30 border-gray-600/30'
                     }`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-medium">Session Status</span>
                        <Badge variant={djProfile?.status === 'PERFORMING' ? 'destructive' : 'secondary'} 
                               className={djProfile?.status === 'PERFORMING' ? 'animate-pulse' : ''}>
                          {djProfile?.status === 'PERFORMING' ? 'LIVE' : 'OFFLINE'}
                        </Badge>
                      </div>
                      {djProfile?.status === 'PERFORMING' ? (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Listeners</span>
                            <p className="text-white font-semibold">Loading...</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Duration</span>
                            <p className="text-white font-semibold">Live now</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">
                          Not currently live. Go live to see session metrics.
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Music className="w-4 h-4 mr-2" />
                        Update Now Playing
                      </Button>
                      <Button variant="outline" className="w-full border-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Listeners
                      </Button>
                      <Button variant="outline" className="w-full border-gray-600 text-yellow-500 border-yellow-500">
                        <Star className="w-4 h-4 mr-2" />
                        Pin Announcement
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Chat Preview/Controls */}
                <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-cyan-500" />
                        Live Chat Activity
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => router.push(`/chat/${getDjChatRoomId(djProfile?.id || '', djProfile?.currentClub || '')}`)}
                        className="bg-cyan-500 hover:bg-cyan-600"
                      >
                        Open Full Chat
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Chat Preview */}
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {djProfile?.status === 'PERFORMING' ? (
                        <div className="text-center py-8">
                          <MessageCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Recent chat messages will appear here</p>
                          <p className="text-xs text-gray-500 mt-1">Connect to real-time chat to see fan interactions</p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MessageCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Go live to see chat activity</p>
                          <p className="text-xs text-gray-500 mt-1">Your fans will be able to chat with you during live sessions</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="text-xs text-gray-400 mb-2">Quick Actions</div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" variant="outline" className="border-gray-600 text-xs">
                          📌 Pin Message
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-600 text-xs">
                          🔇 Mute User
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* When Not Live - Encouragement */}
              <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="max-w-md mx-auto">
                    <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Ready to Connect with Your Fans?</h3>
                    <p className="text-gray-400 mb-4">
                      When you go live, you&apos;ll see real-time chat activity here and can interact with your audience directly.
                    </p>
                    <div className="text-sm text-gray-500">
                      💡 <strong>Pro Tip:</strong> Your fans can find and join your live chat from your DJ profile, the main chat list, or when browsing live DJs!
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Upcoming Events</CardTitle>
                <Button asChild className="bg-pink-500 hover:bg-pink-600">
                  <a href="/dj/events/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </a>
                </Button>
              </CardHeader>
              <CardContent>
                {djProfile.events.length > 0 ? (
                  <div className="space-y-4">
                    {djProfile.events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-white">{event.name}</h3>
                          <p className="text-gray-400">{event.club.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-4 w-4 text-cyan-500" />
                            <span className="text-sm text-cyan-500">{formatDate(event.date)}</span>
                            <MapPin className="h-4 w-4 text-gray-400 ml-2" />
                            <span className="text-sm text-gray-400">{event.club.location}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="border-gray-600">
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No upcoming events</h3>
                    <p className="text-gray-500 mb-4">Add your first event to start building your schedule!</p>
                    <Button asChild className="bg-pink-500 hover:bg-pink-600">
                      <a href="/dj/events/create">Create Event</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Info */}
              <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Genre</label>
                    <p className="text-white">{djProfile.genre}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Bio</label>
                    <p className="text-white">{djProfile.bio}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Location</label>
                    <p className="text-white">{djProfile.user.location || 'Not set'}</p>
                  </div>
                  <Button asChild className="w-full bg-pink-500 hover:bg-pink-600">
                    <a href="/dj/profile/edit">Edit Profile</a>
                  </Button>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Social Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <span className="text-white">{djProfile.instagram || 'Not connected'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Twitter className="h-5 w-5 text-cyan-500" />
                    <span className="text-white">{djProfile.twitter || 'Not connected'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Facebook className="h-5 w-5 text-blue-500" />
                    <span className="text-white">{djProfile.facebook || 'Not connected'}</span>
                  </div>
                  <Button asChild variant="outline" className="w-full border-gray-600">
                    <a href="/dj/profile/edit">Update Social Links</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}