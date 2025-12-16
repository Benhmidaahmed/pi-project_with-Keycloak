import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RideService } from '../../../core/services/ride.service';
import { AuthService } from '../../../core/services/auth.service';
import { Ride } from '../../../core/models/ride.model';
import { CardComponent } from '../../../shared/components/card/card.component';

interface RideWithDriver extends Ride {
  driverName?: string;
}

/**
 * Admin Rides component
 * Shows all rides history
 */
@Component({
  selector: 'app-admin-rides',
  standalone: true,
  imports: [CommonModule, DatePipe, CardComponent],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header Section with Gradient -->
      <div class="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 dark:from-blue-700 dark:to-indigo-900 p-8 shadow-xl">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>

        <div class="relative z-10 flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-white mb-2">
              All Rides History 🚗
            </h1>
            <p class="text-blue-100 text-lg">
              Complete overview of all rides in the system
            </p>
          </div>
          <div class="text-right">
            <div class="inline-flex items-center justify-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <span class="text-3xl font-bold text-white">{{ rides.length }}</span>
              <span class="text-white/80 ml-2">Total Rides</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 p-12">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p class="text-gray-600 dark:text-gray-400 mt-4 font-medium">Loading rides...</p>
          </div>
        </div>
      }

      <!-- Rides List -->
      @if (!loading) {
        <div class="space-y-4">
          @for (ride of rides; track ride.id) {
            <div class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-750 p-6 border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-500"></div>

              <div class="relative z-10">
                <!-- Route Info -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-3">
                      <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {{ ride.departureCity }}
                        <span class="text-blue-600 dark:text-blue-400 mx-2">→</span>
                        {{ ride.destinationCity }}
                      </h3>
                    </div>

                    <!-- Details Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <!-- Driver Info -->
                      <div class="p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700/50">
                        <div class="flex items-center gap-2 mb-1">
                          <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p class="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wider">Driver</p>
                        </div>
                        <p class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ ride.driverName || 'Unknown' }}</p>
                      </div>

                      <!-- Date & Time -->
                      <div class="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700/50">
                        <div class="flex items-center gap-2 mb-1">
                          <svg class="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p class="text-xs text-cyan-600 dark:text-cyan-400 font-medium uppercase tracking-wider">Departure</p>
                        </div>
                        <p class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ ride.departureDate | date:'MMM d, y, h:mm a' }}</p>
                      </div>

                      <!-- Status -->
                      <div class="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700/50">
                        <div class="flex items-center gap-2 mb-1">
                          <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p class="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wider">Status</p>
                        </div>
                        <p class="font-bold text-gray-900 dark:text-gray-100 text-sm capitalize">
                          <span [class]="getStatusClass(ride.status)">
                            {{ ride.status }}
                          </span>
                        </p>
                      </div>
                    </div>

                    <!-- Additional Info -->
                    <div class="flex items-center gap-6 mt-4 text-sm text-gray-600 dark:text-gray-400">
                      <div class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span class="font-medium">{{ ride.availableSeats }} seats available</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span class="font-medium">ID: {{ ride.id }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } @empty {
            <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 p-12">
              <div class="text-center">
                <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-500 dark:text-gray-400 font-medium text-lg">No rides found</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">There are no rides in the system yet</p>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: []
})
export class AdminRidesComponent implements OnInit {
  rides: RideWithDriver[] = [];
  loading = false;

  constructor(
      private rideService: RideService,
      private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.rideService.getAllRides().subscribe({
      next: (rides) => {
        this.rides = rides;

        // Debug: Log the structure of rides
        console.log('All rides:', rides);
        console.log('First ride:', rides[0]);

        // Fetch driver name for each ride
        this.rides.forEach((ride, index) => {
          console.log(`Ride ${index}:`, ride);
          console.log(`Driver object:`, ride.driver);
          console.log(`Driver ID:`, ride.driver?.id);

          // Try different ways to access driver ID
          let driverId = ride.driver?.id || (ride as any).driverId || (ride.driver as any);

          console.log(`Extracted driver ID:`, driverId);

          if (driverId) {
            console.log(`Calling getUserById for driver: ${driverId}`);
            this.authService.getUserById(driverId).subscribe({
              next: (user) => {
                console.log(`Got user for ${driverId}:`, user);
                ride.driverName = user.name;
              },
              error: (error) => {
                console.error(`Error fetching driver ${driverId}:`, error);
                ride.driverName = 'Unknown';
              }
            });
          } else {
            console.log(`No driver ID found for ride ${ride.id}`);
            ride.driverName = 'No Driver';
          }
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rides:', error);
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'text-yellow-600 dark:text-yellow-400',
      'COMPLETED': 'text-green-600 dark:text-green-400',
      'CANCELLED': 'text-red-600 dark:text-red-400',
      'ACTIVE': 'text-blue-600 dark:text-blue-400'
    };
    return statusMap[status?.toUpperCase()] || 'text-gray-600 dark:text-gray-400';
  }
}