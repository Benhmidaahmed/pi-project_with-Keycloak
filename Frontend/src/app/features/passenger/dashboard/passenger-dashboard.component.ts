import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import { AuthStore } from '../../../core/state/auth.store';
import { RideService } from '../../../core/services/ride.service';
import { AuthService } from '../../../core/services/auth.service';
import { Ride } from '../../../core/models/ride.model';
import { User } from '../../../core/models/user.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-passenger-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
  ],
  template: `
    <!-- Passenger Dashboard Template -->
    <div class="container mx-auto px-4 py-8">
      <!-- Header Section with Gradient -->
      <div class="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 dark:from-blue-700 dark:to-indigo-900 p-8 shadow-xl">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>

        <div class="relative z-10">
          <h1 class="text-4xl font-bold text-white mb-2">
            Find Your Perfect Ride, {{ authStore.currentUser()?.name }}! 🚗
          </h1>
          <p class="text-blue-100 text-lg">
            Search and book rides to your destination with ease
          </p>
        </div>
      </div>

      <!-- Search Form Card -->
      <div class="mb-8 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search for Rides
          </h2>
        </div>

        <div class="p-6">
          <form [formGroup]="searchForm" (ngSubmit)="searchRides()">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <!-- Departure City -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From</label>
                <div class="relative">
                  <input
                      type="text"
                      placeholder="Select departure city"
                      formControlName="departureCity"
                      class="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                      (input)="onManualInput('departure', $event)"
                  />
                  <button
                      type="button"
                      (click)="openMapDialog('departure')"
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-md transition-colors"
                      title="Select on map"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Destination City -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To</label>
                <div class="relative">
                  <input
                      type="text"
                      placeholder="Select destination city"
                      formControlName="destinationCity"
                      class="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                      (input)="onManualInput('destination', $event)"
                  />
                  <button
                      type="button"
                      (click)="openMapDialog('destination')"
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-md transition-colors"
                      title="Select on map"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                <input
                    type="date"
                    formControlName="date"
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                />
              </div>
              <!-- Gender Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Driver Gender</label>
                <select
                    formControlName="gender"
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                >
                  <option value="">Any Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <app-button type="submit" variant="primary" size="lg" [fullWidth]="true" class="shadow-lg hover:shadow-xl transition-shadow">
                <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Rides
              </app-button>

              @if (searchForm.value.departureCity || searchForm.value.destinationCity || searchForm.value.date || searchForm.value.gender) {
                <app-button type="button" variant="secondary" size="lg" (onClick)="clearFilters()">
                  <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </app-button>
              }
            </div>
          </form>
        </div>
      </div>

      <!-- Map Dialog -->
      @if (showMapDialog) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl relative">
            <button (click)="closeMapDialog()" class="absolute top-4 right-4 text-gray-700 dark:text-gray-300">✕</button>
            <input
                #mapSearchInput
                type="text"
                placeholder="Search city..."
                class="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                (input)="onMapSearchInput($event)"
            />            <div #mapContainer class="w-full h-96 mb-4 rounded border"></div>
            <div class="flex justify-between">
              <button (click)="locateCurrentCity()" class="px-4 py-2 bg-blue-600 text-white rounded">Use My Location</button>
              <button (click)="confirmCitySelection()" class="px-4 py-2 bg-green-600 text-white rounded">Confirm</button>
            </div>
          </div>
        </div>
      }

      <!-- Loading State -->
      @if (loading) {
        <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 p-12">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p class="text-gray-600 dark:text-gray-400 mt-4 font-medium">Searching for rides...</p>
          </div>
        </div>
      }

      <!-- Available Rides Section -->
      @if (!loading) {
        <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-gray-700 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Available Rides
              <span class="ml-auto inline-flex items-center justify-center px-3 py-1 text-sm font-bold text-green-800 dark:text-green-300 bg-green-200 dark:bg-green-900/40 rounded-full">
            {{ rides.length }}
          </span>
            </h2>
          </div>

          <div class="p-6">
            @if (rides.length > 0) {
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                @for (ride of rides; track ride.id) {
                  <div class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-750 p-6 border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div class="absolute bottom-0 left-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-500"></div>

                    <!-- Driver Info -->
                    <div class="relative z-10 flex items-center gap-4 mb-5 pb-5 border-b border-gray-200 dark:border-gray-600">
                      <button
                          (click)="viewDriverProfile(ride.driverId)"
                          class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-110 group-hover:rotate-6 transition-all duration-300 cursor-pointer"
                      >
                        {{ getInitials(getDriverName(ride.driverId)) }}
                      </button>
                      <div class="flex-1">
                        <button
                            (click)="viewDriverProfile(ride.driverId)"
                            class="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                        >
                          {{ getDriverName(ride.driverId) }}
                          @if (getDriverInfo(ride.driverId)?.rating) {
                            <span class="inline-flex items-center gap-1 text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                              {{ getDriverInfo(ride.driverId)?.rating?.toFixed(1) }}
                        </span>
                          }
                        </button>
                        <p class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {{ getDriverRideCount(ride.driverId) }} completed rides
                        </p>
                      </div>
                    </div>

                    <!-- Route Info -->
                    <div class="relative z-10 mb-4">
                      <div class="flex items-center gap-2 mb-2">
                        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p class="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {{ ride.departureCity }}
                          <span class="text-blue-600 dark:text-blue-400 mx-2">→</span>
                          {{ ride.destinationCity }}
                        </p>
                      </div>
                    </div>

                    <!-- Departure Info -->
                    <div class="relative z-10 grid grid-cols-2 gap-4 mb-5">
                      <div class="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700/50">
                        <div class="flex items-center gap-2 mb-1">
                          <svg class="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p class="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Date</p>
                        </div>
                        <p class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ ride.departureDate | date:'MMM d, y' }}</p>
                      </div>
                      <div class="p-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-700/50">
                        <div class="flex items-center gap-2 mb-1">
                          <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p class="text-xs text-orange-600 dark:text-orange-400 font-medium">Time</p>
                        </div>
                        <p class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ ride.departureTime }}</p>
                      </div>
                    </div>

                    <!-- Vehicle Info -->
                    @if (getDriverInfo(ride.driverId)?.vehicle) {
                      <div class="relative z-10 mb-5 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700/50 shadow-sm">
                        <div class="flex items-center gap-2 text-sm">
                          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <p class="text-xs text-purple-600 dark:text-purple-400 font-medium">Vehicle</p>
                            <p class="font-bold text-gray-900 dark:text-gray-100">
                              {{ getDriverInfo(ride.driverId)?.vehicle?.brand }}
                              {{ getDriverInfo(ride.driverId)?.vehicle?.model }}
                              <span class="text-gray-600 dark:text-gray-400 font-normal">({{ getDriverInfo(ride.driverId)?.vehicle?.color }})</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    }

                    <!-- Bottom Actions -->
                    <div class="relative z-10 flex items-center justify-between">
                        <span class="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-bold shadow-sm">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {{ ride.availableSeats }} seat{{ ride.availableSeats !== 1 ? 's' : '' }}
                         </span>
                      <span class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-800 dark:text-emerald-400 rounded-full text-sm font-bold shadow-sm">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
                        @if (ride.pricePerSeat) {
                          {{ ride.pricePerSeat }} TND
                        } @else {
                          <span class="text-xs">Free</span>
                        }
    </span>
                        <app-button variant="primary" size="md" (click)="bookRide(ride)">
                          Book Ride
                        </app-button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-12">
                <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-500 dark:text-gray-400 font-medium text-lg">No rides found</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Try adjusting your search filters or check back later</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class PassengerDashboardComponent implements OnInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @ViewChild('mapSearchInput', { static: false }) mapSearchInput!: ElementRef;


  searchDebounceTimer: any = null;
  searchForm: FormGroup;
  rides: Ride[] = [];
  loading = false;
  driverCache: Map<string, User> = new Map();
  driverRideCountCache: Map<string, number> = new Map();

  showMapDialog = false;
  currentMapField: 'departure' | 'destination' | null = null;

  map: L.Map | null = null;
  mapMarker: L.Marker | null = null;
  selectedCity: string | null = null;
  locatingCity = false;
  locationError: string | null = null;

  constructor(
      public authStore: AuthStore,
      private fb: FormBuilder,
      private rideService: RideService,
      private authService: AuthService,
      private router: Router,
      private ngZone: NgZone
  ) {
    this.searchForm = this.fb.group({
      departureCity: [''],
      destinationCity: [''],
      date: [''],
      gender: ['']
    });
  }

  ngOnInit(): void {
    this.loadAllRides();
  }

  openMapDialog(field: 'departure' | 'destination'): void {
    this.currentMapField = field;
    this.showMapDialog = true;
    this.selectedCity = null;
    this.locationError = null;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });
    setTimeout(() => {
      if (this.mapContainer) {
        this.initializeMap();
      }
    }, 0);
  }


  closeMapDialog(): void {
    this.showMapDialog = false;
    this.currentMapField = null;
    this.selectedCity = null;
    this.locationError = null;

    if (this.map) {
      this.map.remove();
      this.map = null;
      this.mapMarker = null;
    }
  }

  initializeMap(): void {
    if (!this.mapContainer) return;

    const defaultCenter: [number, number] = [33.8869, 9.5375];

    this.map = L.map(this.mapContainer.nativeElement, {
      center: defaultCenter,
      zoom: 7
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    this.mapMarker = L.marker(defaultCenter, { draggable: true }).addTo(this.map);

    this.map.on("click", (e: any) => {
      if (!this.mapMarker) return;
      const { lat, lng } = e.latlng;
      this.mapMarker.setLatLng([lat, lng]);
      this.reverseGeocode(lat, lng);
    });

    this.mapMarker.on("dragend", () => {
      if (!this.mapMarker) return;
      const pos = this.mapMarker.getLatLng();
      this.reverseGeocode(pos.lat, pos.lng);
    });
  }

  reverseGeocode(lat: number, lng: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`)
        .then(res => res.json())
        .then(data => {
          this.ngZone.run(() => {
            const addr = data.address;
            this.selectedCity =
                addr.city || addr.town || addr.village || addr.county || addr.state || '';
            if (this.mapSearchInput) this.mapSearchInput.nativeElement.value = this.selectedCity;
          });
        });
  }

  onManualInput(field: 'departure' | 'destination', event: any) {
    const value = event.target.value;
    this.searchForm.patchValue({
      [field === 'departure' ? 'departureCity' : 'destinationCity']: value
    });
  }

  searchCity(query: string): void {
    if (!query.trim() || !this.map || !this.mapMarker) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1&accept-language=en`)
        .then(res => res.json())
        .then(results => {
          if (results.length === 0 || !this.map || !this.mapMarker) return;

          const r = results[0];
          const lat = parseFloat(r.lat);
          const lng = parseFloat(r.lon);

          this.map.setView([lat, lng], 12);
          this.mapMarker.setLatLng([lat, lng]);

          const addr = r.address;
          this.selectedCity =
              addr.city || addr.town || addr.village || addr.county || addr.state || '';
          if (this.mapSearchInput) this.mapSearchInput.nativeElement.value = this.selectedCity;
        });
  }

  locateCurrentCity(): void {
    if (!navigator.geolocation) {
      this.locationError = 'Geolocation not supported.';
      return;
    }

    this.locatingCity = true;
    navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          this.map!.setView([lat, lng], 12);
          this.mapMarker!.setLatLng([lat, lng]);

          this.reverseGeocode(lat, lng);
          this.locatingCity = false;
        },
        err => {
          this.locatingCity = false;
          this.locationError = 'Could not retrieve location.';
        }
    );
  }

  confirmCitySelection(): void {
    if (!this.selectedCity || !this.currentMapField) return;

    const patch = this.currentMapField === 'departure'
        ? { departureCity: this.selectedCity }
        : { destinationCity: this.selectedCity };

    this.searchForm.patchValue(patch);
    this.closeMapDialog();
  }


  loadAllRides(): void {
    this.loading = true;
    const passenger = this.authStore.currentUser();

    this.rideService.searchRides({
      passengerGender: passenger?.gender
    }).subscribe({
      next: (rides: Ride[]) => {
        this.rides = rides;
        this.loadDriversForRides(rides);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  searchRides(): void {
    this.loading = true;
    const v = this.searchForm.value;
    const passenger = this.authStore.currentUser();

    this.rideService.searchRides({
      departureCity: v.departureCity || undefined,
      destinationCity: v.destinationCity || undefined,
      date: v.date ? new Date(v.date) : undefined,
      passengerGender: passenger?.gender
    }).subscribe({
      next: (rides: Ride[]) => {
        // First load all drivers
        this.loadDriversForRides(rides);

        // Then filter by gender if selected
        if (v.gender) {
          this.filterRidesByDriverGender(rides, v.gender);
        } else {
          this.rides = rides;
        }

        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
  filterRidesByDriverGender(rides: Ride[], selectedGender: string): void {
    const driverIds = [...new Set(rides.map(r => r.driverId))];

    // Fetch all drivers first if not in cache
    const driverRequests = driverIds
        .filter(id => !this.driverCache.has(id))
        .map(id => this.authService.getUserById(id));

    if (driverRequests.length > 0) {
      forkJoin(driverRequests).subscribe({
        next: (drivers) => {
          drivers.forEach(driver => {
            this.driverCache.set(driver.id, driver);
          });
          this.applyGenderFilter(rides, selectedGender);
        },
        error: () => {
          this.rides = rides;
        }
      });
    } else {
      this.applyGenderFilter(rides, selectedGender);
    }
  }

  private applyGenderFilter(rides: Ride[], selectedGender: string): void {
    this.rides = rides.filter(ride => {
      const driver = this.driverCache.get(ride.driverId);
      if (!driver) return true;

      return driver.gender?.toLowerCase() === selectedGender.toLowerCase();
    });
  }
  loadDriversForRides(rides: Ride[]): void {
    const driverIds = [...new Set(rides.map(r => r.driverId))]
        .filter(id => !this.driverCache.has(id));

    if (driverIds.length === 0) return;

    const driverReq = driverIds.map(id => this.authService.getUserById(id));
    const rideCountReq = driverIds.map(id => this.rideService.getDriverRides(id));

    forkJoin([forkJoin(driverReq), forkJoin(rideCountReq)]).subscribe({
      next: ([drivers, counts]) => {
        drivers.forEach((driver, i) => this.driverCache.set(driverIds[i], driver));
        counts.forEach((rides, i) => this.driverRideCountCache.set(driverIds[i], rides.length));
      }
    });
  }
  onMapSearchInput(event: any): void {
    const query = event.target.value;

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      if (query.trim().length > 2) {
        this.searchCity(query);
      }
    }, 500);
  }
  getDriverName(driverId: string): string {
    const driver = this.driverCache.get(driverId);
    return driver?.name || driver?.email?.split('@')[0] || 'Loading...';
  }

  getDriverInfo(driverId: string): User | undefined {
    return this.driverCache.get(driverId);
  }

  getDriverRideCount(driverId: string): number {
    return this.driverRideCountCache.get(driverId) || 0;
  }

  viewDriverProfile(driverId: string): void {
    this.router.navigate(['/profile', driverId]);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.loadAllRides();
  }

  bookRide(ride: Ride): void {
    this.router.navigate(['/passenger/book-ride', ride.id]);
  }

}
