import { Component, computed, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '../../../core/state/auth.store';
import { NotificationsStore } from '../../../core/state/notifications.store';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

/**
 * Navigation bar component
 * Shows different navigation based on user role
 * Includes notifications badge and dark mode toggle
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center space-x-2">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span class="text-xl font-bold text-gray-900 dark:text-gray-100">Wassalni</span>
            </a>

            @if (authStore.isAuthenticated() && !router.url.includes('/auth/role-selection')) {
              <div class="ml-10 flex items-center space-x-4">
                @if (authStore.isPassenger()) {
                  <a routerLink="/passenger/dashboard" routerLinkActive="text-primary-600"
                     class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                    Dashboard
                  </a>
                  <a routerLink="/passenger/bookings" routerLinkActive="text-primary-600"
                     class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                    My Bookings
                  </a>
                }
                @if (authStore.isDriver()) {
                  <a routerLink="/driver/dashboard" routerLinkActive="text-primary-600"
                     class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                    Dashboard
                  </a>
                  <a routerLink="/driver/rides" routerLinkActive="text-primary-600"
                     class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                    My Rides
                  </a>
                  <a routerLink="/driver/bookings" routerLinkActive="text-primary-600"
                     class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                    Bookings
                  </a>
                }
                @if (authStore.isAdmin()) {
                  <a routerLink="/admin/dashboard" routerLinkActive="text-primary-600"
                     class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                    Admin Dashboard
                  </a>
                }
              </div>
            }
          </div>

          <div class="flex items-center space-x-4">
            @if (authStore.isAuthenticated()) {
              <!-- Notifications -->
              <div class="relative">
                <button
                    (click)="toggleNotifications()"
                    class="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  @if (unreadNotifications().length > 0) {
                    <span class="absolute top-0 right-0 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-600 rounded-full ring-2 ring-white dark:ring-gray-800">
                      {{ unreadNotifications().length }}
                    </span>
                  }
                </button>

                <!-- Notifications Panel -->
                @if (showNotifications()) {
                  <div class="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[32rem] overflow-hidden flex flex-col">
                    <!-- Header -->
                    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                      @if (unreadNotifications().length > 0) {
                        <button
                            (click)="markAllAsRead()"
                            [disabled]="markingAllRead()"
                            class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium disabled:opacity-50"
                        >
                          {{ markingAllRead() ? 'Marking...' : 'Mark all as read' }}
                        </button>
                      }
                    </div>

                    <!-- Notifications List -->
                    <div class="overflow-y-auto flex-1">
                      @if (loadingNotifications()) {
                        <div class="flex items-center justify-center py-8">
                          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                      } @else if (unreadNotifications().length === 0) {
                        <div class="flex flex-col items-center justify-center py-12 px-4">
                          <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p class="text-gray-500 dark:text-gray-400 text-center">No unread notifications</p>
                        </div>
                      } @else {
                        @for (notification of unreadNotifications(); track notification.id) {
                          <div class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div class="flex items-start justify-between gap-3">
                              <button
                                  (click)="onNotificationClick(notification.id)"
                                  class="flex-1 min-w-0 px-4 py-3 text-left"
                              >
                                <p class="text-sm text-gray-900 dark:text-gray-100 mb-1">
                                  {{ notification.message }}
                                </p>
                              </button>
                              <button
                                  (click)="markAsRead(notification.id, $event)"
                                  [disabled]="markingRead().has(notification.id)"
                                  class="flex-shrink-0 px-4 py-3 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium disabled:opacity-50 whitespace-nowrap"
                              >
                                {{ markingRead().has(notification.id) ? 'Reading...' : 'Mark as read' }}
                              </button>
                            </div>
                          </div>
                        }
                      }
                    </div>

                    <!-- Footer -->
                  </div>
                }
              </div>

              <!-- User menu -->
              <div class="relative">
                <button
                    (click)="toggleUserMenu()"
                    class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                    {{ getInitials() }}
                  </div>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ authStore.currentUser()?.name }}
                  </span>
                </button>

                @if (showUserMenu()) {
                  <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <a routerLink="/profile/settings"
                       class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Profile
                    </a>
                    <button (click)="logout()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Logout
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/auth/login" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600">
                Login
              </a>
              <a routerLink="/auth/signup" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
                Sign Up
              </a>
            }

            <!-- Dark mode toggle -->
            <button
                (click)="toggleDarkMode()"
                class="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              @if (isDarkMode()) {
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } @else {
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              }
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavbarComponent implements OnInit, OnDestroy {
  showUserMenuSignal = signal(false);
  showNotificationsSignal = signal(false);
  isDarkModeSignal = signal(false);
  loadingNotificationsSignal = signal(false);
  markingReadSignal = signal(new Set<string>());
  markingAllReadSignal = signal(false);
  unreadNotificationsSignal = signal<Notification[]>([]);

  showUserMenu = computed(() => this.showUserMenuSignal());
  showNotifications = computed(() => this.showNotificationsSignal());
  isDarkMode = computed(() => this.isDarkModeSignal());
  loadingNotifications = computed(() => this.loadingNotificationsSignal());
  markingRead = computed(() => this.markingReadSignal());
  markingAllRead = computed(() => this.markingAllReadSignal());
  unreadNotifications = computed(() => this.unreadNotificationsSignal());

  private refreshInterval?: number;

  constructor(
      public authStore: AuthStore,
      public notificationsStore: NotificationsStore,
      public router: Router,
      private notificationService: NotificationService
  ) {
    // Check dark mode from localStorage
    const darkMode = localStorage.getItem('darkMode') === 'true';
    this.isDarkModeSignal.set(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }

    // Watch for authentication changes using effect
    effect(() => {
      const user = this.authStore.currentUser();
      if (user) {
        this.loadNotifications();
      } else {
        this.unreadNotificationsSignal.set([]);
      }
    });
  }

  ngOnInit(): void {
    // Load notifications initially if user is authenticated
    if (this.authStore.isAuthenticated()) {
      this.loadNotifications();

      // Refresh notifications every 30 seconds
      this.refreshInterval = window.setInterval(() => {
        this.loadNotifications();
      }, 30000);
    }
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadNotifications(): void {
    const user = this.authStore.currentUser();
    if (!user) return;

    this.loadingNotificationsSignal.set(true);
    this.notificationService.getUserNotifications(user.id).subscribe({
      next: (notifications) => {
        // Filter only UNREAD notifications
        const unread = notifications.filter(n => n.status === 'UNREAD');
        this.unreadNotificationsSignal.set(unread);
        this.loadingNotificationsSignal.set(false);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.loadingNotificationsSignal.set(false);
      }
    });
  }

  toggleUserMenu(): void {
    this.showUserMenuSignal.update(v => !v);
    if (this.showNotificationsSignal()) {
      this.showNotificationsSignal.set(false);
    }
  }

  toggleDarkMode(): void {
    const newValue = !this.isDarkModeSignal();
    this.isDarkModeSignal.set(newValue);
    localStorage.setItem('darkMode', newValue.toString());
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleNotifications(): void {
    this.showNotificationsSignal.update(v => !v);
    if (this.showUserMenuSignal()) {
      this.showUserMenuSignal.set(false);
    }

    // Reload notifications when opening the panel
    if (this.showNotificationsSignal()) {
      this.loadNotifications();
    }
  }

  markAsRead(notificationId: string, event?: Event): void {
    // Prevent event bubbling if called from the "Mark as read" button
    if (event) {
      event.stopPropagation();
    }

    // Add to marking set
    this.markingReadSignal.update(set => {
      const newSet = new Set(set);
      newSet.add(notificationId);
      return newSet;
    });

    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        // Remove from unread notifications
        this.unreadNotificationsSignal.update(notifications =>
            notifications.filter(n => n.id !== notificationId)
        );

        // Remove from marking set
        this.markingReadSignal.update(set => {
          const newSet = new Set(set);
          newSet.delete(notificationId);
          return newSet;
        });
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);

        // Remove from marking set even on error
        this.markingReadSignal.update(set => {
          const newSet = new Set(set);
          newSet.delete(notificationId);
          return newSet;
        });
      }
    });
  }

  onNotificationClick(notificationId: string): void {
    // Close the notifications panel
    this.showNotificationsSignal.set(false);

    // Navigate to bookings based on user role
    if (this.authStore.isPassenger()) {
      this.router.navigate(['/passenger/bookings']);
    } else if (this.authStore.isDriver()) {
      this.router.navigate(['/driver/bookings']);
    }

    // Mark as read after navigation
    this.markAsRead(notificationId);
  }

  markAllAsRead(): void {
    const user = this.authStore.currentUser();
    if (!user) return;

    this.markingAllReadSignal.set(true);
    this.notificationService.markAllAsRead(user.id).subscribe({
      next: () => {
        this.unreadNotificationsSignal.set([]);
        this.markingAllReadSignal.set(false);
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
        this.markingAllReadSignal.set(false);
      }
    });
  }

  viewAllBookings(): void {
    this.showNotificationsSignal.set(false);

    if (this.authStore.isPassenger()) {
      this.router.navigate(['/passenger/bookings']);
    } else if (this.authStore.isDriver()) {
      this.router.navigate(['/driver/bookings']);
    }
  }

  logout(): void {
    this.authStore.logout();
    this.showUserMenuSignal.set(false);
    this.unreadNotificationsSignal.set([]);
  }

  getInitials(): string {
    const user = this.authStore.currentUser();
    if (!user) return 'U';
    return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return d.toLocaleDateString();
  }
}