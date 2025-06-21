'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UsersRound, User, ChevronDown, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface OnlineUser {
  id: string;
  name: string;
  role?: string;
}

interface OnlineUsersProps {
  users: OnlineUser[];
  count: number;
  showReset?: boolean;
  onReset?: () => void;
  isDJ?: boolean;
}

export function OnlineUsers({ 
  users, 
  count, 
  showReset = false, 
  onReset,
  isDJ = false
}: OnlineUsersProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleReset = () => {
    if (!onReset) return;
    
    setIsResetting(true);
    onReset();
    setTimeout(() => setIsResetting(false), 2000);
  };
  
  // For mobile
  const MobileView = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-3 flex items-center gap-1 text-sm text-muted-foreground">
          <UsersRound className="w-4 h-4 mr-1" />
          {count === 1 ? 'Just you' : `${count} users`}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Online Users</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto max-h-[calc(100vh-6rem)]">
          {users.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">No one is online</div>
          ) : (
            users.map(user => (
              <div key={user.id} className="px-4 py-3 flex items-center gap-2 border-b">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{user.name}</span>
                {user.role === 'DJ' && (
                  <Badge variant="secondary" className="ml-auto text-xs">DJ</Badge>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
  
  // For desktop
  const DesktopView = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-3 flex items-center gap-1 text-sm text-muted-foreground"
        >
          <UsersRound className="w-4 h-4 mr-1" />
          {count === 1 ? 'Just you' : `${count} users`}
          <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px] p-0">
        <div className="p-2 border-b flex items-center justify-between">
          <div className="text-sm font-medium">Online Users</div>
          {showReset && count > 1 && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6"
              disabled={isResetting}
              onClick={handleReset}
              title="Reset user count if it seems incorrect"
            >
              <RefreshCw className={cn("h-3 w-3", isResetting && "animate-spin")} />
            </Button>
          )}
        </div>
        <div className="max-h-48 overflow-y-auto">
          {users.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">No one is online</div>
          ) : (
            users.map(user => (
              <div key={user.id} className="px-2 py-2 flex items-center gap-2 hover:bg-muted/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm">{user.name}</span>
                {user.role === 'DJ' && (
                  <Badge variant="secondary" className="ml-auto text-xs h-5">DJ</Badge>
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  
  return (
    <div className="flex items-center">
      {/* For mobile */}
      <div className="sm:hidden">
        <MobileView />
      </div>
      
      {/* For desktop */}
      <div className="hidden sm:block">
        <DesktopView />
      </div>
    </div>
  );
}
