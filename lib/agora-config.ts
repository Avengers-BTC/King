import { NextRequest } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

// You must set these in your Vercel/production environment
const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channelName = searchParams.get('channelName');
  const uid = searchParams.get('uid') || '0';
  const role = searchParams.get('role') === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const expireTime = 3600; // 1 hour

  // Debug logging
  console.log('=== AGORA TOKEN GENERATION DEBUG ===');
  console.log('APP_ID:', AGORA_APP_ID);
  console.log('APP_CERTIFICATE:', AGORA_APP_CERTIFICATE ? 'Present' : 'Missing');
  console.log('Channel Name:', channelName);
  console.log('UID:', uid);
  console.log('Role:', role);

  if (!channelName) {
    console.error('Missing channelName parameter');
    return new Response(JSON.stringify({ error: 'Missing channelName' }), { status: 400 });
  }
  
  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    console.error('Missing Agora configuration:', {
      hasAppId: !!AGORA_APP_ID,
      hasCertificate: !!AGORA_APP_CERTIFICATE
    });
    return new Response(JSON.stringify({ error: 'Server not configured for Agora' }), { status: 500 });
  }

  try {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpireTs = currentTimestamp + expireTime;

    console.log('Current timestamp:', currentTimestamp);
    console.log('Privilege expire timestamp:', privilegeExpireTs);

    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      Number(uid),
      role,
      privilegeExpireTs
    );

    console.log('Token generated successfully');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');

    return new Response(JSON.stringify({ 
      token,
      debug: {
        appId: AGORA_APP_ID,
        channelName,
        uid: Number(uid),
        role,
        expireTime: privilegeExpireTs
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}