// Socket health checking utility

export async function checkSocketHealth() {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL;
    
    // Check the health endpoint
    const healthResponse = await fetch(`${baseUrl}/api/socket/health`);
    if (!healthResponse.ok) {
      return {
        status: 'unhealthy',
        message: 'Socket health endpoint not responding'
      };
    }

    const healthData = await healthResponse.json();
    if (healthData.status !== 'healthy') {
      return {
        status: 'unhealthy',
        message: healthData.error || 'Socket service is unhealthy'
      };
    }

    return {
      status: 'healthy',
      message: 'Socket service is healthy'
    };} catch (error: any) {
    console.error('[Socket Health] Check failed:', error);
    return {
      status: 'error',
      message: error?.message || 'Socket health check failed'
    };
  }
}
