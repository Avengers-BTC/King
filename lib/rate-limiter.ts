const messageRateLimits = new Map<string, number[]>();

interface RateLimitConfig {
  maxMessages: number;  // Maximum messages allowed
  timeWindow: number;   // Time window in milliseconds
}

// Different limits for different user roles
const rateLimits: Record<string, RateLimitConfig> = {
  DEFAULT: { maxMessages: 5, timeWindow: 5000 },    // 5 messages per 5 seconds
  DJ: { maxMessages: 10, timeWindow: 5000 },        // 10 messages per 5 seconds
  ADMIN: { maxMessages: 20, timeWindow: 5000 },     // 20 messages per 5 seconds
};

export function isRateLimited(userId: string, userRole: string = 'DEFAULT'): boolean {
  const now = Date.now();
  const userMessages = messageRateLimits.get(userId) || [];
  const config = rateLimits[userRole] || rateLimits.DEFAULT;
  
  // Remove messages outside the time window
  const recentMessages = userMessages.filter(timestamp => 
    now - timestamp < config.timeWindow
  );
  
  // Update the messages list
  messageRateLimits.set(userId, recentMessages);
  
  // Check if user has exceeded rate limit
  if (recentMessages.length >= config.maxMessages) {
    return true;
  }
  
  // Add new message timestamp
  recentMessages.push(now);
  messageRateLimits.set(userId, recentMessages);
  
  return false;
}
