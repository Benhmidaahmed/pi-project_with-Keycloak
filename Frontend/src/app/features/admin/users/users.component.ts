import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, DatePipe, CardComponent, ButtonComponent],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header Section with Gradient -->
      <div class="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-900 p-8 shadow-xl">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>

        <div class="relative z-10 flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-white mb-2">Users Management 👥</h1>
            <p class="text-purple-100 text-lg">Manage all users in the system</p>
          </div>
          <div class="text-right">
            <div class="inline-flex items-center justify-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <span class="text-3xl font-bold text-white">{{ users.length }}</span>
              <span class="text-white/80 ml-2">Total Users</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 p-12">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p class="text-gray-600 dark:text-gray-400 mt-4 font-medium">Loading users...</p>
          </div>
        </div>
      }

      <!-- Users List -->
      @if (!loading) {
        <div class="space-y-4">
          @for (user of users; track user.id) {
            <div class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-750 p-6 border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div class="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-pink-50 dark:bg-pink-900/20 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-500"></div>

              <div class="relative z-10">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-4 mb-4">
                      <div class="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                        {{ getInitials(user.name) }}
                      </div>
                      <div>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ user.name }}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</p>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div class="p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700/50">
                        <p class="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wider">Role</p>
                        <span [class]="getRoleClass(user.role)">{{ user.role }}</span>
                      </div>

                      <div class="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700/50">
                        <p class="text-xs text-cyan-600 dark:text-cyan-400 font-medium uppercase tracking-wider">Phone</p>
                        <p class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ user.phone || 'N/A' }}</p>
                      </div>

                      <div class="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700/50">
                        <p class="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wider">Status</p>
                        <span [class]="user.isBanned ? 'text-red-600 font-bold' : 'text-green-600 font-medium'">
                          {{ user.isBanned ? 'Banned' : 'Active' }}
                        </span>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-end mt-4">
                      @if (user.role !== 'ADMIN') {
                        <app-button
                            [variant]="user.isBanned ? 'primary' : 'danger'"
                            size="sm"
                            (onClick)="toggleBan(user)">
                          {{ user.isBanned ? 'Unban User' : 'Ban User' }}
                        </app-button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } @empty {
            <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 p-12 text-center">
              <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-gray-500 dark:text-gray-400 font-medium text-lg">No users found</p>
              <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">There are no users in the system yet</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: []
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  getRoleClass(role: UserRole): string {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
    switch (role) {
      case UserRole.ADMIN:
        return `${baseClasses} bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400`;
      case UserRole.DRIVER:
        return `${baseClasses} bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400`;
      case UserRole.PASSENGER:
        return `${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300`;
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  toggleBan(user: User): void {
    if (!confirm(`Are you sure you want to ${user.isBanned ? 'unban' : 'ban'} ${user.name}?`)) return;

    const action = user.isBanned ? this.authService.unbanUser(user.id) : this.authService.banUser(user.id);

    action.subscribe({
      next: (updatedUser) => {
        this.users = this.users.map(u => u.id === updatedUser.id ? updatedUser : u);
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        alert('Failed to update user status');
      }
    });
  }
}