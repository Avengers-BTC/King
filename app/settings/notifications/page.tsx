'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Smartphone, Radio, Users, Calendar, Heart, MessageCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  djLiveNotifications: boolean;
  newFollowerNotifications: boolean;
  eventReminders: boolean;
  chatMentions: boolean;
  momentLikes: boolean;
  systemUpdates: boolean;
}

const NotificationSettings = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    djLiveNotifications: true,
    newFollowerNotifications: true,
    eventReminders: true,
    chatMentions: true,
    momentLikes: true,
    systemUpdates: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications/preferences');
      
      if (response.ok) {
        const data = await response.json();
        setPreferences({
          emailNotifications: data.emailNotifications,
          pushNotifications: data.pushNotifications,
          djLiveNotifications: data.djLiveNotifications,
          newFollowerNotifications: data.newFollowerNotifications,
          eventReminders: data.eventReminders,
          chatMentions: data.chatMentions,
          momentLikes: data.momentLikes,
          systemUpdates: data.systemUpdates,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success('Notification preferences saved!');
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const notificationCategories = [
    {
      title: 'Delivery Methods',
      description: 'Choose how you want to receive notifications',
      icon: <Bell className="w-5 h-5" />,
      settings: [
        {
          key: 'emailNotifications' as keyof NotificationPreferences,
          title: 'Email Notifications',
          description: 'Receive notifications via email',
          icon: <Mail className="w-4 h-4 text-blue-500" />,
          required: false,
        },
        {
          key: 'pushNotifications' as keyof NotificationPreferences,
          title: 'Push Notifications',
          description: 'Receive browser push notifications',
          icon: <Smartphone className="w-4 h-4 text-green-500" />,
          required: false,
        },
      ],
    },
    {
      title: 'Activity Notifications',
      description: 'Get notified about events and activities',
      icon: <Radio className="w-5 h-5" />,
      settings: [
        {
          key: 'djLiveNotifications' as keyof NotificationPreferences,
          title: 'DJ Live Sessions',
          description: 'When DJs you follow go live',
          icon: <Radio className="w-4 h-4 text-red-500" />,
          required: false,
        },
        {
          key: 'eventReminders' as keyof NotificationPreferences,
          title: 'Event Reminders',
          description: 'Upcoming events and shows',
          icon: <Calendar className="w-4 h-4 text-purple-500" />,
          required: false,
        },
      ],
    },
    {
      title: 'Social Notifications',
      description: 'Stay connected with the community',
      icon: <Users className="w-5 h-5" />,
      settings: [
        {
          key: 'newFollowerNotifications' as keyof NotificationPreferences,
          title: 'New Followers',
          description: 'When someone follows you',
          icon: <Users className="w-4 h-4 text-blue-500" />,
          required: false,
        },
        {
          key: 'momentLikes' as keyof NotificationPreferences,
          title: 'Moment Interactions',
          description: 'Likes and comments on your moments',
          icon: <Heart className="w-4 h-4 text-pink-500" />,
          required: false,
        },
        {
          key: 'chatMentions' as keyof NotificationPreferences,
          title: 'Chat Mentions',
          description: 'When you are mentioned in chat',
          icon: <MessageCircle className="w-4 h-4 text-green-500" />,
          required: false,
        },
      ],
    },
    {
      title: 'System Notifications',
      description: 'Important updates and announcements',
      icon: <Info className="w-5 h-5" />,
      settings: [
        {
          key: 'systemUpdates' as keyof NotificationPreferences,
          title: 'System Updates',
          description: 'App updates and important announcements',
          icon: <Info className="w-4 h-4 text-gray-500" />,
          required: true,
        },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-1/3" />
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div key={j} className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-40" />
                          <div className="h-3 bg-muted rounded w-60" />
                        </div>
                        <div className="w-10 h-6 bg-muted rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
          <p className="text-muted-foreground">
            Manage how and when you receive notifications from NightVibe
          </p>
        </motion.div>

        {/* Notification Categories */}
        <div className="space-y-6">
          {notificationCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {category.icon}
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.settings.map((setting, settingIndex) => (
                    <div key={setting.key}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {setting.icon}
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={setting.key} className="text-sm font-medium">
                                {setting.title}
                              </Label>
                              {setting.required && (
                                <Badge variant="secondary" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {setting.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={setting.key}
                          checked={preferences[setting.key]}
                          onCheckedChange={(checked) => updatePreference(setting.key, checked)}
                          disabled={setting.required}
                        />
                      </div>
                      {settingIndex < category.settings.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end pt-4"
        >
          <Button
            onClick={savePreferences}
            disabled={isSaving}
            className="min-w-32"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Privacy Notice</p>
                  <p>
                    Your notification preferences are stored securely and are never shared with third parties. 
                    You can change these settings at any time. Some system notifications may still be sent 
                    for security and account-related updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationSettings; 