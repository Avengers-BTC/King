"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  MessageCircle,
  Users,
  Radio,
  Plus,
  MoreVertical,
  Settings,
  Archive,
  Star,
  Music,
  Crown,
  Headphones,
  X,
  Circle,
  Clock,
  ArrowRight,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getDjChatRoomId, getClubChatRoomId } from '@/lib/chat-room-utils';

interface LiveDJ {
  id: string;
  user: {
    name: string;
    image: string | null;
    username: string;
  };
  genres: string[];
  rating: number;
  currentClub: string | null;
  status: 'PERFORMING' | 'OFFLINE' | 'SCHEDULED' | 'ON_BREAK';
  fans: number;
}

interface Club {
  id: string;
  name: string;
  image: string | null;
  location: string;
  isActive: boolean;
  rating: number;
  capacity: number;
  user: {
    name: string;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'DJ_FAN' | 'CLUB' | 'PUBLIC' | 'PRIVATE';
  isActive: boolean;
  lastActivity: string;
  memberCount: number;
  djId?: string;
  clubId?: string;
  djInfo?: LiveDJ;
  clubInfo?: Club;
}

export default function ChatListPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [liveDJs, setLiveDJs] = useState<LiveDJ[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        let djsData: LiveDJ[] = [];
        let clubsData: Club[] = [];

        // Load live DJs
        const djsResponse = await fetch('/api/djs');
        if (djsResponse.ok) {
          djsData = await djsResponse.json();
          const liveDjsData = djsData.filter((dj: LiveDJ) => dj.status === 'PERFORMING');
          setLiveDJs(liveDjsData);
        }

        // Load active clubs
        const clubsResponse = await fetch('/api/clubs');
        if (clubsResponse.ok) {
          clubsData = await clubsResponse.json();
          const activeClubs = clubsData.filter((club: Club) => club.isActive);
          setClubs(activeClubs);
        }

        // Create chat rooms from live DJs and clubs
        const rooms: ChatRoom[] = [];
        
        // Add DJ chat rooms
        djsData.forEach((dj: LiveDJ) => {
          if (dj.status === 'PERFORMING') {
            rooms.push({
              id: getDjChatRoomId(dj.id, dj.currentClub),
              name: `${dj.user.name}'s Live Chat`,
              type: 'DJ_FAN',
              isActive: true,
              lastActivity: new Date().toISOString(),
              memberCount: Math.floor(Math.random() * 50) + 5, // Will be replaced with real data
              djId: dj.id,
              djInfo: dj
            });
          }
        });

        // Add Club chat rooms
        clubsData.forEach((club: Club) => {
          if (club.isActive) {
            rooms.push({
              id: getClubChatRoomId(club.id),
              name: `${club.name} Chat`,
              type: 'CLUB',
              isActive: true,
              lastActivity: new Date().toISOString(),
              memberCount: Math.floor(Math.random() * 30) + 3, // Will be replaced with real data
              clubId: club.id,
              clubInfo: club
            });
          }
        });

        setChatRooms(rooms);
      } catch (error) {
        console.error('Failed to load chat data:', error);
        toast.error('Failed to load chat rooms');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter chat rooms based on search and active filter
  const filteredRooms = chatRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.djInfo?.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.clubInfo?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeFilter) {
      case 'live-djs':
        return matchesSearch && room.type === 'DJ_FAN';
      case 'clubs':
        return matchesSearch && room.type === 'CLUB';
      case 'favorites':
        return matchesSearch; // TODO: Implement favorites
      default:
        return matchesSearch;
    }
  });

  // Handle chat room navigation
  const handleJoinChat = (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  // Get avatar based on room type
  const getRoomAvatar = (room: ChatRoom) => {
    if (room.djInfo?.user.image) return room.djInfo.user.image;
    if (room.clubInfo?.image) return room.clubInfo.image;
    return null;
  };

  // Get room status
  const getRoomStatus = (room: ChatRoom) => {
    if (room.type === 'DJ_FAN' && room.djInfo?.status === 'PERFORMING') {
      return { text: 'LIVE', color: 'bg-red-500', pulse: true };
    }
    if (room.type === 'CLUB' && room.clubInfo?.isActive) {
      return { text: 'ACTIVE', color: 'bg-green-500', pulse: false };
    }
    return { text: 'OFFLINE', color: 'bg-gray-500', pulse: false };
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Please Sign In</h2>
          <p className="text-gray-400 mb-4">You need to be signed in to access chat</p>
          <Button onClick={() => router.push('/login')} className="bg-pink-500 hover:bg-pink-600">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-b border-gray-700 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Chat Rooms</h1>
              <p className="text-gray-400">Connect with DJs and club communities</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-pink-500 hover:bg-pink-600">
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem onClick={() => router.push('/djs')} className="text-white hover:bg-gray-700">
                  <Radio className="h-4 w-4 mr-2" />
                  Browse DJs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/clubs')} className="text-white hover:bg-gray-700">
                  <Crown className="h-4 w-4 mr-2" />
                  Explore Clubs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats, DJs, clubs..."
                className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:ring-pink-500/50"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Tabs value={activeFilter} onValueChange={setActiveFilter}>
              <TabsList className="bg-gray-800/50 border-gray-700">
                <TabsTrigger value="all" className="data-[state=active]:bg-pink-500">
                  All Chats
                </TabsTrigger>
                <TabsTrigger value="live-djs" className="data-[state=active]:bg-pink-500">
                  Live DJs ({liveDJs.length})
                </TabsTrigger>
                <TabsTrigger value="clubs" className="data-[state=active]:bg-pink-500">
                  Clubs ({clubs.length})
                </TabsTrigger>
                <TabsTrigger value="favorites" className="data-[state=active]:bg-pink-500">
                  Favorites
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Chat Rooms List */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {searchQuery ? 'No matching chats found' : 'No active chats'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? 'Try adjusting your search or browse available DJs and clubs'
                : 'Check back later for live DJ sessions and active club chats'
              }
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => router.push('/djs')} variant="outline" className="border-gray-600">
                <Radio className="h-4 w-4 mr-2" />
                Browse DJs
              </Button>
              <Button onClick={() => router.push('/clubs')} variant="outline" className="border-gray-600">
                <Crown className="h-4 w-4 mr-2" />
                Explore Clubs
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredRooms.map((room, index) => {
                const status = getRoomStatus(room);
                
                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all cursor-pointer group">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-pink-500/30">
                                <AvatarImage src={getRoomAvatar(room) || undefined} />
                                <AvatarFallback className={`${
                                  room.type === 'DJ_FAN' 
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                } text-white`}>
                                  {room.name[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              {/* Status Badge */}
                              <div className={`absolute -top-1 -right-1 ${status.color} text-white text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${status.pulse ? 'animate-pulse' : ''}`}>
                                <Circle className="w-2 h-2 fill-current" />
                                <span className="hidden sm:inline">{status.text}</span>
                              </div>
                            </div>

                            {/* Room Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white truncate text-sm sm:text-base">
                                  {room.name}
                                </h3>
                                <Badge variant="secondary" className={`text-xs ${
                                  room.type === 'DJ_FAN' 
                                    ? 'bg-purple-500/20 text-purple-300' 
                                    : 'bg-blue-500/20 text-blue-300'
                                }`}>
                                  {room.type === 'DJ_FAN' ? '🎵 DJ' : '👑 Club'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{room.memberCount} members</span>
                                </div>
                                
                                {room.djInfo && (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-yellow-400" />
                                      <span>{room.djInfo.rating.toFixed(1)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Music className="w-3 h-3 text-green-400" />
                                      <span>{room.djInfo.genres[0] || 'DJ'}</span>
                                    </div>
                                  </>
                                )}
                                
                                {room.clubInfo && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{room.clubInfo.location}</span>
                                  </div>
                                )}
                              </div>

                              {/* Now Playing / Status */}
                              {room.type === 'DJ_FAN' && room.djInfo?.status === 'PERFORMING' && (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="text-green-400 text-xs font-medium">
                                    🎵 Now Playing{room.djInfo.currentClub && ` at ${room.djInfo.currentClub}`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="shrink-0 ml-4">
                            <Button
                              onClick={() => handleJoinChat(room.id)}
                              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white group-hover:scale-105 transition-all"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Join Chat</span>
                              <span className="sm:hidden">Join</span>
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
