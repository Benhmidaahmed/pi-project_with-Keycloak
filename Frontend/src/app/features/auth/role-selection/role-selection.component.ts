import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '../../../core/state/auth.store';
import { UserRole } from '../../../core/models/user.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';

/**
 * Role selection component
 * Shown after login/signup to allow users to choose between Driver and Passenger roles
 * Large cards for easy selection
 */
@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, CardComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl w-full">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Choose Your Role
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Select how you want to use the carpooling platform
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Driver Card -->
          <div
            (click)="selectRole(UserRole.DRIVER)"
            class="cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <app-card class="h-full hover:shadow-xl">
              <div class="text-center">
                <div class="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30">
                  <svg class="w-10 h-10 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Driver
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                  Publish your rides and share your journey with others. Earn while you travel.
                </p>
                <ul class="text-left space-y-2 mb-8 text-gray-700 dark:text-gray-300">
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Publish rides with your vehicle
                  </li>
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Manage booking requests
                  </li>
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Earn money from rides
                  </li>
                </ul>
                <app-button
                  variant="primary"
                  size="lg"
                  [fullWidth]="true"
                >
                  Continue as Driver
                </app-button>
              </div>
            </app-card>
          </div>

          <!-- Passenger Card -->
          <div
            (click)="selectRole(UserRole.PASSENGER)"
            class="cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <app-card class="h-full hover:shadow-xl">
              <div class="text-center">
                <div class="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <svg class="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Passenger
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                  Find affordable rides to your destination. Book with trusted drivers.
                </p>
                <ul class="text-left space-y-2 mb-8 text-gray-700 dark:text-gray-300">
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Search and book rides easily
                  </li>
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Filter by preferences
                  </li>
                  <li class="flex items-center">
                    <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Safe and reliable travel
                  </li>
                </ul>
                <app-button
                  variant="primary"
                  size="lg"
                  [fullWidth]="true"
                >
                  Continue as Passenger
                </app-button>
              </div>
            </app-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RoleSelectionComponent {
  UserRole = UserRole; // Expose enum to template

  constructor(
    private authStore: AuthStore,
    private router: Router
  ) {}

  selectRole(role: UserRole): void {
    // Update user role in auth store
    this.authStore.updateUserRole(role);
    
    if (role === UserRole.DRIVER) {
      this.router.navigate(['/driver/dashboard']);
    } else if (role === UserRole.PASSENGER) {
      this.router.navigate(['/passenger/dashboard']);
    }
  }
}

