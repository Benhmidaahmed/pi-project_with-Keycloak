import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Notification } from '../models/notification.model';
import { AuthStore } from './auth.store';

/**
 * Notifications Store
 * Manages notification-related state using Angular Signals.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationsStore {
  private authStore = inject(AuthStore);

  // ============================================================================
  // Private State Signals
  // ============================================================================
  private readonly notificationsSignal = signal<Notification[]>([]);
  private readonly currentUserIdSignal = signal<string | null>(null);

  // ============================================================================
  // Public Readonly Computed Signals
  // ============================================================================
  public readonly notifications = computed(() => this.notificationsSignal());
  public readonly currentUserId = computed(() => this.currentUserIdSignal());

  /**
   * Notifications for current user
   */
  public readonly userNotifications = computed(() => {
    const notifications = this.notificationsSignal();
    const userId = this.currentUserIdSignal();

    if (!userId) {
      return [];
    }

    return notifications.filter(n => n.userId === userId);
  });

  /**
   * Unread notifications for current user
   */
  public readonly unreadNotifications = computed(() =>
      this.userNotifications().filter(n => n.status === 'UNREAD')
  );

  /**
   * Read notifications for current user
   */
  public readonly readNotifications = computed(() =>
      this.userNotifications().filter(n => n.status === 'READ')
  );

  /**
   * Unread notifications count
   */
  public readonly unreadCount = computed(() =>
      this.unreadNotifications().length
  );

  // ============================================================================
  // Constructor
  // ============================================================================
  constructor() {
    // Sync current user ID with auth store
    effect(() => {
      const currentUser = this.authStore.currentUser();
      this.setCurrentUserId(currentUser?.id || null);
    });
  }

  // ============================================================================
  // State Update Methods
  // ============================================================================
  setNotifications(notifications: Notification[]): void {
    this.notificationsSignal.set(notifications);
  }

  addNotification(notification: Notification): void {
    this.notificationsSignal.update(notifications => [...notifications, notification]);
  }

  updateNotification(notificationId: string, updates: Partial<Notification>): void {
    this.notificationsSignal.update(notifications =>
        notifications.map(notification =>
            notification.id === notificationId
                ? { ...notification, ...updates }
                : notification
        )
    );
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    this.updateNotification(notificationId, { status: 'READ' });
  }

  /**
   * Mark all notifications as read for the current user
   */
  markAllAsRead(): void {
    const userId = this.currentUserIdSignal();
    if (!userId) return;

    this.notificationsSignal.update(notifications =>
        notifications.map(notification =>
            notification.userId === userId && notification.status === 'UNREAD'
                ? { ...notification, status: 'READ' }
                : notification
        )
    );
  }

  removeNotification(notificationId: string): void {
    this.notificationsSignal.update(notifications =>
        notifications.filter(notification => notification.id !== notificationId)
    );
  }

  setCurrentUserId(userId: string | null): void {
    this.currentUserIdSignal.set(userId);
  }

  clearNotifications(): void {
    this.notificationsSignal.set([]);
    this.currentUserIdSignal.set(null);
  }
}
