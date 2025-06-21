import Link from 'next/link';
import { Star, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface DJCardProps {
  id: string;
  genre: string;
  rating: number;
  fans: number;
  currentClub: string | null;
  user: {
    name: string | null;
    image: string | null;
    location: string | null;
  };
}

export function DJCard({ id, genre, rating, fans, currentClub, user }: DJCardProps) {
  return (
    <Link href={`/djs/${id}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden bg-app-surface border-border">
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={user.image || '/default-dj.jpg'}
              alt={user.name || 'DJ'}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white truncate">
                  {user.name}
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
              <span className="text-sm truncate">{user.location || 'Location not specified'}</span>
            </div>
            
            <div className="flex items-center justify-between text-app-text/70">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span className="text-sm">{fans.toLocaleString()} fans</span>
              </div>
              <span className="text-sm font-medium text-electric-pink">
                {genre}
              </span>
            </div>
            
            {currentClub && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-app-text/70">
                  Currently at: <span className="text-neon-cyan">{currentClub}</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
