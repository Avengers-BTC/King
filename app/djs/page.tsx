'use client';

import { useState } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { DJCard } from '@/components/dj-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data - Replace with real data from your API
const allDJs: Array<{
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
}> = [
  // Add your real DJs here when you create them
  // Example structure:
  // {
  //   id: '1',
  //   genre: 'Amapiano',
  //   rating: 4.5,
  //   fans: 1000,
  //   currentClub: null,
  //   user: {
  //     name: 'DJ Name',
  //     image: 'image-url',
  //     location: 'Nairobi, Kenya'
  //   }
  // }
];

export default function DJsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const filteredDJs = allDJs.filter(dj => {
    const matchesSearch = dj.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dj.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || dj.genre === selectedGenre;
    const matchesLocation = selectedLocation === 'all' || dj.user.location === selectedLocation;
    
    return matchesSearch && matchesGenre && matchesLocation;
  });

  const genres = allDJs.length > 0 
    ? allDJs.map(dj => dj.genre).filter((genre, index, array) => array.indexOf(genre) === index)
    : [];
  const locations = allDJs.length > 0 
    ? allDJs.map(dj => dj.user.location)
        .filter((location): location is string => location !== null)
        .filter((location, index, array) => array.indexOf(location) === index)
    : [];

  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-app-text mb-4">
            Discover Amazing <span className="text-electric-pink">DJs</span>
          </h1>
          <p className="text-app-text/70 max-w-2xl mx-auto">
            Connect with the best DJs in the scene. Find your favorite genres, 
            discover new sounds, and follow the artists that move you.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-app-text/60" />
              <Input
                placeholder="Search DJs by name or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-app-surface border-electric-pink/30 focus:border-electric-pink"
              />
            </div>
            
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full md:w-48 bg-app-surface border-electric-pink/30">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full md:w-48 bg-app-surface border-electric-pink/30">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-app-text/70">
            Showing {filteredDJs.length} of {allDJs.length} DJs
          </p>
        </div>

        {/* DJ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDJs.map((dj) => (
            <DJCard key={dj.id} {...dj} />
          ))}
        </div>

        {filteredDJs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-app-text/60 text-lg">
              No DJs found matching your criteria. Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
