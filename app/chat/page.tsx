"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/chat/${roomId}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Join a Chat Room</h1>
        <form onSubmit={handleJoinRoom}>
          <div className="space-y-4">
            <Input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID..."
            />
            <Button type="submit" className="w-full">
              Join Room
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
