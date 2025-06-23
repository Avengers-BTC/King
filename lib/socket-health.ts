// Socket health checking utility

export async function checkSocketHealth() {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL;
    
    // First check the health endpoint
    const healthResponse = await fetch(`${baseUrl}/api/socketio-health`);
    if (!healthResponse.ok) {
      return {
        status: 'unhealthy',
        message: 'Socket.IO health endpoint not responding'
      };
    }

    // Then check if the socket endpoint is accessible
    const socketResponse = await fetch(`${baseUrl}/api/socketio`);
    if (!socketResponse.ok) {
      return {
        status: 'unhealthy',
        message: 'Socket.IO endpoint not accessible'
      };
    }

    return {
      status: 'healthy',
      message: 'Socket.IO endpoints are accessible'
    };  } catch (error: any) {
    console.error('[Socket Health] Check failed:', error);
    return {
      status: 'error',
      message: error?.message || 'Socket health check failed'
    };
  }
}
