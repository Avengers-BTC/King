'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Chat } from '@/components/chat';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Volume2, Music, Headphones, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LiveChatProps {
  clubId: string;
  clubName: string;
  currentDj?: {
    id: string;
    name: string;
  };
}

export function LiveChat({ clubId, clubName, currentDj }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: session } = useSession();
  const roomId = `club-${clubId}`;
  const chatRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Close chat if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!currentDj) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="fixed bottom-4 right-4 shadow-lg rounded-full"
              size="lg"
              variant="default"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Live Chat
            </Button>
          </motion.div>
        )}

        {isOpen && (          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-50",
              isMobile ? "bottom-0 right-0 left-0" : "bottom-4 right-4"
            )}
          >
            <Card className={cn(
              "shadow-xl border-primary/10",
              isMobile ? "w-full rounded-b-none h-[70vh]" : (
                isExpanded ? "w-[450px] h-[80vh]" : "w-[320px] sm:w-96"
              )
            )}>              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-t-lg">
                <div className="flex items-center">
                  <div className="bg-primary/20 p-2 rounded-full mr-3">
                    <Music className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{clubName}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <span className="relative flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <Badge variant="secondary" className="h-5 text-xs">Live</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Headphones className="w-3 h-3" />
                        <span className="truncate max-w-[80px] sm:max-w-full">{currentDj.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
                <Chat
                roomId={roomId}
                className={cn(
                  "border-0 shadow-none",
                  isMobile 
                    ? "h-[calc(70vh-64px)]" 
                    : (isExpanded ? "h-[calc(80vh-64px)]" : "h-[500px]")
                )}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
