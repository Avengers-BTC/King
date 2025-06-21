'use client';

import { useState } from 'react';
import { Search, MapPin, Star } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ClubCard } from '@/components/club-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data - Replace with real data from your API
const allClubs: Array<{
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  events?: Array<{
    name: string;
    dj: {
      user: {
        name: string | null;
      };
    };
  }>;
}> = [
  // Add your real clubs here when you create them
  // Example structure:
  // {
  //   id: '1',
  //   name: 'Club Name',
  //   location: 'Nairobi, Kenya',
  //   image: 'image-url',
  //   rating: 4.5,
  //   events: [
  //     {
  //       name: 'Event Name',
  //       dj: {
  //         user: {
  //           name: 'DJ Name'
  //         }
  //       }
  //     }
  //   ]
  // }
];

export default function ClubsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  const filteredClubs = allClubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || club.location.includes(selectedLocation);
    const matchesRating = selectedRating === 'all' || club.rating >= parseFloat(selectedRating);
    
    return matchesSearch && matchesLocation && matchesRating;
  });

  const cities = allClubs.length > 0 
    ? allClubs.map(club => club.location.split(',')[0])
        .filter((city, index, array) => array.indexOf(city) === index)
    : [];

  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-app-text mb-4">
            Discover Epic <span className="text-neon-cyan">Clubs</span>
          </h1>
          <p className="text-app-text/70 max-w-2xl mx-auto">
            Find the hottest clubs in your city. From intimate lounges to massive venues, 
            discover where the best parties happen.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-app-text/60" />
              <Input
                placeholder="Search clubs by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-app-surface border-neon-cyan/30 focus:border-neon-cyan"
              />
            </div>
            
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full md:w-48 bg-app-surface border-neon-cyan/30">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger className="w-full md:w-48 bg-app-surface border-neon-cyan/30">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Rating</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.0">4.0+ Stars</SelectItem>
                <SelectItem value="3.5">3.5+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-app-text/70">
            Showing {filteredClubs.length} of {allClubs.length} clubs
          </p>
        </div>

        {/* Club Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <ClubCard key={club.id} {...club} />
          ))}
        </div>

        {filteredClubs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-app-text/60 text-lg">
              No clubs found matching your criteria. Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
