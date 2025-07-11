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
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      deferredPromptEvent = null;
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    // Return false if the prompt event is unavailable (iOS or other cases)
    if (!deferredPromptEvent) {
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
  const { isIOS, isInstallable, promptInstall } = useAppInstallation();
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    setIsAndroid(/Android/i.test(navigator.userAgent));
  }, []);

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
              ? 'Follow these steps to install NightVibe on your iOS device:'
              : isAndroid
                ? 'Follow these steps to install NightVibe on your Android device:'
                : 'Install NightVibe on your device for a better experience and offline access'}
          </DialogDescription>
        </DialogHeader>
        
        {isIOS ? (
          <div className="space-y-4 my-4">
            <div className="p-4 bg-blue-50 rounded-lg text-sm">
              <p className="font-medium text-blue-800 mb-2">⚠️ Important Note:</p>
              <p className="text-blue-600">This installation only works in Safari browser. If you&apos;re using another browser, please open NightVibe in Safari first.</p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium">1</span>
                </div>
                <div>
                  <p>Tap the Share button in Safari&apos;s menu bar</p>
                  <div className="mt-2 flex items-center space-x-2 bg-gray-50 p-2 rounded">
                    <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.684 13.342C8.886 13.524 9.108 13.75 9.418 13.75C9.798 13.75 10.088 13.424 10.088 13.084V6.75H11C11.552 6.75 12 6.302 12 5.75C12 5.198 11.552 4.75 11 4.75H10.088V3.75C10.088 3.336 9.752 3 9.338 3C8.924 3 8.588 3.336 8.588 3.75V4.75H7.676C7.124 4.75 6.676 5.198 6.676 5.75C6.676 6.302 7.124 6.75 7.676 6.75H8.588V11.566C8.588 12.314 8.684 13.342 8.684 13.342Z" fill="currentColor"/>
                      <path d="M12 20V16H8V20H12Z" fill="currentColor"/>
                      <path d="M16 20H20V16H16V20Z" fill="currentColor"/>
                      <path d="M16 12V8H12V12H16Z" fill="currentColor"/>
                      <path d="M20 12H16V16H20V12Z" fill="currentColor"/>
                    </svg>
                    <span className="text-sm text-gray-600">← It looks like this</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium">2</span>
                </div>
                <p>In the share menu, scroll down and tap <span className="font-medium">Add to Home Screen</span></p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium">3</span>
                </div>
                <p>Tap <span className="font-medium">Add</span> in the top right corner</p>
              </div>
            </div>
          </div>
        ) : isAndroid ? (
          <div className="space-y-4 my-4">
            <div className="p-4 bg-emerald-50 rounded-lg text-sm">
              <p className="font-medium text-emerald-800 mb-2">💡 Quick Tip:</p>
              <p className="text-emerald-600">For the best experience, use Chrome browser on your Android device.</p>
            </div>
            
            <div className="flex flex-col space-y-4">
              {isInstallable ? (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-medium">1</span>
                    </div>
                    <p>Tap the <span className="font-medium">Install App</span> button below</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-medium">2</span>
                    </div>
                    <p>When prompted, tap <span className="font-medium">Install</span> to add NightVibe to your home screen</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-medium">1</span>
                    </div>
                    <p>Tap the menu (⋮) in Chrome&apos;s top right corner</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-medium">2</span>
                    </div>
                    <p>Select <span className="font-medium">Install app</span> or <span className="font-medium">Add to Home screen</span></p>
                  </div>
                </>
              )}
            </div>
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

        {(isIOS || (isAndroid && !isInstallable)) && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Got it
            </Button>
          </DialogFooter>
        )}
        
        {isAndroid && isInstallable && (
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
