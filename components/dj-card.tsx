import { useRouter } from 'next/navigation';
import { Star, MapPin, Users, Radio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface DJCardProps {
  id: string;
  genre: string;
  rating: number;
  fans: number;
  currentClub: string | null;
  isLive?: boolean;
  user: {
    name: string | null;
    image: string | null;
    location: string | null;
  };
}

export function DJCard({ id, genre, rating, fans, currentClub, isLive = false, user }: DJCardProps) {
  const router = useRouter();

  const handleLiveSessionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/live/${id}`);
  };

  const handleCardClick = () => {
    router.push(`/djs/${id}`);
  };
  
  return (
    <div className="group relative">
      <Card 
        className={`
          group hover:shadow-lg transition-all duration-300 overflow-hidden bg-app-surface border-border cursor-pointer
          ${isLive ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20 animate-pulse-border' : ''}
        `}
        onClick={handleCardClick}
      >
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={user.image || '/default-dj.jpg'}
                alt={user.name || 'DJ'}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {isLive && (
                <div className="absolute top-4 right-4 live-status-indicator flex items-center space-x-2 bg-red-500/95 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                  <div className="live-status-dot w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  <span className="text-white font-bold text-sm tracking-wide">LIVE NOW</span>
                </div>
              )}
              
              {/* Enhanced live session button - now more prominent */}
              {isLive && (
                <div 
                  className="absolute bottom-16 left-4 right-4 flex justify-center animate-fade-in-up"
                >
                  <button 
                    className="
                      w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                      text-white py-3 px-6 rounded-lg shadow-xl backdrop-blur-sm
                      flex items-center justify-center gap-3 transform transition-all duration-300
                      hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 font-semibold
                      border border-white/20
                    "
                    onClick={handleLiveSessionClick}
                  >
                    <Radio className="w-5 h-5 animate-pulse" />
                    <span className="text-base">Join Live Session</span>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </button>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-xl font-semibold mb-1">{user.name || 'Unnamed DJ'}</h3>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location || 'Unknown Location'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{fans} fans</span>
                  </div>
                  {isLive && (
                    <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-md">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <span className="text-red-200 font-medium">LIVE</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
