import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '../../../core/state/auth.store';
import { BookingService } from '../../../core/services/booking.service';
import { RideService } from '../../../core/services/ride.service';
import { AuthService } from '../../../core/services/auth.service';
import { Booking, BookingStatus, Ride } from '../../../core/models/ride.model';
import { User } from '../../../core/models/user.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-passenger-bookings',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule, ButtonComponent, CardComponent],
  template: `
    <!-- Passenger Bookings Template -->
    <div class="container mx-auto px-4 py-8">
      <!-- Header Section with Gradient -->
      <div class="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-800 dark:from-purple-700 dark:to-pink-900 p-8 shadow-xl">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>

        <div class="relative z-10">
          <h1 class="text-4xl font-bold text-white mb-2">
            My Bookings 📋
          </h1>
          <p class="text-purple-100 text-lg">
            Track and manage all your ride bookings in one place
          </p>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 p-12">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p class="text-gray-600 dark:text-gray-400 mt-4 font-medium">Loading your bookings...</p>
          </div>
        </div>
      }

      <!-- Bookings List -->
      @if (!loading) {
        <div class="space-y-6">
          @for (booking of bookings; track booking.id) {
            <div class="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
              <!-- Animated Background Elements -->
              <div class="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-gray-50 dark:bg-gray-700/20 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-500"></div>

              <div class="relative z-10 p-6">
                <!-- Header: Route & Status -->
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5 pb-5 border-b border-gray-200 dark:border-gray-600">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {{ getRideInfo(booking.rideId)?.departureCity || 'Loading...' }}
                        <span class="text-purple-600 dark:text-purple-400 mx-2">→</span>
                        {{ getRideInfo(booking.rideId)?.destinationCity || 'Loading...' }}
                      </h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {{ getRideInfo(booking.rideId)?.departureDate | date:'medium' }}
                        at {{ getRideInfo(booking.rideId)?.departureTime || 'Loading...' }}
                      </p>
                    </div>
                  </div>

                  <!-- Status Badge & Cancel Button -->
                  <div class="flex items-center gap-3">
                <span [class]="getStatusClass(booking.status)">
                  {{ booking.status }}
                </span>

                    @if (booking.status === BookingStatus.PENDING) {
                      <app-button
                          variant="danger"
                          size="sm"
                          (onClick)="openCancelDialog(booking.id)"
                      >
                        <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </app-button>
                    }
                  </div>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <!-- Driver Info -->
                  <div class="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50">
                    <div class="flex items-center gap-2 mb-1">
                      <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">Driver</p>
                    </div>
                    <p class="font-bold text-gray-900 dark:text-gray-100">{{ getDriverName(booking.rideId) }}</p>
                  </div>

                  <!-- Seats Info -->
                  <div class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700/50">
                    <div class="flex items-center gap-2 mb-1">
                      <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p class="text-xs text-green-600 dark:text-green-400 font-medium">Seats Reserved</p>
                    </div>
                    <p class="font-bold text-gray-900 dark:text-gray-100">{{ booking.seatsRequested }}</p>
                  </div>

                  <!-- Booked Date Info -->
                  <div class="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-700/50">
                    <div class="flex items-center gap-2 mb-1">
                      <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p class="text-xs text-orange-600 dark:text-orange-400 font-medium">Booked On</p>
                    </div>
                    <p class="font-bold text-gray-900 dark:text-gray-100">{{ booking.createdAt | date:'short' }}</p>
                  </div>
                </div>

                <!-- Accepted Status Message -->
                @if (booking.status === BookingStatus.ACCEPTED) {
                  <div class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-l-4 border-green-500 dark:border-green-400 rounded-lg shadow-sm">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p class="font-bold text-green-800 dark:text-green-300 mb-1">Booking Confirmed! 🎉</p>
                        <p class="text-sm text-green-700 dark:text-green-400">
                          Your booking has been accepted by the driver. Get ready for your trip!
                        </p>
                      </div>
                    </div>
                  </div>
                }

                <!-- Rejected Status Message -->
                @if (booking.status === BookingStatus.REJECTED) {
                  <div class="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-l-4 border-red-500 dark:border-red-400 rounded-lg shadow-sm">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <p class="font-bold text-red-800 dark:text-red-300 mb-1">Booking Declined</p>
                        <p class="text-sm text-red-700 dark:text-red-400">
                          Unfortunately, this booking was not accepted. Try searching for other available rides.
                        </p>
                      </div>
                    </div>
                  </div>
                }

                <!-- Pending Status Message -->
                @if (booking.status === BookingStatus.PENDING) {
                  <div class="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 rounded-lg shadow-sm">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 bg-yellow-500 dark:bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p class="font-bold text-yellow-800 dark:text-yellow-300 mb-1">Awaiting Confirmation ⏳</p>
                        <p class="text-sm text-yellow-700 dark:text-yellow-400">
                          Your booking request is pending. The driver will review it soon.
                        </p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          } @empty {
            <!-- Empty State -->
            <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div class="text-center py-16 px-6">
                <div class="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg class="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No Bookings Yet</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  You haven't made any ride bookings. Start by searching for available rides to your destination.
                </p>
                <app-button variant="primary" size="lg" (onClick)="navigateToDashboard()" class="shadow-lg hover:shadow-xl transition-shadow">
                  <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search for Rides
                </app-button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- CANCEL BOOKING DIALOG -->
    @if (showCancelDialog()) {
      <div class="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" (click)="closeCancelDialog()"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-scale-in border border-gray-200 dark:border-gray-700">

            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
              <svg class="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Cancel Booking?</h3>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                Are you sure you want to cancel this booking? This action cannot be undone and your seat(s) will be released.
              </p>
            </div>

            <div class="flex gap-3">
              <app-button variant="secondary" size="md" class="flex-1"
                          (onClick)="closeCancelDialog()" [disabled]="cancelling()">
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Keep Booking
              </app-button>

              <app-button variant="danger" size="md" class="flex-1"
                          [loading]="cancelling()" (onClick)="confirmCancelBooking()">
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Yes, Cancel
              </app-button>
            </div>

          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class PassengerBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = false;
  rideCache: Map<string, Ride> = new Map();
  driverCache: Map<string, User> = new Map();

  showCancelDialog = signal(false);
  bookingToCancel = signal<string | null>(null);
  cancelling = signal(false);

  constructor(
      private authStore: AuthStore,
      private bookingService: BookingService,
      private rideService: RideService,
      private authService: AuthService,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    const user = this.authStore.currentUser();
    if (!user) return;

    this.bookingService.getPassengerBookings(user.id).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.loadRidesAndDrivers(bookings);
      },
      error: () => (this.loading = false)
    });
  }

  loadRidesAndDrivers(bookings: Booking[]): void {
    const rideIds = [...new Set(bookings.map(b => b.rideId))];

    if (rideIds.length === 0) {
      this.loading = false;
      return;
    }

    forkJoin(rideIds.map(id => this.rideService.getRideById(id))).subscribe({
      next: (rides) => {
        rides.forEach((r, i) => r && this.rideCache.set(rideIds[i], r));

        const driverIds = [...new Set(rides.filter(r => r).map(r => r!.driverId))];

        forkJoin(driverIds.map(id => this.authService.getUserById(id))).subscribe({
          next: (drivers) => {
            drivers.forEach((d, i) => d && this.driverCache.set(driverIds[i], d));
            this.loading = false;
          },
          error: () => (this.loading = false)
        });
      },
      error: () => (this.loading = false)
    });
  }

  getRideInfo(rideId: string): Ride | undefined {
    return this.rideCache.get(rideId);
  }

  getDriverName(rideId: string): string {
    const ride = this.rideCache.get(rideId);
    if (!ride) return 'Loading...';

    const driver = this.driverCache.get(ride.driverId);
    return driver?.name || driver?.email?.split('@')[0] || 'Loading...';
  }

  openCancelDialog(bookingId: string): void {
    this.bookingToCancel.set(bookingId);
    this.showCancelDialog.set(true);
  }

  closeCancelDialog(): void {
    this.showCancelDialog.set(false);
    this.bookingToCancel.set(null);
  }

  confirmCancelBooking(): void {
    const bookingId = this.bookingToCancel();
    if (!bookingId) return;

    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    this.cancelling.set(true);
    const passengerId = this.authStore.currentUser()?.id;

    this.bookingService.cancelBooking(bookingId, passengerId).subscribe({
      next: () => {
        // Return seats to the ride
        const ride = this.rideCache.get(booking.rideId);
        if (ride) {
          const updatedSeats = ride.availableSeats + booking.seatsRequested;
          this.rideService.modifyRide(ride.id, {
            availableSeats: updatedSeats
          }).subscribe({
            next: () => {
              console.log('Seats returned successfully');
              this.cancelling.set(false);
              this.closeCancelDialog();
              this.loadBookings();
            },
            error: (error) => {
              console.error('Failed to return seats:', error);
              // Even if modifying ride fails, still close dialog and reload
              this.cancelling.set(false);
              this.closeCancelDialog();
              this.loadBookings();
            }
          });
        } else {
          this.cancelling.set(false);
          this.closeCancelDialog();
          this.loadBookings();
        }
      },
      error: (error) => {
        console.error('Failed to cancel booking:', error);
        this.cancelling.set(false);
        this.closeCancelDialog();
        this.loadBookings();
      }
    });
  }

  navigateToDashboard(): void {
    this.router.navigate(['/passenger/dashboard']);
  }

  getStatusClass(status: BookingStatus): string {
    const base = 'px-3 py-1 rounded-full text-sm font-medium';
    switch (status) {
      case BookingStatus.ACCEPTED:
        return `${base} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400`;
      case BookingStatus.REJECTED:
        return `${base} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400`;
      case BookingStatus.PENDING:
        return `${base} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400`;
      case BookingStatus.CANCELLED:
        return `${base} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300`;
      default:
        return `${base} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300`;
    }
  }

  BookingStatus = BookingStatus;
}