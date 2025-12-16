import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent, SidebarItem } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <!-- Sidebar -->
      <app-sidebar [title]="'Admin Panel'" [items]="sidebarItems" class="z-20"></app-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 relative overflow-hidden p-8">
        <!-- Decorative Blurred Background Circles -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 dark:from-blue-600/20 dark:to-indigo-800/20 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 dark:from-purple-600/20 dark:to-pink-800/20 rounded-full -ml-48 -mb-48 blur-3xl pointer-events-none"></div>

        <!-- Header Section -->
        <div class="relative z-10 mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome, Admin 👋</h1>
          <p class="text-gray-600 dark:text-gray-400 text-lg">Manage rides, users, reports, and more from your dashboard</p>
        </div>

        <!-- Dynamic Content Area -->
        <div class="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 min-h-[60vh] transition-all duration-300">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  sidebarItems: SidebarItem[] = [
    {
      label: 'Dashboard Overview',
      route: '/admin/dashboard/overview',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      label: 'All Rides',
      route: '/admin/dashboard/rides',
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
    },
    {
      label: 'Users Management',
      route: '/admin/dashboard/users',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
    },
    {
      label: 'Reports Management',
      route: '/admin/dashboard/reports',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
  ];

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Redirect to overview if we are exactly on /admin/dashboard
    if (this.router.url === '/admin/dashboard') {
      this.router.navigate(['/admin/dashboard/overview']);
    }
  }
}