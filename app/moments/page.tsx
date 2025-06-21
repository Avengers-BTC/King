'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share, Plus, Filter } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GlowButton } from '@/components/ui/glow-button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data - Replace with real data from your API
const moments: Array<{
  id: string;
  user: string;
  avatar: string;
  title: string;
  image: string;
  location: string;
  likes: number;
  comments: number;
  timeAgo: string;
  type: string;
}> = [
  // Add your real moments here when users create them
  // Moments will appear here once users start uploading
];

export default function MomentsPage() {
  const [filter, setFilter] = useState('all');

  const filteredMoments = moments.filter(moment => {
    if (filter === 'all') return true;
    return moment.type === filter;
  });

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

        {/* Moments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMoments.map((moment) => (
            <Card key={moment.id} className="glass-card group hover:border-electric-pink/30 transition-all duration-300 overflow-hidden">
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-electric-pink/10 to-neon-cyan/10">
                  <img 
                    src={moment.image} 
                    alt={moment.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {moment.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-electric-pink/80 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 text-white fill-current">
                          ▶
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2 bg-app-bg/80 backdrop-blur-sm rounded-full px-2 py-1">
                  <span className="text-xs text-app-text">{moment.timeAgo}</span>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img src={moment.avatar} alt={moment.user} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-medium text-electric-pink">{moment.user}</span>
                </div>
                
                <h3 className="font-semibold text-app-text mb-1">{moment.title}</h3>
                <p className="text-xs text-app-text/60 mb-3">{moment.location}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-app-text/60 hover:text-electric-pink transition-colors">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">{moment.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-app-text/60 hover:text-neon-cyan transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">{moment.comments}</span>
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

        {filteredMoments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-app-text/60 text-lg">
              No moments found matching your filter. Try selecting a different filter.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
