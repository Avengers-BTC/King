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
      name: "DJ Awesome",
      genre: "House"
    },
    rating: 4.7,
    location: "123 Main St, New York, NY",
    description: "Club XYZ is the premier nightlife destination featuring world-class DJs and an immersive sound system. Located in the heart of the city, we offer an unforgettable experience with state-of-the-art lighting and sound.",
    openingHours: {
      mon: "Closed",
      tue: "Closed",
      wed: "10 PM - 3 AM",
      thu: "10 PM - 3 AM",
      fri: "10 PM - 4 AM",
      sat: "10 PM - 4 AM",
      sun: "10 PM - 2 AM"
    },
    phone: "+1 (555) 123-4567",
    website: "https://www.clubxyz.com",
    social: {
      instagram: "https://instagram.com/clubxyz",
      twitter: "https://twitter.com/clubxyz",
      facebook: "https://facebook.com/clubxyz"
    },
    events: [
      {
        id: "evt1",
        name: "Summer Vibes",
        date: "2023-06-15",
        dj: {
          id: "dj2",
          name: "DJ Incredible"
        }
      },
      {
        id: "evt2",
        name: "Neon Night",
        date: "2023-06-22",
        dj: {
          id: "dj3",
          name: "DJ Fantastic"
        }
      },
      {
        id: "evt3",
        name: "House Party",
        date: "2023-06-29",
        dj: {
          id: "dj1",
          name: "DJ Awesome"
        }
      }
    ]
  };
  
  return mockClub;
}

export default function ClubPage() {
  const params = useParams();
  const clubId = params?.clubId as string;
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClub() {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        const data = await getClubData(clubId);
        setClub(data);
      } catch (err) {
        console.error('Error loading club:', err);
        toast.error('Failed to load club information');
      } finally {
        setLoading(false);
      }
    }
    
    if (clubId) {
      loadClub();
    }
  }, [clubId]);

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

  if (!club) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Navbar />
        <div className="container max-w-4xl mx-auto py-8 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Club Not Found</h1>
          <p className="text-app-text/70 mb-6">
            We couldn&apos;t find the club you&apos;re looking for.
          </p>
          <GlowButton href="/clubs">
            View All Clubs
          </GlowButton>
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
        <div 
          className="h-64 md:h-80 w-full bg-center bg-cover relative"
          style={{ 
            backgroundImage: `url(${club.image})` 
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        </div>
        
        {/* Club Info Card */}
        <div className="container max-w-4xl mx-auto px-4">
          <div className="relative -mt-32">
            <Card className="shadow-xl border-primary/10">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Club Logo */}
                  <div className="hidden md:block relative bg-app-surface p-4 rounded-lg">
                    <div className="bg-gradient-to-br from-electric-blue to-neon-purple w-24 h-24 rounded-lg flex items-center justify-center">
                      <Music className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  {/* Club Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{club.name}</h1>
                        <div className="flex items-center text-app-text/70 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{club.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-medium">{club.rating}</span>
                        <span className="text-app-text/70 text-sm">/5</span>
                      </div>
                    </div>
                    
                    <p className="mt-4 text-app-text/80">
                      {club.description}
                    </p>
                    
                    {club.currentDj && (
                      <div className="mt-4 p-3 bg-electric-blue/10 rounded-md">
                        <p className="text-sm flex items-center">
                          <Music className="w-4 h-4 mr-2 text-electric-blue" />
                          <span>
                            <span className="font-semibold">{club.currentDj.name}</span> is currently spinning {club.currentDj.genre}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Details Section */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">Club Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-app-surface/50 p-2 rounded-md">
                    <Clock className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <h3 className="font-medium">Opening Hours</h3>
                    <div className="text-sm text-app-text/70 mt-1 space-y-1">
                      <p>Monday: {club.openingHours.mon}</p>
                      <p>Tuesday: {club.openingHours.tue}</p>
                      <p>Wednesday: {club.openingHours.wed}</p>
                      <p>Thursday: {club.openingHours.thu}</p>
                      <p>Friday: {club.openingHours.fri}</p>
                      <p>Saturday: {club.openingHours.sat}</p>
                      <p>Sunday: {club.openingHours.sun}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-app-surface/50 p-2 rounded-md">
                    <Phone className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <h3 className="font-medium">Contact Information</h3>
                    <div className="text-sm text-app-text/70 mt-1">
                      <p>Phone: {club.phone}</p>
                      <p className="mt-1">
                        Website: <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline">{club.website}</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming Events */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
              
              <div className="space-y-3">
                {club.events.map((event: any) => (
                  <div key={event.id} className="p-3 bg-app-surface/50 rounded-md">
                    <h3 className="font-medium text-electric-pink">{event.name}</h3>
                    <div className="text-sm text-app-text/70 mt-1">
                      <p className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="flex items-center mt-1">
                        <Music className="w-3.5 h-3.5 mr-1.5" />
                        {event.dj.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Live Chat Component */}
      {club.currentDj && (
        <LiveChat 
          clubId={clubId} 
          clubName={club.name}
          currentDj={{
            id: club.currentDj.id,
            name: club.currentDj.name
          }}
        />
      )}
      
      <Footer />
    </div>
  );
}
