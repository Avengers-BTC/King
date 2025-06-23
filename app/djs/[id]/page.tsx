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
  const djId = params?.id as string;
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
          throw new Error(`Failed to fetch DJ: ${response.status}`);
        }
        
        const data = await response.json();
        setDj(data);

        // If user is authenticated, fetch their rating and follow status
        if (isAuthenticated && user) {
          const [ratingRes, followRes] = await Promise.all([
            fetch(`/api/djs/${djId}/rating`),
            fetch(`/api/djs/${djId}/following`)
          ]);
          
          if (ratingRes.ok) {
            const { rating } = await ratingRes.json();
            setUserRating(rating);
          }
          
          if (followRes.ok) {
            const { following } = await followRes.json();
            setIsFollowing(following);
          }
        }
      } catch (error) {
        console.error('Error loading DJ:', error);
        setError('Could not load DJ profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    if (djId) {
      loadDj();
    }
  }, [djId, isAuthenticated, user]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow this DJ', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/login')
        }
      });
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

      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Unfollowed DJ' : 'Now following DJ');
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  const handleRate = async (rating: number) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to rate this DJ', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/login')
        }
      });
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

      setUserRating(rating);
      toast.success('Rating updated successfully');
    } catch (error) {
      toast.error('Failed to update rating');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-dark-text">Loading...</h1>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !dj) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-dark-text">
            {error || 'Could not load DJ profile'}
          </h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Image and Basic Info */}
              <div className="space-y-6">
                <div className="relative h-64 w-64 mx-auto md:mx-0">
                  <img
                    src={dj.user.image || '/default-dj.png'}
                    alt={`${dj.user.name}'s profile`}
                    className="rounded-full object-cover w-full h-full"
                  />
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold">{dj.user.name}</h1>
                  <p className="text-gray-500 flex items-center justify-center md:justify-start mt-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    {dj.user.location || 'Location not specified'}
                  </p>
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    <span>{dj.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-500 mr-2" />
                    <span>{dj.fans} fans</span>
                  </div>
                  <div className="flex items-center">
                    <Music className="w-5 h-5 text-purple-500 mr-2" />
                    <span>{dj.genres.join(', ')}</span>
                  </div>
                </div>

                {/* Interactive Buttons - Only for authenticated users */}
                <div className="space-y-4">
                  <GlowButton
                    onClick={handleFollow}
                    variant={isFollowing ? "secondary" : "default"}
                    className="w-full"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </GlowButton>

                  {/* Rating Stars */}
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        onClick={() => handleRate(star)}
                        className={`p-1 ${
                          userRating && star <= userRating
                            ? 'text-yellow-500'
                            : 'text-gray-400'
                        }`}
                      >
                        <Star className="w-6 h-6" />
                      </Button>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="flex space-x-4">
                    {dj.instagram && (
                      <a
                        href={dj.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-500 hover:text-pink-600"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>
                    )}
                    {dj.twitter && (
                      <a
                        href={dj.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-500"
                      >
                        <Twitter className="w-6 h-6" />
                      </a>
                    )}
                    {dj.facebook && (
                      <a
                        href={dj.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Facebook className="w-6 h-6" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-600">{dj.bio}</p>
            </div>

            {/* Upcoming Events */}
            {dj.events && dj.events.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dj.events.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{event.name}</h3>
                        <p className="text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          {event.club.name}, {event.club.location}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Fan Chat - Only for authenticated users */}
            {isAuthenticated && dj && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Fan Chat</h2>
                <FanChat 
                  djId={dj.id} 
                  djName={dj.user.name || 'DJ'} 
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}