"use client";

import { useParams } from 'next/navigation';
import { Chat } from '@/components/chat';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params?.roomId;  return (
    <div className="h-[100dvh] w-full">
      <Chat roomId={roomId as string} />
    </div>
  );
}
