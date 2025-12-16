import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../../core/state/auth.store';
import { AuthService } from '../../../core/services/auth.service';
import { CardComponent } from '../card/card.component';
import { ButtonComponent } from '../button/button.component';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-profile-settings',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CardComponent,
        ButtonComponent
    ],
    template: `
        <div class="container mx-auto px-4 py-8 max-w-4xl">
            <!-- Header Section with Gradient -->
            <div class="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-800 dark:from-purple-700 dark:to-pink-900 p-8 shadow-xl">
                <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>

                <div class="relative z-10">
                    <h1 class="text-4xl font-bold text-white mb-2">
                        My Profile ⚙️
                    </h1>
                    <p class="text-purple-100 text-lg">
                        Manage your account settings and preferences
                    </p>
                </div>
            </div>

            <!-- Profile Info Card -->
            <div class="mb-6" *ngIf="currentUser">
                <div class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-750 p-8 border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-2xl transition-all duration-300">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div class="absolute bottom-0 left-0 w-24 h-24 bg-pink-50 dark:bg-pink-900/20 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-500"></div>

                    <div class="relative z-10 flex items-center space-x-6">
                        <div class="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            {{ getInitials() }}
                        </div>
                        <div class="flex-1">
                            <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                {{ currentUser.name }}
                            </h2>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-bold">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {{ getRoleLabel(currentUser.role) }}
                                </span>
                            </div>
                            <p class="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {{ currentUser.email }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Update Email Card -->
            <div class="mb-6" *ngIf="currentUser">
                <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div class="bg-gradient-to-r from-blue-50 to-cyan-100 dark:from-gray-700 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Update Email
                        </h2>
                    </div>

                    <div class="p-6">
                        <form [formGroup]="emailForm" (ngSubmit)="updateEmail()">
                            <div *ngIf="emailError()" class="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                                <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p class="text-sm text-red-600 dark:text-red-400 font-medium">{{ emailError() }}</p>
                            </div>

                            <div *ngIf="emailSuccess()" class="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                                <svg class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p class="text-sm text-green-600 dark:text-green-400 font-medium">Email updated successfully!</p>
                            </div>

                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Current Email
                                    </label>
                                    <div class="relative">
                                        <input
                                                type="text"
                                                [value]="currentUser.email"
                                                disabled
                                                class="w-full px-4 py-2.5 pl-11 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400"
                                        />
                                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        New Email *
                                    </label>
                                    <div class="relative">
                                        <input
                                                type="email"
                                                formControlName="newEmail"
                                                placeholder="Enter new email address"
                                                class="w-full px-4 py-2.5 pl-11 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                                        />
                                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p *ngIf="emailForm.get('newEmail')?.invalid && emailForm.get('newEmail')?.touched" class="text-red-500 text-sm mt-2 flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Valid email required
                                    </p>
                                </div>

                                <div class="mt-6">
                                    <app-button
                                            type="submit"
                                            variant="primary"
                                            size="md"
                                            [disabled]="emailForm.invalid"
                                            [loading]="updatingEmail()"
                                            class="shadow-lg hover:shadow-xl transition-shadow"
                                    >
                                        <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Update Email
                                    </app-button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Update Password Card -->
            <div class="mb-6" *ngIf="currentUser">
                <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div class="bg-gradient-to-r from-orange-50 to-amber-100 dark:from-gray-700 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Update Password
                        </h2>
                    </div>

                    <div class="p-6">
                        <form [formGroup]="passwordForm" (ngSubmit)="updatePassword()">
                            <div *ngIf="passwordError()" class="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                                <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p class="text-sm text-red-600 dark:text-red-400 font-medium">{{ passwordError() }}</p>
                            </div>

                            <div *ngIf="passwordSuccess()" class="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                                <svg class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p class="text-sm text-green-600 dark:text-green-400 font-medium">Password updated successfully!</p>
                            </div>

                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        New Password *
                                    </label>
                                    <div class="relative">
                                        <input
                                                type="password"
                                                formControlName="newPassword"
                                                placeholder="Enter new password (min 6 characters)"
                                                class="w-full px-4 py-2.5 pl-11 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                                        />
                                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <p *ngIf="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched" class="text-red-500 text-sm mt-2 flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Password must be at least 6 characters
                                    </p>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Confirm Password *
                                    </label>
                                    <div class="relative">
                                        <input
                                                type="password"
                                                formControlName="confirmPassword"
                                                placeholder="Confirm your new password"
                                                class="w-full px-4 py-2.5 pl-11 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                                        />
                                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p *ngIf="passwordForm.hasError('mismatch') && passwordForm.get('confirmPassword')?.touched" class="text-red-500 text-sm mt-2 flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Passwords don't match
                                    </p>
                                </div>

                                <div class="mt-6">
                                    <app-button
                                            type="submit"
                                            variant="primary"
                                            size="md"
                                            [disabled]="passwordForm.invalid"
                                            [loading]="updatingPassword()"
                                            class="shadow-lg hover:shadow-xl transition-shadow"
                                    >
                                        <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Update Password
                                    </app-button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Account Information Card -->
            <div class="mb-6" *ngIf="currentUser">
                <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div class="bg-gradient-to-r from-indigo-50 to-purple-100 dark:from-gray-700 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Account Information
                        </h2>
                    </div>

                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- User ID -->
                            <div class="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50">
                                <div class="flex items-center gap-2 mb-2">
                                    <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <p class="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">User ID</p>
                                </div>
                                <p class="font-bold text-gray-900 dark:text-gray-100 text-sm break-all">{{ currentUser.id }}</p>
                            </div>

                            <!-- Account Type -->
                            <div class="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700/50">
                                <div class="flex items-center gap-2 mb-2">
                                    <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <p class="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wider">Account Type</p>
                                </div>
                                <p class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ getRoleLabel(currentUser.role) }}</p>
                            </div>

                            <!-- Phone -->
                            <div *ngIf="currentUser.phone" class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700/50">
                                <div class="flex items-center gap-2 mb-2">
                                    <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <p class="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wider">Phone</p>
                                </div>
                                <p class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ currentUser.phone }}</p>
                            </div>

                            <!-- Gender -->
                            <div *ngIf="currentUser.gender" class="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-700/50">
                                <div class="flex items-center gap-2 mb-2">
                                    <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <p class="text-xs text-orange-600 dark:text-orange-400 font-medium uppercase tracking-wider">Gender</p>
                                </div>
                                <p class="font-bold text-gray-900 dark:text-gray-100 text-sm capitalize">{{ currentUser.gender }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: []
})
export class ProfileSettingsComponent implements OnInit {
    currentUser: User | null = null;

    emailForm: FormGroup;
    passwordForm: FormGroup;

    updatingEmail = signal(false);
    updatingPassword = signal(false);

    emailError = signal<string | null>(null);
    passwordError = signal<string | null>(null);

    emailSuccess = signal(false);
    passwordSuccess = signal(false);

    constructor(
        public authStore: AuthStore,
        private authService: AuthService,
        private fb: FormBuilder,
        private router: Router
    ) {
        this.emailForm = this.fb.group({
            newEmail: ['', [Validators.required, Validators.email]]
        });

        this.passwordForm = this.fb.group({
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        // Get user from authStore or localStorage
        const storeUser = this.authStore.currentUser();
        const storedUser = localStorage.getItem('currentUser');

        if (storeUser) {
            this.currentUser = storeUser;
        } else if (storedUser) {
            try {
                this.currentUser = JSON.parse(storedUser);
            } catch (e) {
                console.error('Failed to parse stored user', e);
                this.router.navigate(['/login']);
            }
        } else {
            // No user found, redirect to login
            this.router.navigate(['/login']);
        }
    }

    passwordMatchValidator(group: FormGroup) {
        const newPass = group.get('newPassword')?.value;
        const confirmPass = group.get('confirmPassword')?.value;
        return newPass === confirmPass ? null : { mismatch: true };
    }

    updateEmail(): void {
        if (this.emailForm.invalid || !this.currentUser?.id) {
            console.error('Form invalid or no user ID', {
                formValid: this.emailForm.valid,
                userId: this.currentUser?.id,
                currentUser: this.currentUser
            });
            return;
        }

        this.updatingEmail.set(true);
        this.emailError.set(null);
        this.emailSuccess.set(false);

        const { newEmail } = this.emailForm.value;

        console.log('Updating email for user:', this.currentUser.id, 'to:', newEmail);

        this.authService.updateEmail(this.currentUser.id, newEmail).subscribe({
            next: (updatedUser) => {
                this.updatingEmail.set(false);
                this.emailSuccess.set(true);
                this.currentUser = updatedUser;

                // Update localStorage
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));

                this.emailForm.reset();

                // Hide success message after 3 seconds
                setTimeout(() => this.emailSuccess.set(false), 3000);
            },
            error: (err) => {
                this.updatingEmail.set(false);
                this.emailError.set(err.message || 'Failed to update email');

                // Hide error message after 5 seconds
                setTimeout(() => this.emailError.set(null), 5000);
            }
        });
    }

    updatePassword(): void {
        if (this.passwordForm.invalid || !this.currentUser?.id) {
            console.error('Form invalid or no user ID', {
                formValid: this.passwordForm.valid,
                userId: this.currentUser?.id,
                currentUser: this.currentUser
            });
            return;
        }

        this.updatingPassword.set(true);
        this.passwordError.set(null);
        this.passwordSuccess.set(false);

        const { newPassword } = this.passwordForm.value;

        console.log('Updating password for user:', this.currentUser.id);

        this.authService.updatePassword(this.currentUser.id, newPassword).subscribe({
            next: () => {
                this.updatingPassword.set(false);
                this.passwordSuccess.set(true);
                this.passwordForm.reset();

                // Hide success message after 3 seconds
                setTimeout(() => this.passwordSuccess.set(false), 3000);
            },
            error: (err) => {
                this.updatingPassword.set(false);
                this.passwordError.set(err.message || 'Failed to update password');

                // Hide error message after 5 seconds
                setTimeout(() => this.passwordError.set(null), 5000);
            }
        });
    }

    getInitials(): string {
        if (!this.currentUser?.name) return 'U';

        return this.currentUser.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    getRoleLabel(role?: string): string {
        if (!role) return 'User';

        switch (role) {
            case 'DRIVER':
                return 'Driver';
            case 'PASSENGER':
                return 'Passenger';
            case 'ADMIN':
                return 'Administrator';
            default:
                return 'User';
        }
    }
}