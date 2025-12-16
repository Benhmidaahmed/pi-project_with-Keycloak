import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ReviewService } from '../../core/services/review.service';
import { ReportService } from '../../core/services/report.service';
import { AuthStore } from '../../core/state/auth.store';
import { User } from '../../core/models/user.model';
import { Review } from '../../core/models/review.model';
import { ReportReason } from '../../core/models/report.model';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { GeminiModerationService } from '../../core/services/gemini.service';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        ReactiveFormsModule,
        CardComponent,
        ButtonComponent,
    ],
    template: `
        <div class="container mx-auto px-4 py-8 max-w-4xl">
            <!-- Loading State -->
            @if (loading) {
                <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 p-12">
                    <div class="text-center">
                        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p class="text-gray-600 dark:text-gray-400 mt-4 font-medium">Loading profile...</p>
                    </div>
                </div>
            }

            <!-- User Profile Content -->
            @if (!loading && user) {
                <!-- Header Section with Gradient -->
                <div class="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 dark:from-blue-700 dark:to-indigo-900 p-8 shadow-xl">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>

                    <div class="relative z-10 flex items-center justify-between">
                        <div class="flex items-center gap-6">
                            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                                {{ getInitials(user.name) }}
                            </div>
                            <div>
                                <h1 class="text-4xl font-bold text-white mb-2">{{ user.name }}</h1>
                                <div class="flex items-center gap-4">
                                    <span class="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 3.5C14.8 3.4 14.6 3.3 14.3 3.3C14 3.3 13.8 3.4 13.5 3.5L7 7V9C7 9.6 7.4 10 8 10H9V19C9 19.6 9.4 20 10 20H14C14.6 20 15 19.6 15 19V14H17V19C17 19.6 17.4 20 18 20H20C20.6 20 21 19.6 21 19V10H22C22.6 10 23 9.6 23 9Z"/>
                                        </svg>
                                        {{ getRoleLabel(user.role) }}
                                    </span>
                                    @if (averageRating !== null && averageRating > 0) {
                                        <span class="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 backdrop-blur-sm rounded-full text-yellow-300 text-sm font-medium">
                                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                            </svg>
                                            {{ averageRating.toFixed(1) }} ({{ reviews.length }} reviews)
                                        </span>
                                    }
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-3">
                            @if (canAddReview()) {
                                <app-button
                                        variant="primary"
                                        size="md"
                                        (onClick)="openReviewModal()"
                                        class="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30"
                                >
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    Add Review
                                </app-button>
                            }
                            @if (canReportUser()) {
                                <button
                                        (click)="openReportModal()"
                                        class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-300/30 text-red-100 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Report
                                </button>
                            }
                            <app-button
                                    variant="secondary"
                                    size="md"
                                    (onClick)="goBack()"
                                    class="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20 text-white"
                            >
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </app-button>
                        </div>
                    </div>
                </div>

                <!-- User Details Card -->
                <div class="mb-8 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile Information
                        </h2>
                    </div>

                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700/50">
                                <div class="flex items-center gap-2 mb-2">
                                    <svg class="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <p class="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Email</p>
                                </div>
                                <p class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ user.email }}</p>
                            </div>

                            @if (user.phone) {
                                <div class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700/50">
                                    <div class="flex items-center gap-2 mb-2">
                                        <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <p class="text-xs text-green-600 dark:text-green-400 font-medium">Phone</p>
                                    </div>
                                    <p class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ user.phone }}</p>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                <!-- Reviews Section -->
                <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div class="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-gray-700 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Reviews
                            <span class="ml-auto inline-flex items-center justify-center px-3 py-1 text-sm font-bold text-green-800 dark:text-green-300 bg-green-200 dark:bg-green-900/40 rounded-full">
                                {{ reviews.length }}
                            </span>
                        </h2>
                    </div>

                    <div class="p-6">
                        @if (filteredReviews.length > 0) {
                            <div class="space-y-4">
                                @for (review of filteredReviews; track review.id) {
                                    <div class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-750 p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
                                        <div class="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>

                                        <div class="relative z-10">
                                            <div class="flex items-start justify-between mb-3">
                                                <div>
                                                    <p class="font-bold text-gray-900 dark:text-gray-100 text-lg">{{ getReviewerName(review) }}</p>
                                                    <p class="text-sm text-gray-500 dark:text-gray-400">
                                                        {{ review.createdAt | date:'MMM d, yyyy' }}
                                                    </p>
                                                </div>

                                                <div class="flex items-center space-x-1">
                                                    @for (i of [1,2,3,4,5]; track i) {
                                                        <svg
                                                                class="h-5 w-5"
                                                                [ngClass]="i <= review.rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                                        </svg>
                                                    }
                                                </div>
                                            </div>

                                            @if (review.comment) {
                                                <p class="text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{{ review.comment }}</p>
                                            }
                                        </div>
                                    </div>
                                }
                            </div>
                        } @else {
                            <div class="text-center py-12">
                                <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p class="text-gray-500 dark:text-gray-400 font-medium text-lg">No reviews yet</p>
                                <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Be the first to review this user</p>
                            </div>
                        }
                    </div>
                </div>
            }

            <!-- User Not Found -->
            @if (!loading && !user) {
                <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 p-12">
                    <div class="text-center">
                        <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p class="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">User not found</p>
                        <p class="text-gray-600 dark:text-gray-400 mb-6">The user you're looking for doesn't exist or has been removed.</p>
                        <app-button variant="primary" (onClick)="goBack()">
                            Go Back
                        </app-button>
                    </div>
                </div>
            }

            <!-- REVIEW MODAL -->
            @if (showReviewModal) {
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 relative">
                        <div class="relative z-10">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Review</h3>
                                <button
                                        (click)="closeReviewModal()"
                                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form [formGroup]="reviewForm" (ngSubmit)="submitReview()">
                                <div class="mb-6">
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rating</label>
                                    <div class="flex space-x-2 justify-center">
                                        @for (star of [1,2,3,4,5]; track star) {
                                            <button
                                                    type="button"
                                                    (click)="setRating(star)"
                                                    class="cursor-pointer hover:scale-110 transition-transform duration-200 p-1"
                                            >
                                                <svg
                                                        class="h-10 w-10"
                                                        [ngClass]="star <= currentRating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                                </svg>
                                            </button>
                                        }
                                    </div>
                                    @if (reviewForm.get('rating')?.invalid && reviewForm.get('rating')?.touched) {
                                        <p class="text-red-500 text-sm mt-2 text-center">Please select a rating</p>
                                    }
                                </div>

                                <div class="mb-6">
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment</label>
                                    <textarea
                                            formControlName="comment"
                                            rows="4"
                                            placeholder="Share your experience with this user..."
                                            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all resize-none"
                                    ></textarea>
                                    @if (reviewForm.get('comment')?.invalid && reviewForm.get('comment')?.touched) {
                                        <p class="text-red-500 text-sm mt-1">Please provide a comment (min 10 characters)</p>
                                    }
                                </div>

                                <div class="flex gap-3">
                                    <app-button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            [fullWidth]="true"
                                            [disabled]="reviewForm.invalid || submittingReview"
                                            [loading]="submittingReview"
                                    >
                                        Submit Review
                                    </app-button>

                                    <app-button
                                            type="button"
                                            variant="secondary"
                                            size="lg"
                                            (onClick)="closeReviewModal()"
                                            [fullWidth]="true"
                                    >
                                        Cancel
                                    </app-button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            }

            <!-- REPORT MODAL -->
            @if (showReportDialog()) {
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 relative">
                        <div class="relative z-10">
                            <div class="text-center mb-6">
                                <div class="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                    <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Report User</h3>
                                <p class="text-gray-600 dark:text-gray-400">
                                    Please provide details about why you're reporting {{ user?.name }}
                                </p>
                            </div>

                            <form [formGroup]="reportForm" (ngSubmit)="submitReport()">
                                <!-- Error Message -->
                                @if (errorMessage) {
                                    <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
                                    </div>
                                }

                                <!-- Reason Selection -->
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Reason *
                                    </label>
                                    <select
                                            formControlName="reason"
                                            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                                    >
                                        <option value="">Select a reason</option>
                                        <option value="INAPPROPRIATE_BEHAVIOR">Inappropriate Behavior</option>
                                        <option value="UNSAFE_DRIVING">Unsafe Driving</option>
                                        <option value="HARASSMENT">Harassment</option>
                                        <option value="FRAUD">Fraud</option>
                                        <option value="NO_SHOW">No Show</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                    @if (reportForm.get('reason')?.invalid && reportForm.get('reason')?.touched) {
                                        <p class="text-red-500 text-sm mt-1">Please select a reason</p>
                                    }
                                </div>

                                <!-- Description -->
                                <div class="mb-6">
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                            formControlName="description"
                                            rows="4"
                                            placeholder="Provide detailed information about the issue..."
                                            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all resize-none"
                                    ></textarea>
                                    @if (reportForm.get('description')?.invalid && reportForm.get('description')?.touched) {
                                        <p class="text-red-500 text-sm mt-1">Please provide a description (min 20 characters)</p>
                                    }
                                </div>

                                <div class="flex gap-3">
                                    <app-button
                                            type="button"
                                            variant="secondary"
                                            size="lg"
                                            (onClick)="closeReportModal()"
                                            [disabled]="submittingReport()"
                                            [fullWidth]="true"
                                    >
                                        Cancel
                                    </app-button>

                                    <app-button
                                            type="submit"
                                            variant="danger"
                                            size="lg"
                                            [loading]="submittingReport()"
                                            [disabled]="reportForm.invalid"
                                            [fullWidth]="true"
                                    >
                                        Submit Report
                                    </app-button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            }

            <!-- SUCCESS MESSAGES -->
            @if (showSuccessMessage) {
                <div class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Review added successfully!
                </div>
            }

            @if (showReportSuccess()) {
                <div class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Report submitted successfully!
                </div>
            }
        </div>
    `
})
export class UserProfileComponent implements OnInit {
    user: User | null = null;
    reviews: Review[] = [];
    filteredReviews: Review[] = [];
    averageRating: number | null = null;
    loading = true;

    showReviewModal = false;
    reviewForm: FormGroup;
    submittingReview = false;
    showSuccessMessage = false;
    errorMessage: string | null = null;

    currentRating = 0;

    // Report functionality
    showReportDialog = signal(false);
    reportForm: FormGroup;
    submittingReport = signal(false);
    showReportSuccess = signal(false);
    ReportReason = ReportReason;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private reviewService: ReviewService,
        private reportService: ReportService,
        private authStore: AuthStore,
        private geminiModerationService: GeminiModerationService,
        private fb: FormBuilder
    ) {
        this.reviewForm = this.fb.group({
            rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
            comment: ['', [Validators.required, Validators.minLength(10)]]
        });

        this.reportForm = this.fb.group({
            reason: ['', [Validators.required]],
            description: ['', [Validators.required, Validators.minLength(20)]]
        });
    }

    ngOnInit(): void {
        const userId = this.route.snapshot.paramMap.get('id');
        if (userId) this.loadUserProfile(userId);
        else this.loading = false;
    }

    loadUserProfile(id: string): void {
        this.loading = true;
        this.authService.getUserById(id).subscribe({
            next: user => {
                this.user = user;
                this.loadUserReviews(id);
            },
            error: () => (this.loading = false)
        });
    }

    loadUserReviews(id: string): void {
        this.reviewService.getUserReviews(id).subscribe({
            next: reviews => {
                this.reviews = reviews;
                this.filteredReviews = reviews;
                this.loadReviewerDetails();
                this.loadAverageRating(id);
            },
            error: () => (this.loading = false)
        });
    }

    loadReviewerDetails(): void {
        this.filteredReviews.forEach(review => {
            this.authService.getUserById(review.reviewerId).subscribe({
                next: user => {
                    review.reviewer = user;
                },
                error: () => {
                    console.error(`Failed to load reviewer with ID: ${review.reviewerId}`);
                }
            });
        });
    }

    loadAverageRating(id: string): void {
        this.reviewService.getAverageRating(id).subscribe({
            next: rating => {
                this.averageRating = rating;
                this.loading = false;
            },
            error: () => {
                this.averageRating = 0;
                this.loading = false;
            }
        });
    }

    openReviewModal(): void {
        this.showReviewModal = true;
        this.currentRating = 0;
        this.reviewForm.reset({ rating: 0, comment: '' });
    }

    closeReviewModal(): void {
        this.showReviewModal = false;
        this.currentRating = 0;
        this.reviewForm.reset();
    }

    setRating(rating: number): void {
        this.currentRating = rating;
        this.reviewForm.patchValue({ rating });
    }

    submitReview(): void {
        if (this.reviewForm.invalid || !this.user) return;

        const currentUser = this.authStore.currentUser();
        if (!currentUser) return;

        const reviewData = {
            reviewerId: currentUser.id,
            reviewedId: this.user.id,
            rating: this.reviewForm.value.rating,
            comment: this.reviewForm.value.comment,
            type: currentUser.role === 'DRIVER' ? 'DRIVER' : 'PASSENGER'
        };

        this.submittingReview = true;

        this.reviewService.createReview(reviewData).subscribe({
            next: () => {
                this.submittingReview = false;
                this.closeReviewModal();
                this.showSuccessMessage = true;
                this.loadUserReviews(this.user!.id);
                setTimeout(() => (this.showSuccessMessage = false), 3000);
            },
            error: () => {
                this.submittingReview = false;
            }
        });
    }

    openReportModal(): void {
        this.showReportDialog.set(true);
        this.reportForm.reset();
        this.errorMessage = null;
    }

    closeReportModal(): void {
        this.showReportDialog.set(false);
        this.reportForm.reset();
        this.errorMessage = null;
    }

    async submitReport(): Promise<void> {
        if (this.reportForm.invalid || !this.user) return;
        const description = this.reportForm.value.description;

        // 1. check with Gemini
        let safe: boolean;
        try {
            safe = await this.geminiModerationService.checkTextSafety(description);
        } catch (err) {
            console.error('Moderation failed', err);
            this.errorMessage = 'Unable to verify report content. Please try later.';
            return;
        }

        if (!safe) {
            this.errorMessage = 'Your report contains disallowed language — please remove offensive content and try again.';
            return;
        }

        // 2. proceed with report if safe
        const currentUser = this.authStore.currentUser();
        if (!currentUser) return;

        const reportData = {
            reporterId: currentUser.id,
            reportedUserId: this.user.id,
            reason: this.reportForm.value.reason,
            description,
        };

        this.submittingReport.set(true);
        this.errorMessage = null;

        this.reportService.createReport(reportData).subscribe({
            next: () => {
                this.submittingReport.set(false);
                this.closeReportModal();
                this.showReportSuccess.set(true);
                setTimeout(() => this.showReportSuccess.set(false), 3000);
            },
            error: (error) => {
                console.error('Failed to submit report:', error);
                this.submittingReport.set(false);
                this.errorMessage = error.message || 'Failed to submit report. Please try again.';
            }
        });
    }


    getReviewerName(review: Review): string {
        return review.reviewer?.name || review.reviewer?.email || `User ${review.reviewerId}`;
    }

    getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    getRoleLabel(role: string): string {
        return role === 'DRIVER' ? 'Driver'
            : role === 'PASSENGER' ? 'Passenger'
                : role === 'ADMIN' ? 'Administrator'
                    : role;
    }

    canAddReview(): boolean {
        const cur = this.authStore.currentUser();
        return !!cur && this.user?.id !== cur.id;
    }

    canReportUser(): boolean {
        const cur = this.authStore.currentUser();
        return !!cur && this.user?.id !== cur.id;
    }

    goBack(): void {
        window.history.back();
    }
}