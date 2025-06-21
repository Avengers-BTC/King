'use client';

import { cn } from '@/lib/utils';
import { UserAvatar } from './user-avatar';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  name: string;
  role?: string;
}

interface OnlineUsersListProps {
  users: User[];
  maxDisplayed?: number;
  className?: string;
}

export function OnlineUsersList({ 
  users, 
  maxDisplayed = 5,
  className 
}: OnlineUsersListProps) {
  const visibleUsers = users.slice(0, maxDisplayed);
  const remainingCount = Math.max(0, users.length - maxDisplayed);
  
  if (users.length === 0) {
    return null;
  }
  
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        <AnimatePresence>
          {visibleUsers.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 10 }}
              transition={{ delay: i * 0.05 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <UserAvatar
                        name={user.name}
                        role={user.role}
                        isOnline={true}
                        size="sm"
                        className="border-2 border-background"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{user.name}</p>
                    {user.role && (
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {remainingCount > 0 && (
          <div className="relative z-10">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-xs font-medium border-2 border-background">
              +{remainingCount}
            </div>
          </div>
        )}
      </div>
      
      <Badge variant="outline" className="ml-2 text-xs">
        {users.length} online
      </Badge>
    </div>
  );
}
