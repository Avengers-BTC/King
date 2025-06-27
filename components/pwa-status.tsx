'use client';

import { usePWA } from '@/hooks/use-pwa';
import { Download, Smartphone, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

export function PWAStatus() {
  const { 
    isInstallable, 
    isInstalled, 
    installApp, 
    requestNotificationPermission 
  } = usePWA();
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast.success('App installed successfully! 🎉');
    }
  };

  const handleNotificationToggle = async () => {
    if (notificationPermission === 'granted') {
      toast.info('Notifications are already enabled');
      return;
    }

    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      toast.success('Notifications enabled! 🔔');
    } else {
      toast.error('Notifications permission denied');
    }
  };

  // Only show if PWA features are available
  if (typeof window === 'undefined') return null;

  return (
    <div className="flex items-center space-x-2">
      {/* Install button */}
      {isInstallable && !isInstalled && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleInstall}
          className="hidden sm:flex items-center space-x-1 text-xs bg-electric-blue/10 border-electric-blue/20 hover:bg-electric-blue/20"
        >
          <Download className="w-3 h-3" />
          <span>Install App</span>
        </Button>
      )}

      {/* App installed indicator */}
      {isInstalled && (
        <div className="hidden sm:flex items-center space-x-1 text-xs text-neon-cyan">
          <Smartphone className="w-3 h-3" />
          <span>App Mode</span>
        </div>
      )}

      {/* Notification permission button */}
      {'Notification' in window && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNotificationToggle}
          className="h-auto p-1.5"
          title={
            notificationPermission === 'granted' 
              ? 'Notifications enabled' 
              : 'Enable notifications'
          }
        >
          {notificationPermission === 'granted' ? (
            <Bell className="w-4 h-4 text-neon-cyan" />
          ) : (
            <BellOff className="w-4 h-4 text-app-text/60" />
          )}
        </Button>
      )}
    </div>
  );
} 