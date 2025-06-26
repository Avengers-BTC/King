'use client';

import { useState, useEffect } from 'react';
import { Edit, MapPin, Calendar, Music, Users, Heart, Share, Save, X, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { ProfilePictureUpload } from '@/components/profile-picture-upload';
import { DeleteProfileModal } from '@/components/delete-profile-modal';

interface UserData {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  bio: string | null;
  image: string | null;
  location: string | null;
  joinDate: Date;
  followers: number;
  following: number;
  followingUsers: Array<any>;
  followedByUsers: Array<any>;
  moments: Array<{
    id: string;
    title: string;
    image: string;
    likes: Array<{ userId: string }>;
    _count: { comments: number };
    createdAt: string;
  }>;
}

export default function ProfilePage() {
  const { user, isAuthenticated, updateSession } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    bio: '',
    location: ''
  });
  const [activeTab, setActiveTab] = useState('moments');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

  const fetchUserData = async () => {
    try {
      if (!user?.id) {
        setError('No user ID available');
        setLoading(false);
        return;
      }
      
      console.log('Fetching user profile:', user.id);
      const response = await fetch(`/api/users/${user.id}`);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        
        if (response.status === 404) {
          // If profile is not found and we haven't retried too many times,
          // wait a bit and retry (in case of race condition with registration)
          if (retryCount < 3) {
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
              fetchUserData();
            }, 1000 * (retryCount + 1)); // Exponential backoff
            return;
          }
          throw new Error('Profile not found. Please try logging out and back in.');
        }
        throw new Error(`Failed to fetch profile (${response.status}): ${errorData}`);
      }
      
      const data = await response.json();
      console.log('Profile data received:', {
        id: data.id,
        name: data.name,
        role: data.role
      });
      
      setUserData(data);
      setEditForm({
        name: data.name || '',
        username: data.username || '',
        bio: data.bio || '',
        location: data.location || ''
      });
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile data');
      toast.error(error instanceof Error ? error.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!user?.id) return;
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const momentDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - momentDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please sign in to view your profile</h1>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-red-400 text-center">
            <p className="text-lg font-semibold mb-2">Error loading profile</p>
            <p className="mb-4">{error}</p>
            <Button 
              onClick={fetchUserData}
              className="bg-pink-500 hover:bg-pink-600"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white">Profile not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm mb-8 overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
          </div>
          
          <CardContent className="relative -mt-16 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="relative">
                {isEditing ? (
                  <ProfilePictureUpload
                    currentImage={userData.image}
                    userId={userData.id}
                    onImageUpdate={(imageUrl) => {
                      setUserData(prev => prev ? { ...prev, image: imageUrl } : null);
                    }}
                    size="lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-500 bg-gray-700">
                    {userData.image ? (
                      <img 
                        src={userData.image} 
                        alt={userData.name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                        {userData.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-4">
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          placeholder="Your name"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        <Input
                          value={editForm.username}
                          onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                          placeholder="@username"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        <Textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                          placeholder="Tell us about yourself..."
                          className="bg-gray-700 border-gray-600 text-white"
                          rows={3}
                        />
                        <Input
                          value={editForm.location}
                          onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                          placeholder="Your location"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold text-white mb-1">
                          {userData.name || 'Anonymous User'}
                        </h1>
                        <p className="text-pink-500 mb-2">
                          {userData.username ? `@${userData.username}` : 'No username set'}
                        </p>
                        <p className="text-gray-300 max-w-md mb-4">
                          {userData.bio || 'No bio available'}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{userData.location || 'Location not set'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {formatDate(userData.joinDate)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-4 md:mt-0">
                    {isEditing ? (
                      <>
                        <Button 
                          onClick={handleSaveProfile}
                          className="bg-pink-500 hover:bg-pink-600"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          onClick={() => setIsEditing(false)}
                          variant="outline"
                          className="border-gray-600"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="bg-pink-500 hover:bg-pink-600"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{userData.followedByUsers?.length || 0}</div>
                  <div className="text-xs text-gray-400">Followers</div>
                </CardContent>
              </Card>
              <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{userData.followingUsers?.length || 0}</div>
                  <div className="text-xs text-gray-400">Following</div>
                </CardContent>
              </Card>
              <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Heart className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">
                    {userData.moments.reduce((total, moment) => total + moment.likes.length, 0)}
                  </div>
                  <div className="text-xs text-gray-400">Likes</div>
                </CardContent>
              </Card>
              <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Share className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{userData.moments.length}</div>
                  <div className="text-xs text-gray-400">Moments</div>
                </CardContent>
              </Card>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-6">
                <TabsTrigger 
                  value="moments"
                  className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                >
                  Moments ({userData.moments.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="favorites"
                  className="data-[state=active]:bg-cyan-500 data-[state=active]:text-gray-900"
                >
                  Favorites
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="moments">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {userData.moments.length > 0 ? (
                    userData.moments.map((moment) => (
                      <Card key={moment.id} className="border-gray-800 bg-gray-800/50 backdrop-blur-sm group hover:border-pink-500/30 transition-all duration-300 overflow-hidden">
                        <div className="aspect-square bg-gradient-to-br from-pink-500/10 to-cyan-500/10">
                          <img 
                            src={moment.image} 
                            alt={moment.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-white mb-2">{moment.title}</h3>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Heart className="h-4 w-4" />
                                <span>{moment.likes.length}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>{moment._count.comments} comments</span>
                              </div>
                            </div>
                            <span>{getTimeAgo(moment.createdAt)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12">
                      <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">No moments yet</h3>
                      <p className="text-gray-500 mb-4">Share your first moment to get started!</p>
                      <Button asChild className="bg-pink-500 hover:bg-pink-600">
                        <a href="/moments/upload">Upload Moment</a>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="favorites">
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No favorites yet</h3>
                  <p className="text-gray-500">Start exploring DJs and clubs to add them to your favorites!</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-gray-800 bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full bg-pink-500 hover:bg-pink-600">
                  <a href="/moments/upload">Share Moment</a>
                </Button>
                <Button asChild variant="outline" className="w-full border-gray-600">
                  <a href="/djs">Discover DJs</a>
                </Button>
                <Button asChild variant="outline" className="w-full border-gray-600">
                  <a href="/clubs">Find Clubs</a>
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-800 bg-red-950/20 backdrop-blur-sm mt-6">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-red-300">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <DeleteProfileModal 
                  userId={userData.id}
                  userName={userData.name || 'User'}
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
