import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const debug = request.headers.get('x-debug') === 'true';
  const startTime = Date.now();
  
  try {
    // Test database connection
    await prisma.$connect();
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Get database URL (redacted for security)
    const dbUrl = process.env.DATABASE_URL || 'not set';
    const maskedDbUrl = dbUrl.startsWith('postgres') 
      ? `postgres://${dbUrl.includes('@') ? dbUrl.split('@')[1].split('/')[0] : 'masked'}/...` 
      : 'invalid-url';
      
    // Check environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'set' : 'not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'not set',
      DATABASE_URL: maskedDbUrl
    };
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`,
      environment: process.env.NODE_ENV,
      result,
      config: debug ? envVars : undefined
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      responseTime: `${Date.now() - startTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: debug && error instanceof Error ? error.stack : undefined
    }, { status: 503 });
  } finally {
    await prisma.$disconnect();
  }
}