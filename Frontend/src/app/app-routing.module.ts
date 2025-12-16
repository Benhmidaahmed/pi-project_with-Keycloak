import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';
import {AdminDashboardComponent} from "./features/admin/dashboard/admin-dashboard.component";

/**
 * Application routing configuration
 * Defines all routes with guards and lazy loading where applicable
 */
export const routes: Routes = [
  // Redirect root to login
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  // Auth routes (public)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        canActivate: [noAuthGuard]
      },
      {
        path: 'signup',
        loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent),
        canActivate: [noAuthGuard]
      },
      {
        path: 'role-selection',
        loadComponent: () => import('./features/auth/role-selection/role-selection.component').then(m => m.RoleSelectionComponent),
        canActivate: [authGuard]
      },
      {
        path: 'forgot-password',
        redirectTo: '/auth/login' // Placeholder
      }
    ]
  },

  // Passenger routes
  {
    path: 'passenger',
    canActivate: [authGuard, roleGuard([UserRole.PASSENGER])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/passenger/dashboard/passenger-dashboard.component').then(m => m.PassengerDashboardComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/passenger/bookings/bookings.component').then(m => m.PassengerBookingsComponent)
      },
      {
        path: 'book-ride/:id',
        loadComponent: () => import('./features/passenger/book-ride/book-ride.component').then(m => m.BookRideComponent)
      }
    ]
  },

  // Driver routes
  {
    path: 'driver',
    canActivate: [authGuard, roleGuard([UserRole.DRIVER])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/driver/dashboard/driver-dashboard.component').then(m => m.DriverDashboardComponent)
      },
      {
        path: 'publish-ride',
        loadComponent: () => import('./features/driver/publish-ride/publish-ride.component').then(m => m.PublishRideComponent)
      },
      {
        path: 'rides',
        loadComponent: () => import('./features/driver/rides/rides.component').then(m => m.DriverRidesComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/driver/bookings/bookings.component').then(m => m.DriverBookingsComponent)
      }
    ]
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        children: [
          {
            path: 'overview',
            loadComponent: () => import('./features/admin/overview/overview.component').then(m => m.AdminOverviewComponent)
          },
          {
            path: 'rides',
            loadComponent: () => import('./features/admin/rides/rides.component').then(m => m.AdminRidesComponent)
          },
          {
            path: 'users',
            loadComponent: () => import('./features/admin/users/users.component').then(m => m.AdminUsersComponent)
          },
          {
            path: 'reports',
            loadComponent: () => import('./features/admin/reports/reports.component').then(m => m.AdminReportsComponent)
          },
          {
            path: 'ban-users',
            loadComponent: () => import('./features/admin/ban-users/ban-users.component').then(m => m.AdminBanUsersComponent)
          },
          {
            path: '',
            redirectTo: 'overview',
            pathMatch: 'full'
          }
        ]
      }
    ]
  },

  // Shared feature routes
  {
    path: 'reviews',
    canActivate: [authGuard],
    children: [
      {
        path: 'create/:rideId/:reviewedId',
        loadComponent: () => import('./features/reviews/create-review/create-review.component').then(m => m.CreateReviewComponent)
      }
    ]
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    children: [
      {
        path: 'create',
        loadComponent: () => import('./features/reports/create-report/create-report.component').then(m => m.CreateReportComponent)
      }
    ]
  },

  // IMPORTANT: Specific routes MUST come before parameterized routes
  // User Profile Settings route (MOVED BEFORE :id route)
  {
    path: 'profile/settings',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/settings/profile.component').then(m => m.ProfileSettingsComponent)
  },

  // User Profile (view) route with dynamic ID
  {
    path: 'profile/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/driver/profile.component').then(m => m.UserProfileComponent)
  },

  // 404 redirect
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];