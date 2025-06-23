'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Mail, Lock, User, MapPin, Instagram, Twitter, Facebook, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';

const MUSIC_GENRES = [
  'Amapiano',
  'Afrobeats',
  'House',
  'Dancehall',
  'Hip Hop',
  'Electronic',
  'Reggae',
  'R&B',
  'Pop',
  'Techno',
  'Trance',
  'Reggaeton',
  'Other'
];

export default function DJSignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // User data
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    location: '',
    // DJ-specific data
    djName: '',
    genre: '',
    bio: '',
    instagram: '',
    twitter: '',
    facebook: '',
    currentClub: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    const { name, email, password, confirmPassword, username } = formData;
    
    if (!name || !email || !password || !username) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    const { djName, genre, bio } = formData;
    
    if (!djName || !genre || !bio) {
      toast.error('Please fill in all required DJ information');
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    try {
      // Create user account first
      const userResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          username: formData.username,
          location: formData.location
        })
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.message || 'Failed to create account');
      }

      const userData = await userResponse.json();

      // Create DJ profile
      const djResponse = await fetch('/api/djs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.user.id,
          djName: formData.djName,
          genre: formData.genre,
          bio: formData.bio,
          instagram: formData.instagram,
          twitter: formData.twitter,
          facebook: formData.facebook,
          currentClub: formData.currentClub
        })
      });

      if (!djResponse.ok) {
        const errorData = await djResponse.json();
        throw new Error(errorData.error || 'Failed to create DJ profile');
      }

      const djData = await djResponse.json();
      
      if (!djData.success) {
        throw new Error(djData.error || 'Failed to create DJ profile');
      }

      // Sign in with the newly created account
      const nextAuth = await import('next-auth/react');
      const signInResult = await nextAuth.signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      });

      if (signInResult?.error) {
        throw new Error('Authentication failed after signup');
      }

      toast.success('DJ profile created successfully!');
      
      // Reload the page to ensure session is updated
      window.location.href = djData.redirect || '/dj/dashboard';
    } catch (error: any) {
      // In production, we'll log the error but show a user-friendly message
      if (process.env.NODE_ENV === 'production') {
        console.error('[DJ Signup] Error:', error);
        toast.error('An error occurred during signup. Please try again.');
      } else {
        // In development, show the actual error message
        toast.error(error.message || 'Failed to create DJ profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gray-800 bg-gray-800/50 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Music className="h-8 w-8 text-pink-500" />
            <h1 className="text-2xl font-bold text-white">Join as DJ</h1>
          </div>
          <CardTitle className="text-xl text-white">
            {step === 1 ? 'Create Your Account' : 'Build Your DJ Profile'}
          </CardTitle>
          <p className="text-gray-400">
            {step === 1 
              ? 'Start your journey as a professional DJ' 
              : 'Tell the world about your music style'
            }
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="dj@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="dj_awesome"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="Nairobi, Kenya"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-pink-500 hover:bg-pink-600"
                >
                  Continue to DJ Profile
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="djName" className="text-white">DJ Name/Stage Name *</Label>
                  <div className="relative">
                    <Mic className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="djName"
                      type="text"
                      placeholder="DJ Awesome"
                      value={formData.djName}
                      onChange={(e) => handleInputChange('djName', e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-white">Primary Genre *</Label>
                  <Select value={formData.genre} onValueChange={(value) => handleInputChange('genre', value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select your main genre" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {MUSIC_GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre} className="text-white">
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">Bio *</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell people about your music style, experience, and what makes you unique..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentClub" className="text-white">Current Club/Venue</Label>
                  <Input
                    id="currentClub"
                    type="text"
                    placeholder="Where are you currently performing?"
                    value={formData.currentClub}
                    onChange={(e) => handleInputChange('currentClub', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-white">Social Media (Optional)</Label>
                  
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="@your_instagram"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="@your_twitter"
                      value={formData.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Your Facebook handle"
                      value={formData.facebook}
                      onChange={(e) => handleInputChange('facebook', e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                    className="flex-1 border-gray-600"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-pink-500 hover:bg-pink-600"
                  >
                    {isLoading ? 'Creating Account...' : 'Create DJ Profile'}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-pink-500 hover:text-pink-400">
                Sign in here
              </Link>
            </p>
            <p className="text-gray-400 mt-2">
              Want to join as a regular user?{' '}
              <Link href="/signup" className="text-cyan-500 hover:text-cyan-400">
                User signup
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}