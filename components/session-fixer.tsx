'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * This component provides minimal session monitoring for debugging.
 * It no longer aggressively tries to fix sessions to avoid interference.
 */
export function SessionFixer() {
  const { data: session, status } = useSession();
  
  useEffect(() => {
    // Only log session state for debugging - no aggressive fixing
    console.log('[SessionFixer] Session state:', {
      status,
      userId: session?.user?.id,
      userRole: session?.user?.role
    });
  }, [status, session]);
  
  // This component doesn't render anything
  return null;
}
