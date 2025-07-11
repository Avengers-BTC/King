'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity,
  Users,
  Clock,
  TrendingUp,
  Calendar,
  Radio,
  BarChart3,
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StreamingSession {
  id: string;
  date: string;
  duration: string;
  peakListeners: number;
  averageListeners: number;
  club: string;
  status: 'completed' | 'active';
}

interface LiveStreamingAnalyticsProps {
  djId: string;
  isCurrentlyLive?: boolean;
  currentListeners?: number;
  sessionDuration?: number;
}

export function LiveStreamingAnalytics({ 
  djId, 
  isCurrentlyLive = false,
  currentListeners = 0,
  sessionDuration = 0
}: LiveStreamingAnalyticsProps) {
  const [sessions, setSessions] = useState<StreamingSession[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalSessions: 0,
    totalHours: 0,
    averageListeners: 0,
    peakListeners: 0,
  });

  // Mock data for now - in real app this would come from API
  useEffect(() => {
    const mockSessions: StreamingSession[] = [
      {
        id: '1',
        date: '2024-01-15',
        duration: '2h 30m',
        peakListeners: 45,
        averageListeners: 32,
        club: 'Club XYZ',
        status: 'completed'
      },
      {
        id: '2',
        date: '2024-01-12',
        duration: '1h 45m',
        peakListeners: 38,
        averageListeners: 28,
        club: 'The Venue',
        status: 'completed'
      },
      {
        id: '3',
        date: '2024-01-10',
        duration: '3h 15m',
        peakListeners: 62,
        averageListeners: 41,
        club: 'Nightclub One',
        status: 'completed'
      },
    ];

    if (isCurrentlyLive) {
      mockSessions.unshift({
        id: 'current',
        date: new Date().toISOString().split('T')[0],
        duration: formatDuration(sessionDuration),
        peakListeners: currentListeners,
        averageListeners: Math.floor(currentListeners * 0.8),
        club: 'Current Session',
        status: 'active'
      });
    }

    setSessions(mockSessions);

    // Calculate total stats
    const completedSessions = mockSessions.filter(s => s.status === 'completed');
    setTotalStats({
      totalSessions: completedSessions.length,
      totalHours: completedSessions.length * 2.5, // Mock calculation
      averageListeners: Math.floor(completedSessions.reduce((sum, s) => sum + s.averageListeners, 0) / completedSessions.length) || 0,
      peakListeners: Math.max(...completedSessions.map(s => s.peakListeners), 0),
    });
  }, [isCurrentlyLive, currentListeners, sessionDuration]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Live Status */}
      {isCurrentlyLive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-red-500/20 bg-gradient-to-r from-red-500/5 to-pink-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="relative">
                  <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <span>Live Now</span>
                <Badge variant="destructive" className="animate-pulse">
                  STREAMING
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{currentListeners}</div>
                  <div className="text-xs text-muted-foreground">Current Listeners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatDuration(sessionDuration)}</div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {Math.floor(currentListeners * 0.8)}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg. Listeners</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Overall Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Streaming Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{totalStats.totalSessions}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Radio className="w-3 h-3" />
                Total Sessions
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{totalStats.totalHours}h</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                Total Hours
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-500">{totalStats.averageListeners}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Users className="w-3 h-3" />
                Avg. Listeners
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-500">{totalStats.peakListeners}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Peak Listeners
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No streaming sessions yet</p>
                <p className="text-xs">Start your first live session to see analytics here</p>
              </div>
            ) : (
              sessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`
                    p-4 rounded-lg border transition-all duration-200 hover:shadow-md
                    ${session.status === 'active' 
                      ? 'border-red-500/20 bg-red-500/5' 
                      : 'border-border bg-muted/20 hover:bg-muted/40'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${session.status === 'active' 
                          ? 'bg-red-500/20 text-red-500' 
                          : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        <Radio className={`w-4 h-4 ${session.status === 'active' ? 'animate-pulse' : ''}`} />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {formatDate(session.date)}
                          {session.status === 'active' && (
                            <Badge variant="destructive" className="text-xs animate-pulse">
                              LIVE
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{session.club}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">{session.duration}</div>
                      <div className="text-sm text-muted-foreground">
                        Peak: {session.peakListeners} listeners
                      </div>
                    </div>
                  </div>
                  
                  {session.status === 'completed' && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Avg: {session.averageListeners}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Views: {session.peakListeners * 1.5}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          Likes: {Math.floor(session.averageListeners * 0.7)}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
          
          {sessions.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" size="sm">
                View All Sessions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 