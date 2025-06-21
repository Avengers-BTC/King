import Link from 'next/link';
import { Star, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface ClubCardProps {
  id: string;
  name: string;
  location: string;
  rating: number;
  image?: string;
  events?: Array<{
    name: string;
    dj: {
      user: {
        name: string | null;
      };
    };
  }>;
}

export function ClubCard({ id, name, location, rating, image, events }: ClubCardProps) {
  const upcomingEvent = events && events.length > 0 ? events[0] : null;

  return (
    <Link href={`/clubs/${id}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden bg-app-surface border-border">
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={image || '/default-club.jpg'}
              alt={name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white truncate">
                  {name}
                </h3>
                <div className="flex items-center text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center text-app-text/70 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm truncate">{location}</span>
            </div>
            
            {upcomingEvent && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center text-app-text/70">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {upcomingEvent.name}
                    {upcomingEvent.dj.user.name && (
                      <span className="text-neon-cyan ml-1">
                        with {upcomingEvent.dj.user.name}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
