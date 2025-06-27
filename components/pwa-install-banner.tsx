'use client';

import { useState } from 'react';
import { usePWA } from '@/hooks/use-pwa';
import { X, Download, Smartphone } from 'lucide-react';
import { GlowButton } from '@/components/ui/glow-button';
import { Button } from '@/components/ui/button';

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg p-4 shadow-xl border border-electric-blue/20">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-white/10 p-2 rounded-lg">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Install NightVibe</h3>
              <p className="text-white/80 text-xs">Get the app experience!</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-white/60 hover:text-white hover:bg-white/10 h-auto p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="text-xs text-white/70">
            • Offline access to your content
            • Push notifications for new messages
            • Faster app-like experience
            • Home screen shortcut
          </div>
          
          <div className="flex space-x-2">
            <GlowButton
              onClick={handleInstall}
              className="flex-1 text-sm py-2 bg-white text-electric-blue hover:bg-white/90"
            >
              <Download className="w-4 h-4 mr-1" />
              Install App
            </GlowButton>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white/80 hover:text-white hover:bg-white/10 text-xs"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 