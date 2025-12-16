import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '../../../core/state/auth.store';
import { AuthService } from '../../../core/services/auth.service';
import { RideService } from '../../../core/services/ride.service';
import { BookingService } from '../../../core/services/booking.service';
import { ReviewService } from '../../../core/services/review.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Ride } from '../../../core/models/ride.model';
import { Booking, BookingStatus } from '../../../core/models/ride.model';
import { User } from '../../../core/models/user.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ReviewListComponent } from '../../reviews/review-list/review-list.component';
import { forkJoin } from 'rxjs';

/**
 * Driver Dashboard component
 * Main dashboard for drivers showing:
 * - Quick stats
 * - Publish ride button
 * - Recent rides
 * - Booking requests
 */
@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule, ButtonComponent, CardComponent, ReviewListComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header Section with Gradient -->
      <div class="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 p-8 shadow-xl">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>

        <div class="relative z-10">
          <h1 class="text-4xl font-bold text-white mb-2">
            Welcome back, {{ authStore.currentUser()?.name }}! 👋
          </h1>
          <p class="text-primary-100 text-lg">
            Manage your rides and bookings from your command center
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-8">
        <app-button
            variant="primary"
            size="lg"
            (onClick)="navigateToPublishRide()"
            class="shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Publish New Ride
        </app-button>
      </div>

      <!-- Stats Grid with Animations -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total Rides Card -->
        <div class="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
          <div class="absolute top-0 right-0 w-32 h-32 bg-primary-50 dark:bg-primary-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Rides</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{{ totalRides }}</p>
              <p class="text-xs text-primary-600 dark:text-primary-400 font-medium">All time</p>
            </div>
            <div class="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Pending Requests Card -->
        <div class="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
          <div class="absolute top-0 right-0 w-32 h-32 bg-yellow-50 dark:bg-yellow-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Pending Requests</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{{ pendingBookings }}</p>
              <p class="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Awaiting response</p>
            </div>
            <div class="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          @if (pendingBookings > 0) {
            <div class="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          }
        </div>

        <!-- Rating Card -->
        <div class="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
          <div class="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Your Rating</p>
              <div class="flex items-baseline gap-2">
                <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ averageRating || 'N/A' }}</p>
                @if (averageRating) {
                  <span class="text-yellow-500">★</span>
                }
              </div>
              <p class="text-xs text-green-600 dark:text-green-400 font-medium">Average score</p>
            </div>
            <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Rides & Booking Requests -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- My Recent Rides -->
        <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              My Recent Rides
            </h2>
          </div>

          <div class="p-6">
            <div class="space-y-4">
              @for (ride of recentRides; track ride.id) {
                <div class="group relative overflow-hidden flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-600">
                  <div class="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-primary-500/5 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>

                  <div class="relative z-10 flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <svg class="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p class="font-semibold text-gray-900 dark:text-gray-100">
                        {{ ride.departureCity }}
                        <span class="text-primary-600 dark:text-primary-400 mx-1">→</span>
                        {{ ride.destinationCity }}
                      </p>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ ride.departureDate | date:'medium' }}
                    </div>
                  </div>

                  <div class="relative z-10">
                <span class="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-semibold shadow-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {{ ride.availableSeats }}
                </span>
                  </div>
                </div>
              } @empty {
                <div class="text-center py-12">
                  <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="text-gray-500 dark:text-gray-400 font-medium">No recent rides</p>
                  <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Publish your first ride to get started</p>
                </div>
              }
            </div>

            <div class="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <a routerLink="/driver/rides" class="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors group">
                View all rides
                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Booking Requests -->
        <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-gray-700 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Booking Requests
              @if (pendingBookings > 0) {
                <span class="ml-auto inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
              {{ pendingBookings }}
            </span>
              }
            </h2>
          </div>

          <div class="p-6">
            <div class="space-y-4">
              @for (booking of recentBookings; track booking.id) {
                <div class="relative overflow-hidden p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg border-l-4 border-yellow-500 dark:border-yellow-400 shadow-sm hover:shadow-md transition-all duration-300">
                  <div class="flex items-start justify-between mb-3">
                    <button
                        (click)="viewPassengerProfile(booking.passengerId)"
                        class="group flex items-center gap-2 font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      <div class="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg class="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span class="group-hover:underline">{{ getPassengerName(booking.passengerId) }}</span>
                    </button>

                    <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-xs font-bold">
                  <span class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  Pending
                </span>
                  </div>

                  <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span class="font-medium">{{ booking.seatsRequested }} seat(s) requested</span>
                  </div>

                  <div class="flex gap-2">
                    <app-button variant="primary" size="sm" (onClick)="acceptBooking(booking.id)" class="flex-1">
                      <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Accept
                    </app-button>
                    <app-button variant="danger" size="sm" (onClick)="openRejectDialog(booking.id)" class="flex-1">
                      <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </app-button>
                  </div>
                </div>
              } @empty {
                <div class="text-center py-12">
                  <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="text-gray-500 dark:text-gray-400 font-medium">No pending requests</p>
                  <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">You're all caught up!</p>
                </div>
              }
            </div>

            <div class="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <a routerLink="/driver/bookings" class="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors group">
                View all requests
                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Your Reviews
          </h2>
        </div>
        <div class="p-6">
          <app-review-list [userId]="authStore.currentUser()?.id"></app-review-list>
        </div>
      </div>
    </div>

    <!-- REJECT DIALOG -->
    @if (showRejectDialog()) {
      <div class="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" (click)="closeRejectDialog()"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-scale-in border border-gray-200 dark:border-gray-700">

            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
              <svg class="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Reject Booking Request?</h3>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                Are you sure you want to reject this booking request from
                <span class="font-semibold text-gray-900 dark:text-gray-100">{{ getPassengerName(getBookingToReject()?.passengerId || '') }}</span>?
                This action cannot be undone and the passenger will be notified.
              </p>
            </div>

            <div class="flex gap-3">
              <app-button variant="secondary" size="md" class="flex-1"
                          (onClick)="closeRejectDialog()" [disabled]="rejecting()">
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Keep Request
              </app-button>

              <app-button variant="danger" size="md" class="flex-1"
                          [loading]="rejecting()" (onClick)="confirmRejectBooking()">
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Yes, Reject
              </app-button>
            </div>

          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class DriverDashboardComponent implements OnInit {
  totalRides = 0;
  pendingBookings = 0;
  averageRating: number | null = null;
  recentRides: Ride[] = [];
  recentBookings: Booking[] = [];
  passengerCache: Map<string, User> = new Map();

  showRejectDialog = signal(false);
  bookingToReject = signal<string | null>(null);
  rejecting = signal(false);

  constructor(
      public authStore: AuthStore,
      private authService: AuthService,
      private rideService: RideService,
      private bookingService: BookingService,
      private reviewService: ReviewService,
      private notificationService: NotificationService,
      private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    const user = this.authStore.currentUser();
    if (!user) return;

    // Load driver rides
    this.rideService.getDriverRides(user.id).subscribe({
      next: (rides) => {
        this.totalRides = rides.length;
        this.recentRides = rides.slice(0, 3); // Show 3 most recent
      },
      error: (error) => {
        console.error('Error loading rides:', error);
      }
    });

    // Load pending bookings
    this.bookingService.getDriverBookingRequests(user.id).subscribe({
      next: (bookings) => {
        const pendingBookings = bookings.filter(b => b.status === BookingStatus.PENDING);
        this.pendingBookings = pendingBookings.length;
        this.recentBookings = pendingBookings.slice(0, 3);

        // Load passenger info for the recent bookings
        this.loadPassengersForBookings(this.recentBookings);
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
      }
    });

    // Load average rating
    this.reviewService.getAverageRating(user.id).subscribe({
      next: (rating) => {
        this.averageRating = rating;
      },
      error: (error) => {
        console.error('Error loading rating:', error);
      }
    });
  }

  loadPassengersForBookings(bookings: Booking[]): void {
    // Get unique passenger IDs that aren't already cached
    const passengerIds = [...new Set(bookings.map(b => b.passengerId))]
        .filter(id => !this.passengerCache.has(id));

    if (passengerIds.length === 0) return;

    // Load all passengers in parallel
    const passengerRequests = passengerIds.map(id =>
        this.authService.getUserById(id)
    );

    forkJoin(passengerRequests).subscribe({
      next: (passengers) => {
        passengers.forEach((passenger, index) => {
          this.passengerCache.set(passengerIds[index], passenger);
        });
      },
      error: (error) => {
        console.error('Error loading passengers:', error);
      }
    });
  }

  getPassengerName(passengerId: string): string {
    const passenger = this.passengerCache.get(passengerId);
    return passenger?.name || passenger?.email?.split('@')[0] || 'Loading...';
  }

  getBookingToReject(): Booking | undefined {
    const bookingId = this.bookingToReject();
    if (!bookingId) return undefined;
    return this.recentBookings.find(b => b.id === bookingId);
  }

  viewPassengerProfile(passengerId: string): void {
    this.router.navigate(['/profile', passengerId]);
  }

  navigateToPublishRide(): void {
    this.router.navigate(['/driver/publish-ride']);
  }

  acceptBooking(bookingId: string): void {
    const user = this.authStore.currentUser();
    const driverId = user?.id;

    // Find the booking to get passenger info
    const booking = this.recentBookings.find(b => b.id === bookingId);

    this.bookingService.acceptBooking(bookingId, driverId).subscribe({
      next: () => {
        // Send notification to passenger
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

        this.loadDashboardData(); // Refresh data
      },
      error: (error) => {
        console.error('Error accepting booking:', error);
        alert('Failed to accept booking. Please try again.');
      }
    });
  }

  openRejectDialog(bookingId: string): void {
    this.bookingToReject.set(bookingId);
    this.showRejectDialog.set(true);
  }

  closeRejectDialog(): void {
    this.showRejectDialog.set(false);
    this.bookingToReject.set(null);
  }

  confirmRejectBooking(): void {
    const bookingId = this.bookingToReject();
    if (!bookingId) return;

    const user = this.authStore.currentUser();
    const driverId = user?.id;

    // Find the booking to get ride info and seats requested
    const booking = this.recentBookings.find(b => b.id === bookingId);

    this.rejecting.set(true);

    this.bookingService.rejectBooking(bookingId, driverId).subscribe({
      next: () => {
        // Send notification to passenger
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

        // If we have the booking info, restore the seats to the ride
        if (booking) {
          this.rideService.getRideById(booking.rideId).subscribe({
            next: (ride) => {
              // Add back the seats that were requested
              if (ride) {
                const newAvailableSeats = ride.availableSeats + booking.seatsRequested;

                this.rideService.modifyRide(booking.rideId, {
                  availableSeats: newAvailableSeats
                }).subscribe({
                  next: () => {
                    this.rejecting.set(false);
                    this.closeRejectDialog();
                    this.loadDashboardData(); // Refresh data
                  },
                  error: (error) => {
                    console.error('Error updating ride seats:', error);
                    this.rejecting.set(false);
                    this.closeRejectDialog();
                    this.loadDashboardData();
                  }
                });
              } else {
                this.rejecting.set(false);
                this.closeRejectDialog();
                this.loadDashboardData();
              }
            },
            error: (error) => {
              console.error('Error loading ride:', error);
              this.rejecting.set(false);
              this.closeRejectDialog();
              this.loadDashboardData();
            }
          });
        } else {
          this.rejecting.set(false);
          this.closeRejectDialog();
          this.loadDashboardData();
        }
      },
      error: (error) => {
        console.error('Error rejecting booking:', error);
        this.rejecting.set(false);
        this.closeRejectDialog();
        alert('Failed to reject booking. Please try again.');
      }
    });
  }
}