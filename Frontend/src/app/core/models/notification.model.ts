/**
 * Notification status type
 */
export type NotificationStatus = 'READ' | 'UNREAD';

/**
 * Notification model interface
 * Matches the backend Spring Boot entity exactly
 */
export interface Notification {
  id: string;
  userId: string;
  message: string;
  status: NotificationStatus;
}
