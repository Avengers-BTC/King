'use client';

import { useEffect } from 'react';

export function ClearDataComponent() {
  // Clear any local storage data to ensure fresh start
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      
      console.log('All local data has been cleared');
    }
  }, []);
  
  return null; // This component doesn't render anything
}
