import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthStore } from '../../../core/state/auth.store';
import { AuthService } from '../../../core/services/auth.service';
import { RidesStore } from '../../../core/state/rides.store';
import { BookingsStore } from '../../../core/state/bookings.store';
import { RideService } from '../../../core/services/ride.service';
import { BookingService } from '../../../core/services/booking.service';
import { ReviewService } from '../../../core/services/review.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Ride } from '../../../core/models/ride.model';
import { User } from '../../../core/models/user.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { CardComponent } from '../../../shared/components/card/card.component';

/**
 * Book Ride component
 * Allows passengers to book a specific ride
 * Shows ride details and booking form
 */
@Component({
  selector: 'app-book-ride',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    CardComponent
  ],
  template: `
    <!-- Book Ride Template - Complete Fixed Version -->
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      @if (ride) {
        <!-- Header Section with Gradient -->
        <div class="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-emerald-800 dark:from-green-700 dark:to-emerald-900 p-8 shadow-xl">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>

          <div class="relative z-10">
            <h1 class="text-4xl font-bold text-white mb-2">
              Book Your Ride 🎫
            </h1>
            <p class="text-green-100 text-lg">
              Review the details and confirm your booking
            </p>
          </div>
        </div>

        <!-- Ride Details Card -->
        <div class="mb-8 group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
          <!-- Animated Background Elements -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-gray-50 dark:bg-gray-700/20 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-500"></div>

          <div class="bg-gradient-to-r from-blue-50 to-cyan-100 dark:from-gray-700 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ride Details
            </h2>
          </div>

          <div class="relative z-10 p-6">
            <!-- Route -->
            <div class="mb-6">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Route</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {{ ride.departureCity }}
                    <span class="text-blue-600 dark:text-blue-400 mx-2">→</span>
                    {{ ride.destinationCity }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Info Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Departure Info -->
              <div class="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700/50 shadow-sm">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-xs text-purple-600 dark:text-purple-400 font-medium">Departure</p>
                </div>
                <p class="font-bold text-gray-900 dark:text-gray-100">
                  {{ ride.departureDate | date:'MMM d, y' }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  at {{ ride.departureTime }}
                </p>
              </div>

              <!-- Driver Info -->
              <div class="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-700/50 shadow-sm">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p class="text-xs text-orange-600 dark:text-orange-400 font-medium">Driver</p>
                </div>
                <button
                    (click)="viewDriverProfile()"
                    class="font-bold text-gray-900 dark:text-gray-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-left"
                >
                  {{ getDriverName() }}
                </button>
                <div class="mt-1">
                  @if (driverRating !== null) {
                    <span class="inline-flex items-center gap-1 text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                      {{ driverRating.toFixed(1) }}
                </span>
                  } @else if (loadingRating) {
                    <span class="text-xs text-gray-400">Loading...</span>
                  }
                </div>
              </div>

              <!-- Available Seats -->
              <div class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700/50 shadow-sm">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p class="text-xs text-green-600 dark:text-green-400 font-medium">Available Seats</p>
                </div>
                <p class="font-bold text-gray-900 dark:text-gray-100 text-2xl">
                  {{ ride.availableSeats }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking Form Card -->
        <div class="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <!-- Animated Background Elements -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-gray-50 dark:bg-gray-700/20 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-500"></div>

          <div class="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-gray-700 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Booking Information
            </h2>
          </div>

          <div class="relative z-10 p-6">
            <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
              <div class="mb-6">
                <app-input
                    id="seats"
                    label="Number of Seats"
                    type="number"
                    placeholder="Enter number of seats (1-{{ ride.availableSeats }})"
                    formControlName="seats"
                    [required]="true"
                    [error]="getErrorMessage('seats')"
                />
              </div>

              @if (errorMessage) {
                <div class="mb-6 p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-l-4 border-red-500 dark:border-red-400 rounded-lg shadow-sm">
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-bold text-red-800 dark:text-red-300 mb-1">Booking Error</p>
                      <p class="text-sm text-red-700 dark:text-red-400">{{ errorMessage }}</p>
                    </div>
                  </div>
                </div>
              }

              <div class="flex flex-col sm:flex-row gap-3">
                <app-button
                    type="submit"
                    variant="primary"
                    size="lg"
                    [fullWidth]="true"
                    [loading]="loading"
                    [disabled]="!bookingForm.valid"
                    class="shadow-lg hover:shadow-xl transition-shadow"
                >
                  <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm Booking
                </app-button>
                <app-button
                    type="button"
                    variant="secondary"
                    size="lg"
                    (onClick)="cancel()"
                >
                  <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </app-button>
              </div>
            </form>
          </div>
        </div>

      } @else {
        <!-- Loading/Error State -->
        <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div class="text-center py-16 px-6">
            @if (errorMessage) {
              <div class="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg class="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ errorMessage }}</h3>
              <p class="text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
            } @else {
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
              <p class="text-gray-600 dark:text-gray-400 font-medium">Loading ride details...</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class BookRideComponent implements OnInit {
  ride: Ride | null = null;
  driver: User | null = null;
  driverRating: number | null = null;
  loadingRating = false;
  bookingForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private fb: FormBuilder,
      private authStore: AuthStore,
      private authService: AuthService,
      private ridesStore: RidesStore,
      private bookingsStore: BookingsStore,
      private rideService: RideService,
      private bookingService: BookingService,
      private reviewService: ReviewService,
      private notificationService: NotificationService
  ) {
    this.bookingForm = this.fb.group({
      seats: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    const rideId = this.route.snapshot.paramMap.get('id');
    if (rideId) {
      this.loadRide(rideId);
    }
  }

  loadRide(rideId: string): void {
    console.log('=== Loading Ride ===');
    console.log('Ride ID:', rideId);

    this.rideService.getRideById(rideId).subscribe({
      next: (ride) => {
        console.log('Ride loaded:', ride);
        if (ride) {
          this.ride = ride;
          this.ridesStore.addRide(ride);
          this.ridesStore.setSelectedRide(ride);
          this.setupFormValidation();
          this.loadDriver(ride.driverId);
          this.loadDriverRating(ride.driverId);
        } else {
          console.error('Ride is undefined');
          this.errorMessage = 'Ride not found';
          setTimeout(() => {
            this.router.navigate(['/passenger/dashboard']);
          }, 2000);
        }
      },
      error: (error) => {
        console.error('Error loading ride:', error);
        this.errorMessage = 'Failed to load ride details';
        setTimeout(() => {
          this.router.navigate(['/passenger/dashboard']);
        }, 2000);
      }
    });
  }

  loadDriver(driverId: string): void {
    this.authService.getUserById(driverId).subscribe({
      next: (driver) => {
        this.driver = driver;
      },
      error: (error) => {
        console.error('Error loading driver:', error);
      }
    });
  }

  loadDriverRating(driverId: string): void {
    this.loadingRating = true;
    this.reviewService.getAverageRating(driverId).subscribe({
      next: (rating) => {
        this.driverRating = rating;
        this.loadingRating = false;
      },
      error: (error) => {
        console.error('Error loading driver rating:', error);
        this.driverRating = null;
        this.loadingRating = false;
      }
    });
  }

  getDriverName(): string {
    return this.driver?.name || this.driver?.email?.split('@')[0] || 'Loading...';
  }

  viewDriverProfile(): void {
    if (this.ride?.driverId) {
      this.router.navigate(['/profile', this.ride.driverId]);
    }
  }

  private setupFormValidation(): void {
    if (this.ride) {
      this.bookingForm.get('seats')?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(this.ride.availableSeats)
      ]);
      this.bookingForm.get('seats')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.bookingForm.valid && this.ride) {
      this.loading = true;
      this.errorMessage = '';

      const seats = this.bookingForm.get('seats')?.value;
      const user = this.authStore.currentUser();

      if (!user) {
        this.errorMessage = 'You must be logged in to book a ride';
        this.loading = false;
        return;
      }

      if (seats > this.ride.availableSeats) {
        this.errorMessage = 'Not enough available seats';
        this.loading = false;
        return;
      }

      const newAvailableSeats = this.ride.availableSeats - seats;

      this.bookingService.createBooking(this.ride.id, user.id, seats, this.ride).subscribe({
        next: (booking) => {
          this.rideService.modifyRide(this.ride!.id, { availableSeats: newAvailableSeats }).subscribe({
            next: (updatedRide) => {
              // Update bookings store with new booking
              this.bookingsStore.addBooking(booking);

              // Update ride availability in rides store
              this.ridesStore.updateRide(this.ride!.id, {
                availableSeats: newAvailableSeats
              });

              // Send notification to the driver
              const passengerName = user.name || user.email?.split('@')[0] || 'A passenger';
              const notificationMessage = `${passengerName} has booked your ride!`;

              this.notificationService.createNotification({
                userId: this.ride!.driverId,
                message: notificationMessage
              }).subscribe({
                next: () => {
                  console.log('Notification sent to driver');
                },
                error: (error) => {
                  console.error('Error sending notification to driver:', error);
                }
              });

              this.loading = false;
              this.router.navigate(['/passenger/bookings']);
            },
            error: (error) => {
              this.loading = false;
              this.errorMessage = 'Booking created but failed to update seats. Please contact support.';
              console.error('Error updating ride seats:', error);
            }
          });
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.message || 'Failed to book ride. Please try again.';
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/passenger/dashboard']);
  }

  getErrorMessage(controlName: string): string {
    const control = this.bookingForm.get(controlName);
    if (control?.hasError('required') && control.touched) {
      return 'Number of seats is required';
    }
    if (control?.hasError('min') && control.touched) {
      return 'Must book at least 1 seat';
    }
    if (control?.hasError('max') && control.touched) {
      return `Only ${this.ride?.availableSeats || 0} seats available`;
    }
    return '';
  }
}