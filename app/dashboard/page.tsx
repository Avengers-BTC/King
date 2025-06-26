'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Heart, Calendar, MapPin, Music, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowButton } from '@/components/ui/glow-button';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

import { DeleteProfileModal } from '@/components/delete-profile-modal';

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
  const { user, isAuthenticated, status, updateSession } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [socketHealthStatus, setSocketHealthStatus] = useState<string | null>(null);
  const [clientPath, setClientPath] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [authDebug, setAuthDebug] = useState<string>("Initializing");
  
  // Set client-side state for hydration safety
  // Set client-side state for hydration safety
  useEffect(() => {
    setIsClient(true);
    setClientPath(window.location.pathname);
    
    // Check socket health for debugging
    const checkSocketHealth = async () => {
      try {
        const response = await fetch('/api/socket/health', { 
          cache: 'no-store' 
        });
        const data = await response.json();
        setSocketHealthStatus(data.status);
      } catch (error) {
        console.error("Socket health check failed:", error);
        setSocketHealthStatus("Error checking status");
      }
    };
    
    checkSocketHealth();
  }, []);
  // Handle authentication and redirects
  useEffect(() => {
    if (!isClient) return;
    
    setAuthDebug(`Status: ${status}, Authenticated: ${isAuthenticated ? 'Yes' : 'No'}, User: ${user ? 'Present' : 'Null'}`);
    
    // If we have "loading" status for more than a brief moment, try refreshing the session
    if (status === "loading" && updateSession) {
      const timeout = setTimeout(() => {
        updateSession();
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
    
    // Force navigation to dashboard if authenticated
    if (status === "authenticated" && user) {
      // If we're at login but authenticated, manually push to dashboard
      if (clientPath === "/login") {
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
      }
    }
  }, [status, isAuthenticated, user, updateSession, isClient, clientPath]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        
        // First check if the API is healthy
        const healthCheck = await fetch('/api/health', {
          cache: 'no-store'
        });
        
        if (!healthCheck.ok) {
          toast.error(`API service is currently unavailable (${healthCheck.status}). Please try again later.`);
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(`/api/users/${user.id}`, {
          cache: 'no-store',
          headers: {
            'x-debug': 'true'
          }
        });
        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
          setRetryCount(0); // Reset retry count on success
        } else {
          let errorText = '';
          try {
            const errorData = await response.text();
            errorText = errorData;
            console.error('Failed to load profile:', response.status, response.statusText, errorData);
          } catch (e) {
            console.error('Could not parse error response:', e);
          }
          
          if (response.status === 404) {
            toast.error('User profile not found');
          } else {
            toast.error(`Failed to load profile (${response.status}). Please try again later.`);
            // Store error details for debugging
            setErrorDetails(`Status: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error(`Error connecting to server: ${error instanceof Error ? error.message : String(error)}`);
        setErrorDetails(`Error: ${error instanceof Error ? error.message : String(error)}`);
        
        // Auto-retry up to 3 times with exponential backoff
        if (retryCount < 3) {
          const backoffTime = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s backoff
          toast.info(`Retrying in ${backoffTime/1000} seconds...`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, backoffTime);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, retryCount]);

  // Function to check Socket.io health
  const checkSocketHealth = async () => {
    try {
      setSocketHealthStatus('checking');
      
      // First, check basic health endpoint
      const response = await fetch('/api/socketio-health');
      const data = await response.json();
      
      console.log('Socket.io health check:', data);
      
      // Then, check the Socket.io test endpoint
      const testResponse = await fetch('/api/socketio-test');
      const testData = await testResponse.json();
      
      console.log('Socket.io test details:', testData);
      
      if (response.ok) {
        setSocketHealthStatus('healthy');
        toast.success('Socket.io endpoint is available');
        
        // Display additional test info
        if (testResponse.ok) {
          toast.info(`Socket.io config: ${testData.transports.join(', ')} transport`);
        }
      } else {
        setSocketHealthStatus('unhealthy');
        toast.error('Socket.io endpoint check failed');
      }
    } catch (error) {
      console.error('Socket.io health check error:', error);
      setSocketHealthStatus('error');
      toast.error(`Socket.io check error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (!isClient) {
    // Return a minimal loading state during SSR to prevent hydration mismatches
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-app-text mb-4">Please log in to access your dashboard</h1>
          <div className="mb-6 p-4 bg-app-surface rounded text-sm text-app-text-muted">
            <p>Auth Debug: {authDebug}</p>
            <p className="mt-2">Current path: {clientPath}</p>
            <p className="mt-2">If you were just logged in, you may be experiencing a session recognition issue.</p>
          </div>
          <div className="flex flex-col space-y-4 items-center">
            <GlowButton href="/login">Go to Login</GlowButton>
            
            {updateSession && (
              <button 
                onClick={() => {
                  updateSession();
                  toast.info("Refreshing session...");
                }}
                className="text-sm px-3 py-1 bg-app-surface rounded hover:bg-electric-pink/20 text-app-text"
              >
                Refresh Session
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4 p-3 bg-app-surface rounded-lg text-sm text-app-text-muted">
            <p>Auth Debug: {authDebug}</p>
            <p className="mt-1">Status: Loading profile data...</p>
          </div>
          <div className="animate-pulse">
            <div className="h-20 bg-app-surface rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-app-surface rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!userProfile && isAuthenticated) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-app-text mb-4">Unable to load profile</h2>
            <p className="text-app-text-muted mb-6">We&apos;re having trouble connecting to the server or retrieving your profile information.</p>
            <div className="flex flex-col items-center gap-4">
              <GlowButton onClick={() => setRetryCount(prev => prev + 1)}>
                Retry
              </GlowButton>
              
              <button
                onClick={checkSocketHealth}
                className="text-sm px-3 py-1 bg-app-surface rounded hover:bg-electric-pink/20 text-app-text"
              >
                {socketHealthStatus === 'checking' ? 'Checking Socket.io...' : 
                 socketHealthStatus === 'healthy' ? '✓ Socket.io OK' : 
                 socketHealthStatus === 'unhealthy' ? '✗ Socket.io Failed' : 
                 'Check Socket.io Connection'}
              </button>
              
              {errorDetails && (
                <button 
                  onClick={() => {
                    toast.info("Technical details copied to clipboard");
                    if (typeof navigator !== 'undefined') {
                      navigator.clipboard.writeText(errorDetails);
                    }
                  }}
                  className="text-sm text-app-text/60 hover:text-electric-pink underline"
                >
                  Copy technical details
                </button>
              )}
              
              <div className="mt-4 p-4 bg-app-bg/50 rounded text-left max-w-lg mx-auto">
                <p className="text-sm text-app-text-muted mb-2">For Vercel deployment, ensure these environment variables are set:</p>
                <ul className="text-xs text-app-text/70 list-disc list-inside space-y-1">
                  <li>DATABASE_URL (PostgreSQL connection string)</li>
                  <li>NEXTAUTH_URL (set to https://king-self-two.vercel.app)</li>
                  <li>NEXTAUTH_SECRET (random string for NextAuth)</li>
                  <li>NEXT_PUBLIC_SITE_URL (set to https://king-self-two.vercel.app)</li>
                </ul>
                <p className="text-xs text-electric-pink mt-2">Fixed: Removed duplicate Socket.io route that was causing conflicts</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
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

            {/* Danger Zone */}
            <Card className="glass-card border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-red-300">
                  Permanently delete your account and all data.
                </p>
                <DeleteProfileModal 
                  userId={userProfile.id}
                  userName={userProfile.name || 'User'}
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
