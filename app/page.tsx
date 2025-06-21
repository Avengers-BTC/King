'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, Music, Users } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GlowButton } from '@/components/ui/glow-button';
import { DJCard } from '@/components/dj-card';
import { ClubCard } from '@/components/club-card';

interface DJ {
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

interface Club {
  id: string;
  name: string;
  location: string;
  rating: number;
  image?: string;
  events: Array<{
    name: string;
    dj: {
      user: {
        name: string | null;
      };
    };
  }>;
}

export default function Home() {
  const [topDJs, setTopDJs] = useState<DJ[]>([]);
  const [topClubs, setTopClubs] = useState<Club[]>([]);
  const [stats, setStats] = useState({ djCount: 0, clubCount: 0, momentCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [djsResponse, clubsResponse, allDjsResponse, allClubsResponse, momentsResponse] = await Promise.all([
          fetch('/api/djs?limit=3'),
          fetch('/api/clubs?limit=3'),
          fetch('/api/djs'),
          fetch('/api/clubs'),
          fetch('/api/moments')
        ]);

        const [djs, clubs, allDjs, allClubs, moments] = await Promise.all([
          djsResponse.json(),
          clubsResponse.json(),
          allDjsResponse.json(),
          allClubsResponse.json(),
          momentsResponse.json()
        ]);

        setTopDJs(djs);
        setTopClubs(clubs);
        setStats({
          djCount: Array.isArray(allDjs) ? allDjs.length : 0,
          clubCount: Array.isArray(allClubs) ? allClubs.length : 0,
          momentCount: Array.isArray(moments) ? moments.length : 0
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-app-bg via-app-bg/90 to-app-bg z-10" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-app-text mb-6">
            Welcome to <span className="text-electric-pink">NightVibe</span>
          </h1>
          <p className="text-xl sm:text-2xl text-app-text/70 mb-8 max-w-3xl mx-auto">
            Your ultimate platform for discovering and connecting with the best DJs, clubs, and nightlife experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GlowButton href="/signup" size="lg">
              Get Started
              <Sparkles className="ml-2 h-5 w-5" />
            </GlowButton>
            <GlowButton href="/about" variant="secondary" size="lg">
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </GlowButton>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-electric-pink/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="glass-card p-6">
              <Music className="h-12 w-12 text-electric-pink mx-auto mb-4" />
              <div className="text-3xl font-bold text-app-text mb-2">{stats.djCount}</div>
              <div className="text-app-text/70">Active DJs</div>
            </div>
            <div className="glass-card p-6">
              <Users className="h-12 w-12 text-neon-cyan mx-auto mb-4" />
              <div className="text-3xl font-bold text-app-text mb-2">{stats.clubCount}</div>
              <div className="text-app-text/70">Nightlife Venues</div>
            </div>
            <div className="glass-card p-6">
              <TrendingUp className="h-12 w-12 text-electric-pink mx-auto mb-4" />
              <div className="text-3xl font-bold text-app-text mb-2">{stats.momentCount}</div>
              <div className="text-app-text/70">Moments Shared</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top DJs Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-app-text">
              Top <span className="text-electric-pink">DJs</span> Today
            </h2>
            <Link href="/djs">
              <GlowButton variant="secondary" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </GlowButton>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-app-surface/50 rounded-lg h-[300px]" />
                </div>
              ))
            ) : (
              topDJs.map((dj) => (
                <DJCard key={dj.id} {...dj} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Top Clubs Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-app-surface/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-app-text">
              Featured <span className="text-neon-cyan">Clubs</span>
            </h2>
            <Link href="/clubs">
              <GlowButton variant="secondary" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </GlowButton>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-app-surface/50 rounded-lg h-[300px]" />
                </div>
              ))
            ) : (
              topClubs.map((club) => (
                <ClubCard key={club.id} {...club} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-app-text mb-6">
            Ready to Experience the <span className="text-electric-pink">Best Nightlife</span>?
          </h2>
          <p className="text-lg text-app-text/70 mb-8">
            Join NightVibe today and discover the most exciting venues, talented DJs, and unforgettable moments.
          </p>
          <GlowButton href="/signup" size="lg">
            Join the Community
            <Sparkles className="ml-2 h-5 w-5" />
          </GlowButton>
        </div>
      </section>

      <Footer />
    </div>
  );
}
