'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Radio,
  Headphones,
  Users,
  Heart,
  Share2,
  Settings,
  Maximize,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveStreamPlayerProps {
  djName: string;
  djImage?: string;
  clubName?: string;
  isLive: boolean;
  listeners?: number;
  genre?: string;
  onLike?: () => void;
  onShare?: () => void;
  className?: string;
}

export function LiveStreamPlayer({
  djName,
  djImage,
  clubName,
  isLive,
  listeners = 0,
  genre,
  onLike,
  onShare,
  className
}: LiveStreamPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('good');
  const [hasLiked, setHasLiked] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Simulate connection quality changes
  useEffect(() => {
    if (!isLive) {
      setConnectionQuality('disconnected');
      return;
    }

    const interval = setInterval(() => {
      const qualities: Array<'excellent' | 'good' | 'poor'> = ['excellent', 'good', 'poor'];
      const weights = [0.6, 0.3, 0.1]; // Bias towards better quality
      const random = Math.random();
      
      let cumWeight = 0;
      for (let i = 0; i < qualities.length; i++) {
        cumWeight += weights[i];
        if (random <= cumWeight) {
          setConnectionQuality(qualities[i]);
          break;
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handlePlayPause = () => {
    if (!isLive) return;
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (newVolume[0] === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleLike = () => {
    setHasLiked(!hasLiked);
    onLike?.();
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'good':
        return <Wifi className="w-4 h-4 text-yellow-500" />;
      case 'poor':
        return <Wifi className="w-4 h-4 text-red-500" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionQuality) {
      case 'excellent':
        return 'HD Quality';
      case 'good':
        return 'Good Quality';
      case 'poor':
        return 'Low Quality';
      case 'disconnected':
        return 'Disconnected';
    }
  };

  if (!isLive) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-muted-foreground" />
            Live Stream
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[400px] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-muted/20 to-muted/40">
            <Radio className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2 text-muted-foreground">Stream Offline</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {djName} is not currently streaming. Follow them to get notified when they go live!
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onLike}>
                <Heart className="w-4 h-4 mr-2" />
                Follow DJ
              </Button>
              <Button variant="outline" onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden border-red-500/20", className)} ref={playerRef}>
      <CardHeader className="border-b bg-gradient-to-r from-red-500/10 to-pink-500/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <span>Live Stream</span>
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {getConnectionIcon()}
            <span className="text-muted-foreground">{getConnectionText()}</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Main Stream Area */}
        <div className="relative h-[400px] bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-red-900/20 overflow-hidden">
          {/* Background Animation */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%] animate-shimmer"></div>
            
            {/* Audio Visualizer Simulation */}
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 p-4">
              {Array.from({ length: 32 }, (_, i) => (
                <motion.div
                  key={i}
                  className="bg-gradient-to-t from-red-500 to-pink-500 w-1 rounded-full"
                  animate={{
                    height: isPlaying ? 
                      [Math.random() * 40 + 10, Math.random() * 60 + 20, Math.random() * 40 + 10] :
                      [5, 5, 5]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.05
                  }}
                />
              ))}
            </div>
          </div>

          {/* DJ Info Overlay */}
          <div className="absolute top-4 left-4 right-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <img 
                  src={djImage || '/default-dj.jpg'} 
                  alt={djName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                />
                <div>
                  <h3 className="font-bold text-white">{djName}</h3>
                  {clubName && (
                    <p className="text-white/80 text-sm">@ {clubName}</p>
                  )}
                  {genre && (
                    <p className="text-white/60 text-xs">{genre}</p>
                  )}
                </div>
              </div>

              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                <div className="flex items-center gap-1 text-white">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{listeners}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              variant={isPlaying ? "secondary" : "default"}
              className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                {/* Volume Control */}
                <div className="flex items-center gap-2 flex-1 max-w-32">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={handleMute}
                  >
                    {isMuted || volume[0] === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  <Slider
                    value={isMuted ? [0] : volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "text-white hover:bg-white/20",
                      hasLiked && "text-red-500"
                    )}
                    onClick={handleLike}
                  >
                    <Heart className={cn("w-4 h-4", hasLiked && "fill-current")} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={onShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stream Info */}
        <div className="p-4 bg-muted/30">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>🎵 Now Playing</span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {isPlaying ? 'Streaming' : 'Paused'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="w-3 h-3" />
              <span>High Quality Audio</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 