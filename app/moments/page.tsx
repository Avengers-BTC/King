'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share, Plus, Filter } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GlowButton } from '@/components/ui/glow-button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

// Type for moment data from the API
interface Moment {
  id: string;
  title: string;
  caption?: string;
  image: string;
  location?: string;
  type: string;
  createdAt: string;
  user: {
    name: string;
    image?: string;
    username?: string;
  };
  likes: Array<{ userId: string }>;
  _count: {
    comments: number;
  };
}

export default function MomentsPage() {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState('all');
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedMoments, setLikedMoments] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMoments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMoments = async () => {
    try {
      const response = await fetch('/api/moments');
      if (response.ok) {
        const data = await response.json();
        setMoments(data);
        
        // If user is authenticated, check which moments they've liked
        if (isAuthenticated && user) {
          const likedMomentIds = new Set<string>();
          data.forEach((moment: Moment) => {
            if (moment.likes.some(like => like.userId === user.id)) {
              likedMomentIds.add(moment.id);
            }
          });
          setLikedMoments(likedMomentIds);
        }
      }
    } catch (error) {
      console.error('Error fetching moments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (momentId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like moments');
      return;
    }

    const isLiked = likedMoments.has(momentId);
    const method = isLiked ? 'DELETE' : 'POST';

    try {
      const response = await fetch(`/api/moments/${momentId}/like`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        const newLikedMoments = new Set(likedMoments);
        if (data.liked) {
          newLikedMoments.add(momentId);
        } else {
          newLikedMoments.delete(momentId);
        }
        setLikedMoments(newLikedMoments);

        // Update moments list with new like count
        setMoments(prevMoments => 
          prevMoments.map(moment => 
            moment.id === momentId 
              ? { ...moment, likes: data.liked 
                  ? [...moment.likes, { userId: user!.id }]
                  : moment.likes.filter(like => like.userId !== user!.id)
                }
              : moment
          )
        );

        toast.success(data.liked ? 'Moment liked!' : 'Like removed');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update like');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');
    }
  };

  const filteredMoments = moments.filter(moment => {
    if (filter === 'all') return true;
    return moment.type === filter;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    }
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-app-text mb-4">
              Nightlife <span className="text-electric-pink">Moments</span>
            </h1>
            <p className="text-app-text/70">
              Share your epic nightlife experiences and discover what&apos;s happening right now.
            </p>
          </div>
          
          <Link href="/moments/upload">
            <GlowButton className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Share Moment</span>
            </GlowButton>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-electric-pink' : 'hover:bg-electric-pink/10'}
          >
            All
          </Button>
          <Button
            variant={filter === 'image' ? 'default' : 'ghost'}
            onClick={() => setFilter('image')}
            className={filter === 'image' ? 'bg-electric-pink' : 'hover:bg-electric-pink/10'}
          >
            Photos
          </Button>
          <Button
            variant={filter === 'video' ? 'default' : 'ghost'}
            onClick={() => setFilter('video')}
            className={filter === 'video' ? 'bg-electric-pink' : 'hover:bg-electric-pink/10'}
          >
            Videos
          </Button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-app-text/60 text-lg">Loading moments...</p>
          </div>
        )}

        {/* Moments Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMoments.map((moment) => (
              <Card key={moment.id} className="glass-card group hover:border-electric-pink/30 transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-electric-pink/10 to-neon-cyan/10">
                    {moment.type === 'video' ? (
                      <video 
                        src={moment.image} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        controls
                      />
                    ) : (
                      <img 
                        src={moment.image} 
                        alt={moment.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {moment.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-electric-pink/80 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 text-white fill-current">
                            ▶
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 bg-app-bg/80 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-xs text-app-text">{getTimeAgo(moment.createdAt)}</span>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-electric-pink/20">
                      {moment.user.image ? (
                        <img src={moment.user.image} alt={moment.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-electric-pink font-bold">
                          {moment.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-electric-pink">
                      {moment.user.username || moment.user.name}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-app-text mb-1">{moment.title}</h3>
                  {moment.caption && (
                    <p className="text-sm text-app-text/80 mb-2">{moment.caption}</p>
                  )}
                  {moment.location && (
                    <p className="text-xs text-app-text/60 mb-3">{moment.location}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => handleLike(moment.id)}
                        className={`flex items-center space-x-1 transition-colors ${
                          likedMoments.has(moment.id) 
                            ? 'text-red-500 hover:text-red-600' 
                            : 'text-app-text/60 hover:text-electric-pink'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${likedMoments.has(moment.id) ? 'fill-current' : ''}`} />
                        <span className="text-xs">{moment.likes.length}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-app-text/60 hover:text-neon-cyan transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">{moment._count.comments}</span>
                      </button>
                    </div>
                    <button className="text-app-text/60 hover:text-electric-pink transition-colors">
                      <Share className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredMoments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-app-text/60 text-lg mb-4">
              {moments.length === 0 
                ? "No moments have been shared yet. Be the first to share your nightlife experience!" 
                : "No moments found matching your filter. Try selecting a different filter."
              }
            </p>
            {moments.length === 0 && (
              <Link href="/moments/upload">
                <GlowButton className="flex items-center space-x-2 mx-auto">
                  <Plus className="h-5 w-5" />
                  <span>Share First Moment</span>
                </GlowButton>
              </Link>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
