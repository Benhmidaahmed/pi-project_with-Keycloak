import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin, of, takeUntil, switchMap, map, catchError } from 'rxjs';

import { AuthStore } from '../../../core/state/auth.store';
import { BookingService } from '../../../core/services/booking.service';
import { RideService } from '../../../core/services/ride.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

import { Booking, BookingStatus } from '../../../core/models/ride.model';
import { Ride } from '../../../core/models/ride.model';
import { User } from '../../../core/models/user.model';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-driver-bookings',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header Section with Gradient -->
      <div class="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-600 to-orange-800 dark:from-yellow-700 dark:to-orange-900 p-8 shadow-xl">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>

        <div class="relative z-10">
          <h1 class="text-4xl font-bold text-white mb-2">Booking Requests 📋</h1>
          <p class="text-yellow-100 text-lg">
            Manage and respond to passenger booking requests
          </p>
        </div>
      </div>

      <!-- Bookings List -->
      <div class="space-y-4">
        <ng-container *ngIf="bookings?.length; else emptyState">
          <ng-container *ngFor="let booking of bookings; trackBy: trackByBookingId">
            <div class="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
              <!-- Status Indicator Line -->
              <div [class]="getStatusLineClass(booking.status)"></div>

              <div class="p-6">
                <div class="flex items-start justify-between gap-6">
                  <div class="flex-1">
                    <!-- Passenger Header -->
                    <div class="flex items-center gap-4 mb-6">
                      <div class="relative">
                        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-100 dark:ring-primary-900/30">
                          {{ getInitials(booking.passenger?.name || 'Unknown') }}
                        </div>
                        <div [class]="getStatusBadgeClass(booking.status)"></div>
                      </div>

                      <div class="flex-1">
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {{ booking.passenger?.name || 'Unknown Passenger' }}
                        </h3>
                        <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <svg class="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span class="font-medium">
                        {{ booking.ride?.departureCity || 'N/A' }}
                            <span class="text-primary-600 dark:text-primary-400 mx-1">→</span>
                            {{ booking.ride?.destinationCity || 'N/A' }}
                      </span>
                        </div>
                      </div>
                    </div>

                    <!-- Booking Details Grid -->
                    <div class="grid grid-cols-3 gap-4">
                      <!-- Seats -->
                      <div class="relative overflow-hidden p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div class="absolute top-0 right-0 w-12 h-12 bg-blue-500/10 rounded-full -mr-6 -mt-6"></div>
                        <div class="relative z-10">
                          <div class="flex items-center gap-2 mb-1">
                            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p class="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Seats</p>
                          </div>
                          <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ booking.seatsRequested }}</p>
                        </div>
                      </div>

                      <!-- Date -->
                      <div class="relative overflow-hidden p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div class="absolute top-0 right-0 w-12 h-12 bg-purple-500/10 rounded-full -mr-6 -mt-6"></div>
                        <div class="relative z-10">
                          <div class="flex items-center gap-2 mb-1">
                            <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Date</p>
                          </div>
                          <p class="text-lg font-bold text-purple-900 dark:text-purple-100">
                            {{ booking.ride?.departureDate | date:'short' || 'N/A' }}
                          </p>
                        </div>
                      </div>

                      <!-- Status -->
                      <div class="relative overflow-hidden p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div class="absolute top-0 right-0 w-12 h-12 bg-gray-500/10 rounded-full -mr-6 -mt-6"></div>
                        <div class="relative z-10">
                          <div class="flex items-center gap-2 mb-1">
                            <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Status</p>
                          </div>
                          <span [class]="getStatusClass(booking.status)">
                        {{ booking.status }}
                      </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div *ngIf="booking.status === BookingStatus.PENDING" class="flex flex-col gap-3">
                    <app-button
                        variant="primary"
                        size="md"
                        (onClick)="acceptBooking(booking.id)"
                        [loading]="loadingBookings.has(booking.id)"
                        class="min-w-[120px] shadow-md hover:shadow-lg transition-shadow"
                    >
                      <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Accept
                    </app-button>
                    <app-button
                        variant="danger"
                        size="md"
                        (onClick)="rejectBooking(booking.id)"
                        [loading]="loadingBookings.has(booking.id)"
                        class="min-w-[120px] shadow-md hover:shadow-lg transition-shadow"
                    >
                      <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </app-button>
                  </div>

                  <!-- Status Badge for Non-Pending -->
                  <div *ngIf="booking.status !== BookingStatus.PENDING" class="flex items-center">
                    <div [class]="getStatusIconClass(booking.status)">
                      <svg *ngIf="booking.status === BookingStatus.ACCEPTED" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <svg *ngIf="booking.status === BookingStatus.REJECTED" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>
        </ng-container>

        <!-- Empty State -->
        <ng-template #emptyState>
          <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="text-center py-20 px-6">
              <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full mb-6">
                <svg class="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                No Booking Requests
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                You don't have any booking requests at the moment. When passengers request to join your rides, they'll appear here.
              </p>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: []
})
export class DriverBookingsComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  loadingBookings = new Set<string>();

  private rideCache = new Map<string, Ride | undefined>();
  private userCache = new Map<string, User | undefined>();

  private destroy$ = new Subject<void>();

  BookingStatus = BookingStatus;

  constructor(
      private authStore: AuthStore,
      private bookingService: BookingService,
      private rideService: RideService,
      private authService: AuthService,
      private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByBookingId(index: number, b: Booking): string {
    return b.id;
  }

  loadBookings(): void {
    const user = this.authStore.currentUser();
    if (!user) {
      this.bookings = [];
      return;
    }

    this.bookingService.getDriverBookingRequests(user.id)
        .pipe(
            takeUntil(this.destroy$),
            switchMap((bookings) => {
              if (!bookings || bookings.length === 0) {
                return of([] as Booking[]);
              }

              const enriched$ = bookings.map(b => {
                const ride$ = this.getRideCached(b.rideId);
                const passenger$ = this.getUserCached(b.passengerId);

                return forkJoin({
                  ride: ride$.pipe(catchError(() => of(undefined))),
                  passenger: passenger$.pipe(catchError(() => of(undefined))),
                  booking: of(b)
                }).pipe(
                    map(({ booking, ride, passenger }) => {
                      return {
                        ...booking,
                        ride: ride || (booking as any).ride || undefined,
                        passenger: passenger || (booking as any).passenger || undefined
                      } as Booking;
                    })
                );
              });

              return forkJoin(enriched$);
            })
        )
        .subscribe({
          next: (fullBookings) => {
            this.bookings = fullBookings || [];
          },
          error: (err) => {
            console.error('Error loading bookings:', err);
            this.bookings = [];
          }
        });
  }

  /**
   * Returns cached ride observable or fetches from rideService and caches result.
   */
  private getRideCached(rideId?: string) {
    if (!rideId) return of(undefined);
    if (this.rideCache.has(rideId)) {
      return of(this.rideCache.get(rideId));
    }

    return this.rideService.getRideById(rideId).pipe(
        map(ride => {
          this.rideCache.set(rideId, ride);
          return ride;
        })
    );
  }

  /**
   * Returns cached user observable or fetches from authService and caches result.
   */
  private getUserCached(userId?: string) {
    if (!userId) return of(undefined);
    if (this.userCache.has(userId)) {
      return of(this.userCache.get(userId));
    }

    return this.authService.getUserById(userId).pipe(
        map(user => {
          this.userCache.set(userId, user);
          return user;
        })
    );
  }

  acceptBooking(bookingId: string): void {
    if (!bookingId) return;
    const user = this.authStore.currentUser();
    const driverId = user?.id;
    this.loadingBookings.add(bookingId);

    const booking = this.bookings.find(b => b.id === bookingId);

    this.bookingService.acceptBooking(bookingId, driverId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (updated) => {
        if (booking && user) {
          const driverName = user.name || user.email?.split('@')[0] || 'A driver';
          const notificationMessage = `${driverName} has accepted your booking!`;

          this.notificationService.createNotification({
            userId: booking.passengerId,
            message: notificationMessage
          }).subscribe({
            next: () => {
              console.log('Acceptance notification sent to passenger');
            },
            error: (error) => {
              console.error('Error sending acceptance notification:', error);
            }
          });
        }

        const idx = this.bookings.findIndex(b => b.id === bookingId);
        if (idx !== -1) {
          this.bookings[idx] = { ...this.bookings[idx], status: BookingStatus.ACCEPTED };
        }
        this.loadingBookings.delete(bookingId);
      },
      error: (err) => {
        console.error('Error accepting booking:', err);
        this.loadingBookings.delete(bookingId);
      }
    });
  }

  rejectBooking(bookingId: string): void {
    if (!bookingId) return;
    const user = this.authStore.currentUser();
    const driverId = user?.id;
    this.loadingBookings.add(bookingId);

    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const rideId = booking.ride?.id;
    if (!rideId) return;

    this.bookingService.rejectBooking(bookingId, driverId)
        .pipe(
            switchMap(() => {
              if (booking && user) {
                const driverName = user.name || user.email?.split('@')[0] || 'A driver';
                const notificationMessage = `${driverName} has rejected your booking`;

                this.notificationService.createNotification({
                  userId: booking.passengerId,
                  message: notificationMessage
                }).subscribe({
                  next: () => {
                    console.log('Rejection notification sent to passenger');
                  },
                  error: (error) => {
                    console.error('Error sending rejection notification:', error);
                  }
                });
              }

              const newAvailableSeats = (booking.ride?.availableSeats || 0) + booking.seatsRequested;
              return this.rideService.modifyRide(rideId, { availableSeats: newAvailableSeats });
            })
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedRide) => {
            const idx = this.bookings.findIndex(b => b.id === bookingId);
            if (idx !== -1) {
              this.bookings[idx] = { ...this.bookings[idx], status: BookingStatus.REJECTED, ride: updatedRide };
            }
            this.loadingBookings.delete(bookingId);
          },
          error: (err) => {
            console.error('Error rejecting booking or updating ride seats:', err);
            this.loadingBookings.delete(bookingId);
          }
        });
  }


  getStatusClass(status: BookingStatus): string {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case BookingStatus.ACCEPTED:
        return `${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400`;
      case BookingStatus.REJECTED:
        return `${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400`;
      case BookingStatus.PENDING:
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300`;
    }
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
        .split(' ')
        .map(n => n[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 2);
  }
  getStatusLineClass(status: BookingStatus): string {
    const baseClasses = 'absolute left-0 top-0 w-1 h-full';
    switch (status) {
      case BookingStatus.ACCEPTED:
        return `${baseClasses} bg-gradient-to-b from-green-400 to-green-600`;
      case BookingStatus.REJECTED:
        return `${baseClasses} bg-gradient-to-b from-red-400 to-red-600`;
      case BookingStatus.PENDING:
        return `${baseClasses} bg-gradient-to-b from-yellow-400 to-yellow-600`;
      default:
        return `${baseClasses} bg-gradient-to-b from-gray-400 to-gray-600`;
    }
  }

  getStatusBadgeClass(status: BookingStatus): string {
    const baseClasses = 'absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800';
    switch (status) {
      case BookingStatus.ACCEPTED:
        return `${baseClasses} bg-green-500`;
      case BookingStatus.REJECTED:
        return `${baseClasses} bg-red-500`;
      case BookingStatus.PENDING:
        return `${baseClasses} bg-yellow-500 animate-pulse`;
      default:
        return `${baseClasses} bg-gray-500`;
    }
  }

  getStatusIconClass(status: BookingStatus): string {
    const baseClasses = 'w-16 h-16 rounded-full flex items-center justify-center';
    switch (status) {
      case BookingStatus.ACCEPTED:
        return `${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400`;
      case BookingStatus.REJECTED:
        return `${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400`;
    }
  }
}