'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Smartphone, 
  Monitor, 
  Users, 
  CheckCircle, 
  ArrowLeft,
  Radio,
  Crown
} from 'lucide-react';

export default function MobileChatDemo() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">WhatsApp-Style Chat Demo</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience our full-page chat system designed for mobile and desktop users
            </p>
          </div>
        </div>

        {/* Demo Chat Rooms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Demo Chat Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* DJ Session Demo */}
              <Card className="border-2 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Radio className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">DJ TechnoVibes Live</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>127 members</span>
                        <Badge variant="destructive" className="text-xs animate-pulse">LIVE</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    🎵 Now playing: Electronic Dreams
                  </p>
                  <Button 
                    onClick={() => router.push('/chat/dj-session-demo')}
                    className="w-full"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Join Live Chat
                  </Button>
                </CardContent>
              </Card>

              {/* Club Chat Demo */}
              <Card className="border-2 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Underground Club</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>89 members</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Welcome to the underground!
                  </p>
                  <Button 
                    onClick={() => router.push('/chat/club-underground-demo')}
                    className="w-full"
                    variant="outline"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Join Club Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Mobile Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Mobile Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  'Full-screen WhatsApp-style interface',
                  'Auto-scroll when new messages arrive',
                  'Touch-optimized voice recording',
                  'Mobile-friendly emoji picker',
                  'Safe area support for notched devices',
                  'Smooth animations and transitions'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Desktop Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Desktop Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  'Professional chat interface',
                  'Enhanced member list sidebar',
                  'Keyboard shortcuts (Enter to send)',
                  'Larger emoji picker with search',
                  'Message reactions and status',
                  'Real-time typing indicators'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How to Test */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              How to Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">On Mobile:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Click "Join Live Chat" or "Join Club Chat" above</li>
                  <li>Experience the full-screen WhatsApp-style interface</li>
                  <li>Try sending messages to see auto-scroll in action</li>
                  <li>Test the emoji picker and message reactions</li>
                  <li>Use voice recording with press-and-hold</li>
                  <li>Navigate back using the back button</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">On Desktop:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Click any chat room button to open full-page chat</li>
                  <li>Notice the desktop-optimized layout with sidebar</li>
                  <li>Try keyboard shortcuts (Enter to send messages)</li>
                  <li>Test the enhanced emoji picker and reactions</li>
                  <li>Check out the member list and chat info panel</li>
                  <li>Send messages to see smooth auto-scrolling</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <Button 
                onClick={() => router.push('/chat')}
                variant="outline"
                className="justify-start"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                All Chat Rooms
              </Button>
              
              <Button 
                onClick={() => router.push('/djs')}
                variant="outline"
                className="justify-start"
              >
                <Radio className="w-4 h-4 mr-2" />
                Browse DJs
              </Button>
              
              <Button 
                onClick={() => router.push('/clubs')}
                variant="outline"
                className="justify-start"
              >
                <Crown className="w-4 h-4 mr-2" />
                Browse Clubs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
} 