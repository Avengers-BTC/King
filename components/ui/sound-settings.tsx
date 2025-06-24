'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Music, Volume, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { ChatSounds } from '@/lib/chat-sounds';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';

type SoundTheme = 'default' | 'gentle' | 'retro' | 'minimal' | 'none';

interface SoundOption {
  name: string;
  value: SoundTheme;
  description: string;
}

const SOUND_THEMES: SoundOption[] = [
  {
    name: 'Default',
    value: 'default',
    description: 'Standard notification sounds'
  },
  {
    name: 'Gentle',
    value: 'gentle',
    description: 'Softer, more subtle sounds'
  },
  {
    name: 'Retro',
    value: 'retro',
    description: '8-bit style notification sounds'
  },
  {
    name: 'Minimal',
    value: 'minimal',
    description: 'Very subtle, quiet sounds'
  },
  {
    name: 'None',
    value: 'none',
    description: 'No sounds at all'
  }
];

interface SoundSettingsProps {
  className?: string;
}

export function SoundSettings({
  className
}: SoundSettingsProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundTheme, setSoundTheme] = useState<SoundTheme>('default');
  const [volume, setVolume] = useState(50);
  
  // Initialize from localStorage
  useEffect(() => {
    const savedEnabled = localStorage.getItem('chat-sound-enabled');
    const savedTheme = localStorage.getItem('chat-sound-theme') as SoundTheme | null;
    const savedVolume = localStorage.getItem('chat-sound-volume');
    
    if (savedEnabled !== null) {
      setSoundEnabled(savedEnabled === 'true');
      ChatSounds.setEnabled(savedEnabled === 'true');
    }
    
    if (savedTheme && SOUND_THEMES.some(theme => theme.value === savedTheme)) {
      setSoundTheme(savedTheme);
    }
    
    if (savedVolume !== null) {
      setVolume(parseInt(savedVolume, 10));
    }
  }, []);
  
  const toggleSoundEnabled = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    ChatSounds.setEnabled(newState);
    localStorage.setItem('chat-sound-enabled', String(newState));
    
    // Play test sound if enabling
    if (newState) {
      ChatSounds.playMessageReceived();
    }
  };
  
  const changeSoundTheme = (theme: SoundTheme) => {
    setSoundTheme(theme);
    localStorage.setItem('chat-sound-theme', theme);
    
    // Apply theme to ChatSounds
    if (theme === 'none') {
      ChatSounds.setEnabled(false);
      setSoundEnabled(false);
    } else {
      // This would need to be implemented in ChatSounds
      // For now, just play a test sound
      if (soundEnabled) {
        ChatSounds.playMessageReceived();
      }
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    localStorage.setItem('chat-sound-volume', String(newVolume));
    
    // Play test sound when changing volume
    if (soundEnabled && newVolume > 0) {
      ChatSounds.playMessageReceived();
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn("h-8 w-8", className)}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          <span className="sr-only">Sound settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Sound Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Enable Sounds</span>
            <Button 
              variant={soundEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleSoundEnabled}
              className="h-7 px-2"
            >
              {soundEnabled ? <Volume className="h-3 w-3 mr-1" /> : <VolumeX className="h-3 w-3 mr-1" />}
              {soundEnabled ? 'On' : 'Off'}
            </Button>
          </div>
          
          <div className="mb-3">
            <span className="text-xs text-muted-foreground mb-1 block">Volume</span>
            <Slider
              value={[volume]}
              min={0}
              max={100}
              step={1}
              disabled={!soundEnabled}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Sound Theme</DropdownMenuLabel>
        
        <DropdownMenuGroup>
          {SOUND_THEMES.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => changeSoundTheme(theme.value)}
              disabled={!soundEnabled && theme.value !== 'none'}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex flex-col">
                <span>{theme.name}</span>
                <span className="text-xs text-muted-foreground">{theme.description}</span>
              </div>
              {soundTheme === theme.value && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => ChatSounds.playMessageReceived()}
            disabled={!soundEnabled || volume === 0}
            className="w-full"
          >
            <Music className="h-3 w-3 mr-1" />
            Test Sound
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
