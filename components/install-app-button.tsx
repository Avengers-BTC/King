"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import PwaInstallPrompt, { useAppInstallation } from '@/components/pwa-install-prompt';

export function InstallAppButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isInstallable, isInstalled, isIOS } = useAppInstallation();
  const [mounted, setMounted] = useState(false);

  // Set mounted state to true after component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for custom event to open the dialog from mobile menu
  useEffect(() => {
    const handleOpenDialog = () => {
      setDialogOpen(true);
    };

    document.addEventListener('openPwaInstallPrompt', handleOpenDialog);
    
    return () => {
      document.removeEventListener('openPwaInstallPrompt', handleOpenDialog);
    };
  }, []);

  // If not mounted yet (during SSR), render nothing
  if (!mounted) {
    return null;
  }

  // If the app is already installed or not installable, don't show the button
  if (isInstalled || (!isInstallable && !isIOS)) {
    return null;
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="hidden md:flex gap-1 items-center" 
        onClick={() => setDialogOpen(true)}
      >
        <Download size={16} />
        <span>Install App</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="md:hidden" 
        onClick={() => setDialogOpen(true)}
      >
        <Download size={16} />
      </Button>

      <PwaInstallPrompt 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </>
  );
}
