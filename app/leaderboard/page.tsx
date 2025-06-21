'use client';

import { useState, useEffect } from 'react';
import { Trophy, Flame, Users, TrendingUp, Crown, Medal, Award } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types for API data
interface DJ {
  id: string;
  genre: string;
  user: {
    name: string | null;
    image: string | null;
    location: string | null;
  };
}

interface Club {
  id: string;
  name: string;
  location: string;
  image?: string;
  rating: number;
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-400" />;
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />;
    case 3:
      return <Award className="h-6 w-6 text-amber-600" />;
    default:
      return <span className="text-lg font-bold text-app-text/60">#{rank}</span>;
  }
}

function DJLeaderboard({ djs }: { djs: DJ[] }) {
  return (
    <div className="space-y-4">
      {djs.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 text-app-text/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-app-text mb-2">No DJs Yet</h3>
            <p className="text-app-text/60">Be the first DJ to join the leaderboard!</p>
          </CardContent>
        </Card>
      ) : (
        djs.map((dj, index) => (
          <Card key={dj.id} className={`glass-card transition-all duration-300 hover:border-electric-pink/50 ${
            index < 3 ? 'border-electric-pink/30' : ''
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getRankIcon(index + 1)}
                </div>
                
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-electric-pink/30">
                  <img 
                    src={dj.user.image || '/default-avatar.jpg'} 
                    alt={dj.user.name || 'DJ'} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-app-text">{dj.user.name || 'Unknown DJ'}</h3>
                  <p className="text-sm text-electric-pink">{dj.genre}</p>
                  <p className="text-xs text-app-text/60">{dj.user.location || 'Location not set'}</p>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="flex items-center space-x-2">
                    <Flame className="h-4 w-4 text-electric-pink" />
                    <span className="text-lg font-bold text-electric-pink">#{index + 1}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-app-text/60">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>0 fans</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>0 views</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function ClubLeaderboard({ clubs }: { clubs: Club[] }) {
  return (
    <div className="space-y-4">
      {clubs.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 text-app-text/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-app-text mb-2">No Clubs Yet</h3>
            <p className="text-app-text/60">Be the first club to join the leaderboard!</p>
          </CardContent>
        </Card>
      ) : (
        clubs.map((club, index) => (
          <Card key={club.id} className={`glass-card transition-all duration-300 hover:border-neon-cyan/50 ${
            index < 3 ? 'border-neon-cyan/30' : ''
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getRankIcon(index + 1)}
                </div>
                
                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-neon-cyan/30">
                  <img 
                    src={club.image || '/default-club.jpg'} 
                    alt={club.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-app-text">{club.name}</h3>
                  <p className="text-sm text-neon-cyan">{club.location}</p>
                  <p className="text-xs text-app-text/60">Rating: {club.rating}/5</p>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="flex items-center space-x-2">
                    <Flame className="h-4 w-4 text-neon-cyan" />
                    <span className="text-lg font-bold text-neon-cyan">#{index + 1}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-app-text/60">
                    <div>★ {club.rating}</div>
                    <div>0 check-ins</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  const [djs, setDjs] = useState<DJ[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalVotes: 0, engagementRate: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [djsResponse, clubsResponse] = await Promise.all([
          fetch('/api/djs'),
          fetch('/api/clubs')
        ]);

        const [djsData, clubsData] = await Promise.all([
          djsResponse.json(),
          clubsResponse.json()
        ]);

        setDjs(Array.isArray(djsData) ? djsData : []);
        setClubs(Array.isArray(clubsData) ? clubsData : []);
        setStats({
          totalUsers: (djsData?.length || 0) + (clubsData?.length || 0),
          totalVotes: 0, // This would be calculated from real engagement data
          engagementRate: 0 // This would be calculated from real metrics
        });
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setDjs([]);
        setClubs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-electric-pink animate-float" />
          </div>
          <h1 className="text-4xl font-bold text-app-text mb-4">
            Daily <span className="bg-neon-gradient bg-clip-text text-transparent">Leaderboard</span>
          </h1>
          <p className="text-app-text/70 max-w-2xl mx-auto">
            See who&apos;s ruling the nightlife scene today. Rankings are updated in real-time 
            based on fan votes, views, and engagement.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Flame className="h-12 w-12 text-electric-pink mx-auto mb-4" />
              <div className="text-2xl font-bold text-app-text mb-2">{stats.totalVotes}</div>
              <div className="text-app-text/70">Total Votes Today</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-neon-cyan mx-auto mb-4" />
              <div className="text-2xl font-bold text-app-text mb-2">{stats.totalUsers}</div>
              <div className="text-app-text/70">Active Users</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-electric-pink mx-auto mb-4" />
              <div className="text-2xl font-bold text-app-text mb-2">{stats.engagementRate}%</div>
              <div className="text-app-text/70">Engagement Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="djs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-app-surface">
            <TabsTrigger 
              value="djs" 
              className="data-[state=active]:bg-electric-pink data-[state=active]:text-white"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Top DJs
            </TabsTrigger>
            <TabsTrigger 
              value="clubs"
              className="data-[state=active]:bg-neon-cyan data-[state=active]:text-app-bg"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Top Clubs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="djs">
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="glass-card animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-16 bg-app-surface/50 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <DJLeaderboard djs={djs} />
            )}
          </TabsContent>

          <TabsContent value="clubs">
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="glass-card animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-16 bg-app-surface/50 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <ClubLeaderboard clubs={clubs} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
