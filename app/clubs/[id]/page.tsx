'use client';

import { useParams } from 'next/navigation';
import { Star, MapPin, Music, Calendar, Clock, Phone, Globe } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GlowButton } from '@/components/ui/glow-button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { LiveChat } from '@/components/live-chat';
import { useEffect, useState } from 'react';

// This will be replaced with real API call
async function getClubData(clubId: string) {
  // Simulated API call
  const mockClub = {
    id: clubId,
    name: "Club XYZ",
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80",
    currentDj: {
      id: "dj1",
      name: "DJ Smith"
    }
  };
  
  return mockClub;
}

export default function ClubProfilePage() {
  const params = useParams();
  const clubId = params?.id as string;
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClub() {
      try {
        const data = await getClubData(clubId);
        setClub(data);
      } catch (error) {
        console.error('Error loading club:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadClub();
  }, [clubId]);

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

  if (!club) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-dark-text">Club Not Found</h1>
          <p className="text-dark-text/70 mt-2">The club profile you&apos;re looking for doesn&apos;t exist.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const handleRank = () => {
    toast.success('Thanks for your rating! 🔥');
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="glass-card overflow-hidden mb-8">
          <div className="aspect-video bg-gradient-to-br from-neon-cyan/20 to-electric-pink/20 relative">
            <img 
              src={club.image} 
              alt={club.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-dark-text mb-2">{club.name}</h1>
                  <div className="flex items-center space-x-4 text-dark-text/80">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{club.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{club.rating}</span>
                    </div>
                  </div>
                </div>
                <GlowButton onClick={handleRank} className="bg-neon-cyan hover:bg-neon-cyan/90 text-dark-bg">
                  🔥 Rank This Club
                </GlowButton>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-dark-text mb-4">About</h2>
                <p className="text-dark-text/80 leading-relaxed mb-6">
                  {club.description}
                </p>
                
                {club.featuredDJ && (
                  <div className="p-4 bg-electric-pink/10 rounded-lg border border-electric-pink/30">
                    <div className="flex items-center space-x-2">
                      <Music className="h-5 w-5 text-electric-pink" />
                      <span className="text-dark-text">
                        Tonight featuring <span className="text-electric-pink font-semibold">{club.featuredDJ}</span>
                      </span>
                    </div>
                    {club.eventTonight && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className="h-5 w-5 text-electric-pink" />
                        <span className="text-dark-text">{club.eventTonight}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Comments/Chat Placeholder */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-dark-text mb-4">Live Chat</h2>
                <div className="space-y-4 h-64 overflow-y-auto">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-electric-pink/20 rounded-full flex-shrink-0"></div>
                    <div>
                      <span className="text-sm font-medium text-electric-pink">@partygoer123</span>
                      <p className="text-dark-text/80">The energy here is insane tonight! 🔥</p>
                      <span className="text-xs text-dark-text/60">2 mins ago</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-neon-cyan/20 rounded-full flex-shrink-0"></div>
                    <div>
                      <span className="text-sm font-medium text-neon-cyan">@dancefloor_queen</span>
                      <p className="text-dark-text/80">Amazing performance tonight! Best set ever! 💫</p>
                      <span className="text-xs text-dark-text/60">5 mins ago</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-electric-pink/20 rounded-full flex-shrink-0"></div>
                    <div>
                      <span className="text-sm font-medium text-electric-pink">@music_lover</span>
                      <p className="text-dark-text/80">VIP section is worth every penny! 🍾</p>
                      <span className="text-xs text-dark-text/60">8 mins ago</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-dark-surface/50 rounded-lg">
                  <p className="text-dark-text/60 text-sm">Join the conversation! (Login required)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Club Info */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-dark-text mb-4">Club Info</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-dark-text/80 text-sm">{club.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-neon-cyan flex-shrink-0" />
                    <span className="text-dark-text/80">{club.contact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-neon-cyan flex-shrink-0" />
                    <span className="text-dark-text/80">{club.contact.website}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-dark-text mb-4">Hours</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-dark-text/70">Friday</span>
                    <span className="text-dark-text">{club.hours.friday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-text/70">Saturday</span>
                    <span className="text-dark-text">{club.hours.saturday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-text/70">Sunday</span>
                    <span className="text-dark-text">{club.hours.sunday}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-dark-text mb-4">Amenities</h3>
                <div className="space-y-2">
                  {club.amenities.map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-electric-pink rounded-full"></div>
                      <span className="text-dark-text/80 text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-electric-pink/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-text/70">Capacity</span>
                    <span className="text-dark-text">{club.capacity} people</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-dark-text/70">Dress Code</span>
                    <span className="text-dark-text">{club.dresscode}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Live Chat */}
      <LiveChat
        clubId={club.id}
        clubName={club.name}
        currentDj={club.currentDj}
      />
    </div>
  );
}