/**
 * Chat utility functions for working with room IDs and unified chat channels
 */

/**
 * Create a unified room ID for DJ live sessions and fan chats
 * This ensures live sessions and fan chats share the same room
 * 
 * @param djId The ID of the DJ
 * @param clubId Optional club ID if the DJ is at a specific venue
 * @returns A consistent room ID string
 */
export function getDjChatRoomId(djId: string, clubId?: string | null): string {
  if (!djId) return '';
  
  // Format: live-{djId}-club{clubId?}
  return clubId 
    ? `live-${djId}-club${clubId}`
    : `live-${djId}`;
}

/**
 * Checks if a room ID is a live session room
 * @param roomId The room ID to check
 * @returns true if this is a live session room
 */
export function isLiveSessionRoom(roomId: string): boolean {
  return roomId.startsWith('live-');
}

/**
 * Extracts the DJ ID from a room ID
 * @param roomId The room ID to parse
 * @returns The DJ ID or null if not found
 */
export function getDjIdFromRoomId(roomId: string): string | null {
  if (!isLiveSessionRoom(roomId)) return null;
  
  // Format: live-{djId} or live-{djId}-club{clubId}
  const parts = roomId.split('-');
  if (parts.length >= 2) {
    // For live-{djId}
    if (parts.length === 2) {
      return parts[1];
    }
    
    // For live-{djId}-club{clubId}
    if (parts.length >= 3 && parts[2].startsWith('club')) {
      return parts[1];
    }
  }
  
  return null;
}

/**
 * Extracts the club ID from a room ID if present
 * @param roomId The room ID to parse
 * @returns The club ID or null if not found
 */
export function getClubIdFromRoomId(roomId: string): string | null {
  if (!isLiveSessionRoom(roomId)) return null;
  
  // Format: live-{djId}-club{clubId}
  const parts = roomId.split('-');
  if (parts.length >= 3 && parts[2].startsWith('club')) {
    return parts[2].replace('club', '');
  }
  
  return null;
}

/**
 * Create a unified room ID for club chats
 * @param clubId The ID of the club
 * @returns A consistent room ID string for club chats
 */
export function getClubChatRoomId(clubId: string): string {
  if (!clubId) return '';
  return `club-${clubId}`;
}
