'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MessageCircle, Users, Phone, Video, MoreVertical, 
  Smile, Mic, Send, Search, Settings, UserPlus, Info, 
  MicOff, Circle, ChevronDown, X, Heart, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useChat } from '@/hooks/use-chat';
import { useChatRoom } from '@/hooks/use-chat-room';
import { toast } from 'sonner';
import { ConnectionStatus } from '@/components/ui/connection-status';

interface DJInfo {
  id: string;
  name: string;
  image: string | null;
  genre: string;
  rating: number;
  isLive: boolean;
  currentClub: string | null;
  bio: string | null;
}

interface ClubInfo {
  id: string;
  name: string;
  image: string | null;
  location: string;
  description: string | null;
  rating: number;
  isActive: boolean;
}

interface RoomInfo {
  id: string;
  name: string;
  type: 'DJ_FAN' | 'CLUB' | 'PUBLIC' | 'PRIVATE';
  djInfo?: DJInfo;
  clubInfo?: ClubInfo;
  memberCount: number;
}

export default function ChatRoom() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  
  // Type roomId properly
  const roomId = typeof params.roomId === 'string' ? params.roomId : params.roomId?.[0] || '';
  
  const { messages, sendMessage, isConnected, addReaction, removeReaction } = useChat(roomId);
  const { userCount, typingUsers, onlineUsers, isConnected: roomConnected } = useChatRoom(roomId);
  
  // State management
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [infoSheetOpen, setInfoSheetOpen] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load room information
  useEffect(() => {
    const loadRoomInfo = async () => {
      try {
        setLoading(true);
        
        // Parse room ID to determine type and get appropriate data
        if (roomId.startsWith('dj_')) {
          const djId = roomId.split('_')[1];
          const response = await fetch(`/api/djs/${djId}`);
          
          if (response.ok) {
            const djData = await response.json();
            setRoomInfo({
              id: roomId,
              name: `${djData.user.name}'s Live Chat`,
              type: 'DJ_FAN',
              djInfo: {
                id: djData.id,
                name: djData.user.name,
                image: djData.user.image,
                genre: djData.genres?.[0] || djData.genre || 'DJ',
                rating: djData.rating,
                isLive: djData.status === 'PERFORMING',
                currentClub: djData.currentClub,
                bio: djData.bio
              },
              memberCount: userCount
            });
          }
        } else if (roomId.startsWith('club_')) {
          const clubId = roomId.split('_')[1];
          const response = await fetch(`/api/clubs/${clubId}`);
          
          if (response.ok) {
            const clubData = await response.json();
            setRoomInfo({
              id: roomId,
              name: `${clubData.name} Chat`,
              type: 'CLUB',
              clubInfo: {
                id: clubData.id,
                name: clubData.name,
                image: clubData.image,
                location: clubData.location,
                description: clubData.description,
                rating: clubData.rating,
                isActive: clubData.isActive
              },
              memberCount: userCount
            });
          }
        } else {
          // Generic room
          setRoomInfo({
            id: roomId,
            name: 'Chat Room',
            type: 'PUBLIC',
            memberCount: userCount
          });
        }
      } catch (error) {
        console.error('Failed to load room info:', error);
        toast.error('Failed to load room information');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      loadRoomInfo();
    }
  }, [roomId, userCount]);

  // Handle message send
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  // Voice recording functions
  const startRecording = () => {
    setIsRecording(true);
    toast.info('Voice messages coming soon!');
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120); // Max height 120px
    textarea.style.height = `${newHeight}px`;
  };

  // Get avatar background based on role
  const getAvatarBg = (role?: string) => {
    switch (role) {
      case 'DJ': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'CLUB_OWNER': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  // Get role badge
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'DJ': return <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">🎵 DJ</Badge>;
      case 'CLUB_OWNER': return <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">👑 Owner</Badge>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-b border-gray-700 p-3 sm:p-4 flex items-center justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20"></div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4 relative z-10 flex-1 min-w-0">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-300 hover:text-white hover:bg-gray-700/50 p-2 shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Room Avatar & Info */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="relative shrink-0">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-pink-500/30">
                <AvatarImage src={roomInfo?.djInfo?.image || roomInfo?.clubInfo?.image || undefined} />
                <AvatarFallback className={getAvatarBg(roomInfo?.djInfo ? 'DJ' : roomInfo?.clubInfo ? 'CLUB_OWNER' : 'USER')}>
                  {roomInfo?.name?.[0]?.toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              
              {/* Live Indicator */}
              {roomInfo?.djInfo?.isLive && (
                <div className="absolute -top-1 -right-1">
                  <div className="bg-red-500 text-white text-xs px-1 sm:px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1 animate-pulse">
                    <Circle className="w-1.5 h-1.5 sm:w-2 sm:h-2 fill-current" />
                    <span className="hidden sm:inline">LIVE</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <h1 className="text-white font-semibold truncate text-sm sm:text-lg">
                  {roomInfo?.name || 'Chat Room'}
                </h1>
                <div className="hidden sm:block">
                  {roomInfo?.djInfo && getRoleBadge('DJ')}
                  {roomInfo?.clubInfo && getRoleBadge('CLUB_OWNER')}
                </div>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                <div className="flex items-center gap-1 text-gray-400">
                  <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>{userCount || roomInfo?.memberCount || 0}</span>
                  <span className="hidden sm:inline">members</span>
                </div>
                
                {roomInfo?.djInfo?.isLive && (
                  <div className="text-green-400 text-xs font-medium hidden sm:block">
                    🎵 Now Playing
                  </div>
                )}
                
                <ConnectionStatus />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2 relative z-10 shrink-0">
          {/* Voice Call - Hidden on small screens */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-700/50 p-2 hidden sm:flex"
            onClick={() => toast.info('Voice calls coming soon!')}
          >
            <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Video Call - Hidden on small screens */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-700/50 p-2 hidden sm:flex"
            onClick={() => toast.info('Video calls coming soon!')}
          >
            <Video className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Chat Info */}
          <Sheet open={infoSheetOpen} onOpenChange={setInfoSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-700/50 p-2"
              >
                <Info className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 border-gray-700 w-full sm:w-80">
              <SheetHeader>
                <SheetTitle className="text-white">Chat Information</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Room Details */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Room Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type</span>
                      <span className="text-white capitalize">{roomInfo?.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Members</span>
                      <span className="text-white">{userCount}</span>
                    </div>
                    {roomInfo?.djInfo?.rating && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">DJ Rating</span>
                        <span className="text-white">⭐ {roomInfo.djInfo.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Online Members */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Online Members ({onlineUsers.length})</h3>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {onlineUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800/50">
                          <div className="relative">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className={getAvatarBg(user.role)}>
                                {user.name?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-white text-sm truncate">{user.name}</span>
                              {getRoleBadge(user.role)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Settings */}
                <Separator className="bg-gray-700" />
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Settings</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start border-gray-600">
                      <Search className="w-4 h-4 mr-2" />
                      Search Messages
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-gray-600">
                      <Settings className="w-4 h-4 mr-2" />
                      Chat Settings
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className="p-2 sm:p-4 pb-20 space-y-2 sm:space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => {
                const isOwnMessage = message.sender?.id === session?.user?.id;
                const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1]?.sender?.id !== message.sender?.id);

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end space-x-1 sm:space-x-2`}
                  >
                    {/* Avatar for incoming messages */}
                    {showAvatar && !isOwnMessage && (
                      <div className="relative shrink-0">
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                          <AvatarImage src={message.sender?.image || undefined} />
                          <AvatarFallback className={getAvatarBg(message.sender?.role)}>
                            {message.sender?.name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                      </div>
                    )}

                    {/* Spacer for messages from same user */}
                    {!showAvatar && !isOwnMessage && <div className="w-6 sm:w-8 shrink-0" />}

                    {/* Message Content */}
                    <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[60%] ${isOwnMessage ? 'order-first' : ''}`}>
                      {/* Sender name and role */}
                      {showAvatar && !isOwnMessage && (
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 px-2 sm:px-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-300">
                            {message.sender?.name || 'Unknown User'}
                          </span>
                          <div className="hidden sm:block">
                            {getRoleBadge(message.sender?.role)}
                          </div>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={`relative rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                            : 'bg-gray-800 text-gray-100'
                        } ${showAvatar || isOwnMessage ? '' : 'ml-2 sm:ml-3'}`}
                      >
                        {/* Message text */}
                        <p className="text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap">
                          {message.message}
                        </p>

                        {/* Timestamp */}
                        <div className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-400'}`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>

                        {/* Reactions */}
                        {message.reactions && Object.keys(message.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(message.reactions).map(([emoji, userIds]) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  if (userIds.includes(session?.user?.id || '')) {
                                    removeReaction(message.id, emoji);
                                  } else {
                                    addReaction(message.id, emoji);
                                  }
                                }}
                                className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex items-center gap-1 transition-all ${
                                  userIds.includes(session?.user?.id || '')
                                    ? 'bg-pink-500/30 text-pink-300 ring-1 ring-pink-500/50'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span>{userIds.length}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 px-2 sm:px-4"
              >
                <div className="flex space-x-1">
                  {typingUsers.slice(0, 3).map((user) => (
                    <Avatar key={user.id} className="h-4 w-4 sm:h-6 sm:w-6">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className={getAvatarBg(user.role)}>
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  {typingUsers.length === 1
                    ? `${typingUsers[0].name} is typing...`
                    : `${typingUsers.length} people are typing...`}
                </div>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Enhanced Input Area */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 p-2 sm:p-4 safe-area-bottom">
        {/* Recording Indicator */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30"
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-sm font-medium">Recording voice message...</span>
              <Button
                size="sm"
                variant="outline"
                onClick={stopRecording}
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                Stop
              </Button>
            </div>
          </motion.div>
        )}

        {/* Input Container */}
        <div className="flex items-end space-x-1 sm:space-x-3">
          {/* Emoji Picker - Hidden on small screens */}
          <div className="relative hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-2"
            >
              <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 left-0 z-50">
                <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 w-80 max-w-sm">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium text-sm">Emojis</h3>
                    <button
                      onClick={() => setShowEmojiPicker(false)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Emoji Categories */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {/* Frequently Used */}
                    <div>
                      <div className="text-xs text-gray-400 mb-2 font-medium">Frequently Used</div>
                      <div className="grid grid-cols-8 gap-1">
                        {['😀', '😂', '❤️', '👍', '🔥', '💯', '🎵', '🎉'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="text-xl hover:bg-gray-700 p-2 rounded-lg transition-colors flex items-center justify-center aspect-square"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Smileys & People */}
                    <div>
                      <div className="text-xs text-gray-400 mb-2 font-medium">Smileys & People</div>
                      <div className="grid grid-cols-8 gap-1">
                        {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="text-xl hover:bg-gray-700 p-2 rounded-lg transition-colors flex items-center justify-center aspect-square"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Music & Party */}
                    <div>
                      <div className="text-xs text-gray-400 mb-2 font-medium">Music & Party</div>
                      <div className="grid grid-cols-8 gap-1">
                        {['🎵', '🎶', '🎤', '🎧', '🎼', '🎹', '🥁', '🎸', '🎺', '🎷', '🎻', '🎪', '🎭', '🎨', '🎬', '🎮', '🕹️', '🎲', '🎯', '🎱', '🎳', '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍾', '🥂', '🍻'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="text-xl hover:bg-gray-700 p-2 rounded-lg transition-colors flex items-center justify-center aspect-square"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gestures & Symbols */}
                    <div>
                      <div className="text-xs text-gray-400 mb-2 font-medium">Gestures & Symbols</div>
                      <div className="grid grid-cols-8 gap-1">
                        {['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="text-xl hover:bg-gray-700 p-2 rounded-lg transition-colors flex items-center justify-center aspect-square"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hearts & Symbols */}
                    <div>
                      <div className="text-xs text-gray-400 mb-2 font-medium">Hearts & Symbols</div>
                      <div className="grid grid-cols-8 gap-1">
                        {['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="text-xl hover:bg-gray-700 p-2 rounded-lg transition-colors flex items-center justify-center aspect-square"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="min-h-[40px] sm:min-h-[48px] max-h-[100px] sm:max-h-[120px] resize-none bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 pr-10 sm:pr-12 focus:ring-2 focus:ring-pink-500/50 focus:border-transparent text-sm sm:text-base"
              disabled={!isConnected}
              rows={1}
            />
            
            {/* Character count for long messages */}
            {newMessage.length > 200 && (
              <div className="absolute -top-6 right-2 text-xs text-gray-400">
                {newMessage.length}/1000
              </div>
            )}
          </div>

          {/* Voice Recording Button */}
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 transition-all shrink-0 ${
              isRecording ? 'bg-red-500/20 text-red-400' : ''
            }`}
          >
            {isRecording ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed p-2 sm:p-3 rounded-full transition-all hover:scale-105 shrink-0"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Status Info */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
            {!isConnected && (
              <span className="text-red-400">Disconnected - Trying to reconnect...</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span>{userCount} online</span>
          </div>
        </div>
      </div>
    </div>
  );
} 