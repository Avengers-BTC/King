'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Star, 
  Calendar, 
  Music, 
  Phone,
  Globe,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Club {
  id: string;
  name: string;
  location: string;
  address: string;
  description: string;
  rating: number;
  capacity: number;
  dresscode: string;
  amenities: string[];
  phone: string;
  website: string;
  image: string;
  openingHours: any;
  user: {
    name: string;
    email: string;
  };
  events: Array<{
    id: string;
    name: string;
    date: string;
    dj: {
      user: {
        name: string;
        image: string;
      };
    };
  }>;
  djSchedules: Array<{
    id: string;
    eventName: string;
    startTime: string;
    endTime: string;
    dj: {
      user: {
        name: string;
        image: string;
      };
    };
  }>;
}

export default function ClubDetailPage() {
  const { clubId } = useParams();
  const router = useRouter();
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await fetch(`/api/clubs/${clubId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch club');
        }
        const data = await response.json();
        setClub(data);
      } catch (error) {
        console.error('Error fetching club:', error);
        toast.error('Failed to load club details');
      } finally {
        setIsLoading(false);
      }
    };

    if (clubId) {
      fetchClub();
    }
  }, [clubId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Navbar />
        <div className="container max-w-6xl mx-auto py-12 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-app-surface/50 rounded-lg"></div>
            <div className="h-32 bg-app-surface/50 rounded-lg"></div>
            <div className="h-48 bg-app-surface/50 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Navbar />
        <div className="container max-w-4xl mx-auto py-12 px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-app-text mb-4">Club Not Found</h1>
              <p className="text-app-text/70 mb-6">
                The club you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Button onClick={() => router.push('/clubs')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Clubs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Hero Section */}
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-8">
          <img 
            src={club.image || 'https://images.placeholders.dev/?width=800&height=400&text=Club&bgColor=%23000000&textColor=%23ffffff'} 
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {club.name}
            </h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{club.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{club.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{club.capacity} capacity</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {club.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-app-text/80 mb-4">
                  {club.description || 'No description available.'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-app-text mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-app-text/60" />
                        <span>{club.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-app-text/60" />
                        <span>Capacity: {club.capacity}</span>
                      </div>
                      {club.dresscode && (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 text-center text-app-text/60">👔</span>
                          <span>Dress code: {club.dresscode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-app-text mb-2">Contact</h4>
                    <div className="space-y-2 text-sm">
                      {club.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-app-text/60" />
                          <span>{club.phone}</span>
                        </div>
                      )}
                      {club.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-app-text/60" />
                          <a 
                            href={club.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-electric-pink hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                {club.amenities && club.amenities.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-app-text mb-3">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {club.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {club.events && club.events.length > 0 ? (
                  <div className="space-y-4">
                    {club.events.map((event) => (
                      <div key={event.id} className="flex items-center gap-4 p-4 border border-app-surface rounded-lg">
                        <img 
                          src={event.dj.user.image || `https://avatar.iran.liara.run/username?username=${encodeURIComponent(event.dj.user.name || 'DJ')}`} 
                          alt={event.dj.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-app-text">{event.name}</h4>
                          <p className="text-sm text-app-text/70">
                            with {event.dj.user.name}
                          </p>
                          <p className="text-xs text-app-text/60">
                            {new Date(event.date).toLocaleDateString()} at{' '}
                            {new Date(event.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-app-text/60 text-center py-8">
                    No upcoming events scheduled.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {club.website && (
                  <Button asChild className="w-full">
                    <a href={club.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  View All Events
                </Button>
                <Button variant="outline" className="w-full">
                  <Music className="w-4 h-4 mr-2" />
                  See DJs
                </Button>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            {club.openingHours && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Opening Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {Object.entries(club.openingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize">{day}</span>
                        <span className="text-app-text/70">{hours as string}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
