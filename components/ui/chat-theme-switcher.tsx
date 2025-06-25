'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Paintbrush, Check, Moon, Sun, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

type ChatTheme = 'default' | 'midnight' | 'sunset' | 'neon' | 'minimal' | 'dark' | 'soft-dark' | 'gradient';

interface ChatThemeOption {
  name: string;
  value: ChatTheme;
  colors: {
    primary: string;
    background: string;
    accent: string;
    text: string;
  };
}

const CHAT_THEMES: ChatThemeOption[] = [
  {
    name: 'Default',
    value: 'default',
    colors: {
      primary: '#0ea5e9',
      background: '#ffffff',
      accent: '#f3f4f6',
      text: '#1f2937'
    }
  },
  {
    name: 'Midnight',
    value: 'midnight',
    colors: {
      primary: '#8b5cf6',
      background: '#1e1b4b',
      accent: '#312e81',
      text: '#e0e7ff'
    }
  },
  {
    name: 'Sunset',
    value: 'sunset',
    colors: {
      primary: '#f59e0b',
      background: '#7f1d1d',
      accent: '#991b1b',
      text: '#fef3c7'
    }
  },
  {
    name: 'Neon',
    value: 'neon',
    colors: {
      primary: '#10b981',
      background: '#071a12',
      accent: '#064e3b',
      text: '#d1fae5'
    }
  },
  {
    name: 'Minimal',
    value: 'minimal',
    colors: {
      primary: '#6b7280',
      background: '#f9fafb',
      accent: '#f3f4f6',
      text: '#1f2937'
    }
  },
  // Modern dark themes
  {
    name: 'Dark',
    value: 'dark',
    colors: {
      primary: '#3b82f6',
      background: '#111827',
      accent: '#1e3a8a',
      text: '#ffffff'
    }
  },
  {
    name: 'Soft Dark',
    value: 'soft-dark',
    colors: {
      primary: '#64748b',
      background: '#1e293b',
      accent: '#334155',
      text: '#f1f5f9'
    }
  },
  {
    name: 'Gradient',
    value: 'gradient',
    colors: {
      primary: '#818cf8',
      background: '#0f172a',
      accent: '#1e293b',
      text: '#e2e8f0'
    }
  },
];

interface ChatThemeSwitcherProps {
  onThemeChange?: (theme: ChatTheme) => void;
  className?: string;
}

export function ChatThemeSwitcher({
  onThemeChange,
  className
}: ChatThemeSwitcherProps) {
  const [currentTheme, setCurrentTheme] = useState<ChatTheme>('default');
  
  // Load theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('chat-theme') as ChatTheme | null;
    if (savedTheme && CHAT_THEMES.some(theme => theme.value === savedTheme)) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);
  
  const applyTheme = (themeValue: ChatTheme) => {
    const theme = CHAT_THEMES.find(t => t.value === themeValue);
    if (!theme) return;
    
    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--chat-primary', theme.colors.primary);
    root.style.setProperty('--chat-background', theme.colors.background);
    
    // Set chat bubble colors based on theme
    if (themeValue === 'dark') {
      root.style.setProperty('--chat-outgoing-bubble', '#1e3a8a'); // Dark blue
      root.style.setProperty('--chat-incoming-bubble', '#1f2937'); // Dark gray
    } 
    else if (themeValue === 'soft-dark') {
      root.style.setProperty('--chat-outgoing-bubble', '#0f172a'); // Very dark blue
      root.style.setProperty('--chat-incoming-bubble', '#334155'); // Slate blue
    }
    else if (themeValue === 'gradient') {
      root.style.setProperty('--chat-outgoing-bubble', '#1e3a8a'); // Dark blue
      root.style.setProperty('--chat-incoming-bubble', '#1e293b'); // Dark slate
      // Add gradient background
      document.body.style.background = 'linear-gradient(to bottom right, #0f172a, #1e293b)';
    }
    else {
      root.style.setProperty('--chat-outgoing-bubble', '#222222'); // Default dark
      root.style.setProperty('--chat-incoming-bubble', '#333333'); // Default dark gray
      // Reset gradient if switching from gradient theme
      document.body.style.background = '';
    }
    
    root.style.setProperty('--chat-accent', theme.colors.accent);
    root.style.setProperty('--chat-text', theme.colors.text);
    
    // Add theme class to body
    document.body.classList.remove(...CHAT_THEMES.map(t => `theme-${t.value}`));
    document.body.classList.add(`theme-${themeValue}`);
    
    // Save theme preference
    localStorage.setItem('chat-theme', themeValue);
    
    // Notify parent
    onThemeChange?.(themeValue);
  };
  
  const handleThemeChange = (theme: ChatTheme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn("h-8 w-8", className)}
        >
          <Paintbrush className="h-4 w-4" />
          <span className="sr-only">Change chat theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Chat Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {CHAT_THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => handleThemeChange(theme.value)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: theme.colors.primary }}
              />
              <span>{theme.name}</span>
            </div>
            {currentTheme === theme.value && (
              <Check className="h-4 w-4 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
