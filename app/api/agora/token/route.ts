import { NextRequest } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

// You must set these in your Vercel/production environment
const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channelName = searchParams.get('channelName');
  const uidParam = searchParams.get('uid') || '0';
  const uidNumber = Number(uidParam);
  const isNumericUid = !Number.isNaN(uidNumber);
  // Agora accepts either numeric UID or user account (string)
  // We'll decide which token builder to use based on this.

  const role = searchParams.get('role') === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const expireTime = 3600; // 1 hour

  if (!channelName) {
    return new Response(JSON.stringify({ error: 'Missing channelName' }), { status: 400 });
  }
  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    return new Response(JSON.stringify({ error: 'Server not configured for Agora' }), { status: 500 });
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTs = currentTimestamp + expireTime;

  const token = isNumericUid
    ? RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channelName,
        uidNumber,
        role,
        privilegeExpireTs
      )
    : RtcTokenBuilder.buildTokenWithAccount(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channelName,
        uidParam,
        role,
        privilegeExpireTs
      );

  return new Response(
    JSON.stringify({
      token,
      debug: {
        appId: AGORA_APP_ID,
        channelName,
        uid: isNumericUid ? uidNumber : uidParam,
        role,
        expireTime: privilegeExpireTs,
        uidType: isNumericUid ? 'number' : 'string'
      }
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
