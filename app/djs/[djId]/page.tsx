'use client';

import { useParams, useRouter } from 'next/navigation';
import { Star, Users, MapPin, Music, Instagram, Twitter, Facebook, Heart } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GlowButton } from '@/components/ui/glow-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { FanChat } from '@/components/fan-chat';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

// Type definition for DJ data
interface DJ {
  id: string;
  userId: string;
  bio: string;
  genres: string[];
  rating: number;
  fans: number;
  events: Array<{
    id: string;
    name: string;
    date: string;
    club: {
      name: string;
      location: string;
    }
  }>;
  currentClub: string | null;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  user: {
    name: string | null;
    username: string | null;
    image: string | null;
    location: string | null;
  };
}

export default function DJProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const params = useParams();
  const djId = params?.djId as string;
  const [dj, setDj] = useState<DJ | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    async function loadDj() {
      try {
        setLoading(true);
        const response = await fetch(`/api/djs/${djId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load DJ profile');
        }
        
        const data = await response.json();
        setDj(data);
        
        // Check if user is following this DJ
        if (isAuthenticated && user) {
          const followResponse = await fetch(`/api/djs/${djId}/following`);
          if (followResponse.ok) {
            const followData = await followResponse.json();
            setIsFollowing(followData.isFollowing);
          }
          
          // Get user's rating for this DJ if they've rated
          const ratingResponse = await fetch(`/api/djs/${djId}/rating`);
          if (ratingResponse.ok) {
            const ratingData = await ratingResponse.json();
            if (ratingData.rating) {
              setUserRating(ratingData.rating);
            }
          }
        }
      } catch (err) {
        console.error('Error loading DJ:', err);
        setError('Could not load DJ profile');
        toast.error('Failed to load DJ profile');
      } finally {
        setLoading(false);
      }
    }
    
    if (djId) {
      loadDj();
    }
  }, [djId, isAuthenticated, user]);

  async function handleFollow() {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow this DJ');
      router.push('/login');
      return;
    }
    
    try {
      const response = await fetch(`/api/djs/${djId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to follow DJ');
      }
      
      setIsFollowing(true);
      toast.success(`You are now following ${dj?.user.name}`);
      
      // Update the fan count
      if (dj) {
        setDj({
          ...dj,
          fans: dj.fans + 1
        });
      }
    } catch (err) {
      console.error('Error following DJ:', err);
      toast.error('Failed to follow DJ');
    }
  }

  async function handleUnfollow() {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      const response = await fetch(`/api/djs/${djId}/follow`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to unfollow DJ');
      }
      
      setIsFollowing(false);
      toast.success(`You have unfollowed ${dj?.user.name}`);
      
      // Update the fan count
      if (dj) {
        setDj({
          ...dj,
          fans: Math.max(0, dj.fans - 1)
        });
      }
    } catch (err) {
      console.error('Error unfollowing DJ:', err);
      toast.error('Failed to unfollow DJ');
    }
  }

  async function handleRate(rating: number) {
    if (!isAuthenticated) {
      toast.error('Please sign in to rate this DJ');
      router.push('/login');
      return;
    }
    
    try {
      const response = await fetch(`/api/djs/${djId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating })
      });
      
      if (!response.ok) {
        throw new Error('Failed to rate DJ');
      }
      
      const data = await response.json();
      setUserRating(rating);
      
      // Update the DJ's overall rating
      if (dj) {
        setDj({
          ...dj,
          rating: data.newRating
        });
      }
      
      toast.success(`You rated ${dj?.user.name} ${rating} stars`);
    } catch (err) {
      console.error('Error rating DJ:', err);
      toast.error('Failed to rate DJ');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Navbar />
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-64 bg-app-surface/50 rounded-lg mb-6"></div>
            <div className="h-8 bg-app-surface/50 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-app-surface/50 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-app-surface/50 rounded w-2/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-app-surface/50 rounded-lg"></div>
              <div className="h-64 bg-app-surface/50 rounded-lg"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !dj) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Navbar />
        <div className="container max-w-4xl mx-auto py-8 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">DJ Not Found</h1>
          <p className="text-app-text/70 mb-6">
            We couldn't find the DJ you're looking for.
          </p>
          <Button onClick={() => router.push('/djs')}>
            View All DJs
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      
      <div className="relative">
        {/* Hero Background */}
        <div className="h-64 md:h-80 w-full bg-gradient-to-r from-electric-blue/30 to-neon-purple/30 relative">
          <div className="absolute inset-0 backdrop-blur-sm"></div>
        </div>
        
        {/* DJ Profile Card */}
        <div className="container max-w-4xl mx-auto px-4">
          <div className="relative -mt-32">
            <Card className="shadow-xl border-primary/10">
              <CardContent className="p-0">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* DJ Avatar */}
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-app-surface">
                        <img 
                          src={dj.user.image || '/default-dj.jpg'} 
                          alt={dj.user.name || 'DJ'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Rating Badge */}
                      <div className="absolute -bottom-2 -right-2 bg-app-surface rounded-full p-2 shadow-lg">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-semibold">{dj.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* DJ Info */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h1 className="text-2xl md:text-3xl font-bold">{dj.user.name}</h1>
                          <div className="flex items-center text-app-text/70 mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{dj.user.location || 'Location not specified'}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {!isAuthenticated ? (
                            <Button onClick={() => router.push('/login')}>
                              Sign in to follow
                            </Button>
                          ) : isFollowing ? (
                            <Button variant="outline" onClick={handleUnfollow}>
                              <Heart className="w-4 h-4 mr-2 fill-current text-red-500" />
                              Following
                            </Button>
                          ) : (
                            <Button onClick={handleFollow}>
                              <Heart className="w-4 h-4 mr-2" />
                              Follow
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-app-text/70" />
                          <span className="text-sm font-medium">{dj.fans.toLocaleString()} fans</span>
                        </div>
                        <div className="flex items-center">
                          <Music className="w-4 h-4 mr-1 text-app-text/70" />
                          <span className="text-sm font-medium">{dj.genres.join(', ')}</span>
                        </div>
                      </div>
                      
                      {dj.currentClub && (
                        <div className="mt-4 p-3 bg-electric-blue/10 rounded-md">
                          <p className="text-sm flex items-center">
                            <Music className="w-4 h-4 mr-2 text-electric-blue" />
                            <span>
                              Currently at <span className="font-semibold">{dj.currentClub}</span>
                            </span>
                          </p>
                        </div>
                      )}
                      
                      {/* Social Links */}
                      <div className="flex items-center gap-2 mt-4">
                        {dj.instagram && (
                          <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                            <Link href={dj.instagram} target="_blank" rel="noopener noreferrer">
                              <Instagram className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                        {dj.twitter && (
                          <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                            <Link href={dj.twitter} target="_blank" rel="noopener noreferrer">
                              <Twitter className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                        {dj.facebook && (
                          <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                            <Link href={dj.facebook} target="_blank" rel="noopener noreferrer">
                              <Facebook className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Bio */}
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">About</h2>
                    <p className="text-app-text/80 whitespace-pre-line">{dj.bio || 'No bio available yet.'}</p>
                  </div>
                  
                  {/* Rate this DJ */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold mb-2">Rate this DJ</h3>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`w-6 h-6 cursor-pointer ${
                            (userRating && star <= userRating) || (!userRating && star <= Math.round(dj.rating))
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                          onClick={() => handleRate(star)}
                        />
                      ))}
                      <span className="ml-2 text-sm text-app-text/70">
                        {userRating ? `Your rating: ${userRating}` : `Rate this DJ`}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fan Chat */}
          <FanChat djId={djId} djName={dj.user.name || 'DJ'} />
          
          {/* Upcoming Events */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
              
              {dj.events && dj.events.length > 0 ? (
                <div className="space-y-4">
                  {dj.events.map((event) => (
                    <div key={event.id} className="p-3 bg-app-surface/50 rounded-md">
                      <h3 className="font-medium text-electric-pink">{event.name}</h3>
                      <div className="text-sm text-app-text/70 mt-1">
                        <p>{new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                        <p className="mt-1">
                          {event.club.name}, {event.club.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-app-text/70 text-sm">No upcoming events scheduled.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
