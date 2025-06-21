'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Heart, Calendar, MapPin, Music } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowButton } from '@/components/ui/glow-button';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  bio: string | null;
  image: string | null;
  location: string | null;
  joinDate: Date;
  followers: number;
  following: number;
  moments: any[];
  _count?: {
    moments: number;
    likedMoments: number;
  };
}

const recentActivity: Array<{
  type: string;
  target: string;
  time: string;
}> = [
  // Recent activity will appear here as user interacts with the platform
];

const upcomingEvents: Array<{
  name: string;
  venue: string;
  date: string;
  dj: string;
}> = [
  // Upcoming events will appear here from clubs and DJs the user follows
];

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/users/${user.id}`);
        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
        } else {
          toast.error('Failed to load profile');
        }
      } catch (error) {
        toast.error('Error loading profile');
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchUserProfile();
    }
  }, [user, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-app-text mb-4">Please log in to access your dashboard</h1>
          <GlowButton href="/login">Go to Login</GlowButton>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-20 bg-app-surface rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-app-surface rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-app-text mb-4">Dashboard not available</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-electric-pink">
              {userProfile.image ? (
                <img src={userProfile.image} alt={userProfile.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-electric-pink/20 to-neon-cyan/20 flex items-center justify-center">
                  <Users className="h-8 w-8 text-app-text/50" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-app-text">
                Welcome back, {userProfile.name || 'Friend'}!
              </h1>
              <p className="text-app-text/70">
                {userProfile.username || `@${userProfile.email?.split('@')[0]}`}
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <GlowButton href="/moments/upload">Share Moment</GlowButton>
            <GlowButton variant="secondary" href="/profile">Edit Profile</GlowButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-electric-pink mx-auto mb-2" />
                  <div className="text-2xl font-bold text-app-text">{userProfile.followers}</div>
                  <div className="text-sm text-app-text/70">Followers</div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 text-neon-cyan mx-auto mb-2" />
                  <div className="text-2xl font-bold text-app-text">{userProfile._count?.moments || 0}</div>
                  <div className="text-sm text-app-text/70">Moments Shared</div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-electric-pink mx-auto mb-2" />
                  <div className="text-2xl font-bold text-app-text">{userProfile._count?.likedMoments || 0}</div>
                  <div className="text-sm text-app-text/70">Total Likes</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-app-text">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-app-bg/50 rounded-lg">
                        <div className="w-2 h-2 bg-electric-pink rounded-full"></div>
                        <div className="flex-1">
                          <span className="text-app-text">
                            You {activity.type} <span className="text-electric-pink">{activity.target}</span>
                          </span>
                          <div className="text-xs text-app-text/60">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Music className="h-12 w-12 text-app-text/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-app-text mb-2">No activity yet</h3>
                    <p className="text-app-text/60 mb-4">
                      Start exploring the nightlife scene to see your activity here!
                    </p>
                    <GlowButton href="/clubs">Explore Clubs</GlowButton>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-app-text">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-app-bg/50 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-app-text">{event.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-app-text/70 mt-1">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.venue}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Music className="h-3 w-3" />
                              <span>{event.dj}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-electric-pink">{event.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-app-text/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-app-text mb-2">No upcoming events</h3>
                    <p className="text-app-text/60 mb-4">
                      Follow DJs and clubs to stay updated on upcoming events!
                    </p>
                    <div className="flex justify-center space-x-4">
                      <GlowButton variant="secondary" href="/djs">Follow DJs</GlowButton>
                      <GlowButton href="/clubs">Find Clubs</GlowButton>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-app-text">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-app-text/70">Following</span>
                  <span className="text-app-text">{userProfile.following}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-app-text/70">Location</span>
                  <span className="text-electric-pink">{userProfile.location || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-app-text/70">Member Since</span>
                  <span className="text-app-text">
                    {new Date(userProfile.joinDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-app-text">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/clubs'}
                  className="w-full text-left p-3 bg-app-bg/50 rounded-lg hover:bg-electric-pink/10 transition-colors"
                >
                  <div className="text-app-text font-medium">Find Events Near Me</div>
                  <div className="text-xs text-app-text/60">Discover local nightlife</div>
                </button>
                <button 
                  onClick={() => window.location.href = '/djs'}
                  className="w-full text-left p-3 bg-app-bg/50 rounded-lg hover:bg-electric-pink/10 transition-colors"
                >
                  <div className="text-app-text font-medium">Explore New DJs</div>
                  <div className="text-xs text-app-text/60">Find your next favorite artist</div>
                </button>
                <button 
                  onClick={() => window.location.href = '/leaderboard'}
                  className="w-full text-left p-3 bg-app-bg/50 rounded-lg hover:bg-electric-pink/10 transition-colors"
                >
                  <div className="text-app-text font-medium">Check Leaderboard</div>
                  <div className="text-xs text-app-text/60">See who&apos;s trending</div>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
