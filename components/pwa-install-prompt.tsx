"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Global variable to store the install prompt event
let deferredPromptEvent: BeforeInstallPromptEvent | null = null;

// Function to check if the app is installable
export function useAppInstallation() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isAppInstalled);

    // Check if we already have the prompt event stored (preserves across navigation)
    if (deferredPromptEvent) {
      setIsInstallable(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      deferredPromptEvent = e as BeforeInstallPromptEvent;
      // Update state to show the user can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      deferredPromptEvent = null;
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPromptEvent) {
      if (isIOS) {
        // For iOS, we'll just show the manual instructions
        return false;
      }
      return false;
    }
    
    try {
      // Show the install prompt
      deferredPromptEvent.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPromptEvent.userChoice;
      
      // We've used the prompt, and can't use it again, discard it
      deferredPromptEvent = null;
      setIsInstallable(false);
      
      return outcome === 'accepted';
    } catch (error) {
      return false;
    }
  };

  return { isInstallable, isIOS, isInstalled, promptInstall };
}

interface PWAInstallPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PwaInstallPrompt({ open, onOpenChange }: PWAInstallPromptProps) {
  const { isIOS, promptInstall } = useAppInstallation();

  const handleInstallClick = async () => {
    await promptInstall();
    onOpenChange(false);
  };

  const closeDialog = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Install NightVibe App</DialogTitle>
          <DialogDescription>
            {isIOS 
              ? 'To install this app on your iOS device, tap the share button and then "Add to Home Screen"' 
              : 'Install NightVibe on your device for a better experience and offline access'}
          </DialogDescription>
        </DialogHeader>
        
        {isIOS ? (
          <div className="flex flex-col space-y-2 my-4">
            <p>1. Tap the share button <span className="inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
            </span></p>
            <p>2. Scroll down and tap &quot;Add to Home Screen&quot;</p>
            <p>3. Tap &quot;Add&quot; in the top-right corner</p>
          </div>
        ) : (
          <DialogFooter className="sm:justify-center mt-4">
            <Button type="button" variant="default" onClick={handleInstallClick}>
              Install App
            </Button>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Maybe Later
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
