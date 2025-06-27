import { prisma } from '@/lib/prisma';

export interface CreateNotificationData {
  userId: string;
  type: 'DJ_LIVE' | 'NEW_FOLLOWER' | 'EVENT_REMINDER' | 'CHAT_MENTION' | 'MOMENT_LIKE' | 'MOMENT_COMMENT' | 'SYSTEM_UPDATE' | 'DJ_RATING' | 'EVENT_CREATED' | 'CLUB_UPDATE';
  title: string;
  message: string;
  data?: any;
  actionUrl?: string;
}

export class NotificationService {
  static async createNotification(notificationData: CreateNotificationData) {
    try {
      // Check if user has this notification type enabled
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId: notificationData.userId },
      });

      // Create default preferences if they don't exist
      let userPreferences = preferences;
      if (!userPreferences) {
        userPreferences = await prisma.notificationPreference.create({
          data: { userId: notificationData.userId },
        });
      }

      // Check if user wants this type of notification
      const shouldSend = this.shouldSendNotification(notificationData.type, userPreferences);
      
      if (!shouldSend) {
        return null;
      }

      // Create the notification
      const notification = await prisma.notification.create({
        data: notificationData,
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async createBulkNotifications(notifications: CreateNotificationData[]) {
    try {
      const results = await Promise.allSettled(
        notifications.map(notification => this.createNotification(notification))
      );

      return results;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  static async notifyDjFollowers(djId: string, djName: string) {
    try {
      // Get all followers of this DJ
      const followers = await prisma.fanFollowing.findMany({
        where: { djId },
        include: { user: true },
      });

      const notifications: CreateNotificationData[] = followers.map(follower => ({
        userId: follower.userId,
        type: 'DJ_LIVE',
        title: `${djName} is now live!`,
        message: `Your followed DJ ${djName} just started a live session. Join now!`,
        actionUrl: `/live/${djId}`,
        data: { djId, djName },
      }));

      return await this.createBulkNotifications(notifications);
    } catch (error) {
      console.error('Error notifying DJ followers:', error);
      throw error;
    }
  }

  static async notifyNewFollower(djId: string, followerName: string, followerId: string) {
    try {
      // Get DJ user ID
      const dj = await prisma.dj.findUnique({
        where: { id: djId },
        select: { userId: true },
      });

      if (!dj) return null;

      return await this.createNotification({
        userId: dj.userId,
        type: 'NEW_FOLLOWER',
        title: 'New Follower!',
        message: `${followerName} started following you`,
        actionUrl: `/profile/${followerId}`,
        data: { followerId, followerName },
      });
    } catch (error) {
      console.error('Error notifying new follower:', error);
      throw error;
    }
  }

  static async notifyMomentLike(momentId: string, likerName: string, likerId: string) {
    try {
      // Get moment owner
      const moment = await prisma.moment.findUnique({
        where: { id: momentId },
        select: { userId: true, title: true },
      });

      if (!moment) return null;

      return await this.createNotification({
        userId: moment.userId,
        type: 'MOMENT_LIKE',
        title: 'Someone liked your moment!',
        message: `${likerName} liked your moment "${moment.title}"`,
        actionUrl: `/moments`,
        data: { momentId, likerId, likerName },
      });
    } catch (error) {
      console.error('Error notifying moment like:', error);
      throw error;
    }
  }

  static async notifyMomentComment(momentId: string, commenterName: string, commenterId: string, comment: string) {
    try {
      // Get moment owner
      const moment = await prisma.moment.findUnique({
        where: { id: momentId },
        select: { userId: true, title: true },
      });

      if (!moment) return null;

      return await this.createNotification({
        userId: moment.userId,
        type: 'MOMENT_COMMENT',
        title: 'New comment on your moment!',
        message: `${commenterName} commented: "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
        actionUrl: `/moments`,
        data: { momentId, commenterId, commenterName, comment },
      });
    } catch (error) {
      console.error('Error notifying moment comment:', error);
      throw error;
    }
  }

  static async notifyDjRating(djId: string, raterName: string, rating: number) {
    try {
      // Get DJ user ID
      const dj = await prisma.dj.findUnique({
        where: { id: djId },
        select: { userId: true },
      });

      if (!dj) return null;

      const stars = '⭐'.repeat(rating);

      return await this.createNotification({
        userId: dj.userId,
        type: 'DJ_RATING',
        title: 'You received a new rating!',
        message: `${raterName} rated your performance ${stars} (${rating}/5)`,
        actionUrl: `/dj/dashboard`,
        data: { djId, raterName, rating },
      });
    } catch (error) {
      console.error('Error notifying DJ rating:', error);
      throw error;
    }
  }

  private static shouldSendNotification(type: string, preferences: any): boolean {
    switch (type) {
      case 'DJ_LIVE':
        return preferences.djLiveNotifications;
      case 'NEW_FOLLOWER':
        return preferences.newFollowerNotifications;
      case 'EVENT_REMINDER':
        return preferences.eventReminders;
      case 'CHAT_MENTION':
        return preferences.chatMentions;
      case 'MOMENT_LIKE':
      case 'MOMENT_COMMENT':
        return preferences.momentLikes;
      case 'SYSTEM_UPDATE':
        return preferences.systemUpdates;
      case 'DJ_RATING':
      case 'EVENT_CREATED':
      case 'CLUB_UPDATE':
        return true; // Always send these important notifications
      default:
        return true;
    }
  }
} 