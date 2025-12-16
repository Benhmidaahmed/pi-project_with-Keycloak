import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStore } from '../../../core/state/auth.store';
import { UserRole } from '../../../core/models/user.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { CardComponent } from '../../../shared/components/card/card.component';

/**
 * Signup component
 * Handles user registration with role selection (Passenger or Driver)
 * Drivers need additional fields (CIN, vehicle information)
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    InputComponent,
    CardComponent
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl w-full">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Create Account</h2>
          <p class="mt-2 text-gray-600 dark:text-gray-400">Join our carpooling community</p>
        </div>

        <app-card>
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
            <!-- Role Selection -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                I want to <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  (click)="selectRole(UserRole.PASSENGER)"
                  [class]="getRoleButtonClasses(UserRole.PASSENGER)"
                >
                  <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="font-semibold">Passenger </span>
                  <span class="text-sm opacity-75"> Find rides</span>
                </button>
                <button
                  type="button"
                  (click)="selectRole(UserRole.DRIVER)"
                  [class]="getRoleButtonClasses(UserRole.DRIVER)"
                >
                  <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span class="font-semibold">Driver </span>
                  <span class="text-sm opacity-75"> Publish rides</span>
                </button>
              </div>
            </div>

            <!-- Common Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <app-input
                id="name"
                label="Full Name"
                type="text"
                placeholder="User name"
                formControlName="name"
                [required]="true"
                [error]="getErrorMessage('name')"
              />

              <app-input
                id="phone"
                label="Phone Number"
                type="tel"
                placeholder="+216 XX XXX XXX"
                formControlName="phone"
                [required]="true"
                [error]="getErrorMessage('phone')"
              />
            </div>

            <app-input
              id="email"
              label="Email"
              type="email"
              placeholder="your.email@example.com"
              formControlName="email"
              [required]="true"
              [error]="getErrorMessage('email')"
            />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <app-input
                id="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                formControlName="password"
                [required]="true"
                [error]="getErrorMessage('password')"
              />

              <app-input
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                formControlName="confirmPassword"
                [required]="true"
                [error]="getErrorMessage('confirmPassword')"
              />
            </div>

            <!-- Driver-specific fields -->
            @if (selectedRole() === 'DRIVER') {
              <div class="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Driver Information
                </h3>

                <app-input
                  id="cin"
                  label="CIN / ID Number"
                  type="text"
                  placeholder="AB123456"
                  formControlName="cin"
                  [required]="true"
                  [error]="getErrorMessage('cin')"
                />

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <app-input
                    id="vehicleBrand"
                    label="Vehicle Brand"
                    type="text"
                    placeholder="Toyota"
                    formControlName="vehicleBrand"
                    [required]="true"
                    [error]="getErrorMessage('vehicleBrand')"
                  />

                  <app-input
                    id="vehicleModel"
                    label="Vehicle Model"
                    type="text"
                    placeholder="Corolla"
                    formControlName="vehicleModel"
                    [required]="true"
                    [error]="getErrorMessage('vehicleModel')"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <app-input
                    id="licensePlate"
                    label="License Plate"
                    type="text"
                    placeholder="ABC-123"
                    formControlName="licensePlate"
                    [required]="true"
                    [error]="getErrorMessage('licensePlate')"
                  />

                  <app-input
                    id="vehicleColor"
                    label="Vehicle Color"
                    type="text"
                    placeholder="White"
                    formControlName="vehicleColor"
                    [required]="true"
                    [error]="getErrorMessage('vehicleColor')"
                  />
                </div>

                <app-input
                  id="vehicleSeats"
                  label="Number of Seats"
                  type="number"
                  placeholder="4"
                  formControlName="vehicleSeats"
                  [required]="true"
                  [error]="getErrorMessage('vehicleSeats')"
                />
              </div>
            }

            @if (errorMessage) {
              <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
              </div>
            }

            <app-button
              type="submit"
              variant="primary"
              size="lg"
              [loading]="loading"
              [fullWidth]="true"
            >
              Create Account
            </app-button>

            <div class="mt-6 text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?
                <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </app-card>
      </div>
    </div>
  `,
  styles: []
})
export class SignupComponent {
  signupForm: FormGroup;
  selectedRole = signal<UserRole | null>(null);
  loading = false;
  errorMessage = '';
  UserRole = UserRole;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private authStore: AuthStore,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      role: [null, Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      // Driver fields
      cin: [''],
      vehicleBrand: [''],
      vehicleModel: [''],
      licensePlate: [''],
      vehicleColor: [''],
      vehicleSeats: [null]
    }, {
      validators: [this.passwordMatchValidator]
    });
  }

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.signupForm.patchValue({ role });
    
    if (role === UserRole.DRIVER) {
      this.signupForm.get('cin')?.setValidators([Validators.required]);
      this.signupForm.get('vehicleBrand')?.setValidators([Validators.required]);
      this.signupForm.get('vehicleModel')?.setValidators([Validators.required]);
      this.signupForm.get('licensePlate')?.setValidators([Validators.required]);
      this.signupForm.get('vehicleColor')?.setValidators([Validators.required]);
      this.signupForm.get('vehicleSeats')?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      this.signupForm.get('cin')?.clearValidators();
      this.signupForm.get('vehicleBrand')?.clearValidators();
      this.signupForm.get('vehicleModel')?.clearValidators();
      this.signupForm.get('licensePlate')?.clearValidators();
      this.signupForm.get('vehicleColor')?.clearValidators();
      this.signupForm.get('vehicleSeats')?.clearValidators();
    }
    
    this.signupForm.updateValueAndValidity();
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.signupForm.valid && this.selectedRole()) {
      this.loading = true;
      this.errorMessage = '';

      const formValue = this.signupForm.value;
      const userData: any = {
        name: formValue.name,
        email: formValue.email,
        phone: formValue.phone,
        password: formValue.password,
        role: formValue.role
      };

      // Add driver-specific data
      if (formValue.role === UserRole.DRIVER) {
        userData.cin = formValue.cin;
        userData.vehicle = {
          brand: formValue.vehicleBrand,
          model: formValue.vehicleModel,
          licensePlate: formValue.licensePlate,
          color: formValue.vehicleColor,
          seats: formValue.vehicleSeats
        };
      }

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.authStore.setAuthenticatedUser(response.user, response.token);

          // Navigate based on role
          if (response.user.role === UserRole.DRIVER) {
            this.router.navigate(['/driver/dashboard']);
          } else if (response.user.role === UserRole.PASSENGER) {
            this.router.navigate(['/passenger/dashboard']);
          } else {
            this.router.navigate(['/']);
          }

          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.message.includes('Email already taken')
              ? 'This email is already registered'
              : error.message || 'Registration failed';
        }
      });
    }
  }


  getRoleButtonClasses(role: UserRole): string {
    const baseClasses = 'p-6 rounded-lg border-2 transition-all duration-200 text-center';
    const isSelected = this.selectedRole() === role;
    
    if (isSelected) {
      return `${baseClasses} border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400`;
    }
    return `${baseClasses} border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-300`;
  }

  getErrorMessage(controlName: string): string {
    const control = this.signupForm.get(controlName);
    if (control?.hasError('required') && control.touched) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    }
    if (control?.hasError('email') && control.touched) {
      return 'Please enter a valid email';
    }
    if (control?.hasError('minlength') && control.touched) {
      return `${controlName} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('pattern') && control.touched) {
      return 'Please enter a valid phone number';
    }
    if (this.signupForm.hasError('passwordMismatch') && controlName === 'confirmPassword') {
      return 'Passwords do not match';
    }
    return '';
  }
}

