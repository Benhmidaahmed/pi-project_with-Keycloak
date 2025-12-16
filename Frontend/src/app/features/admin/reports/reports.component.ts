import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReportService } from '../../../core/services/report.service';
import { AuthService } from '../../../core/services/auth.service';
import { Report, ReportStatus } from '../../../core/models/report.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface ReportWithNames extends Report {
  reporterName?: string;
  reportedUserName?: string;
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, DatePipe, CardComponent, ButtonComponent],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header Section with Gradient -->
      <div class="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-600 to-orange-600 dark:from-yellow-700 dark:to-orange-900 p-8 shadow-xl">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>

        <div class="relative z-10 flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-white mb-2">Reports Management 📝</h1>
            <p class="text-yellow-100 text-lg">View and manage all user reports</p>
          </div>
          <div class="text-right">
            <div class="inline-flex items-center justify-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <span class="text-3xl font-bold text-white">{{ reports.length }}</span>
              <span class="text-white/80 ml-2">Total Reports</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 p-12">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
            <p class="text-gray-600 dark:text-gray-400 mt-4 font-medium">Loading reports...</p>
          </div>
        </div>
      }

      <!-- Reports List -->
      @if (!loading) {
        <div class="space-y-4">
          @for (report of reports; track report.id) {
            <div class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-750 p-6 border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div class="absolute top-0 right-0 w-32 h-32 bg-yellow-50 dark:bg-yellow-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-500"></div>

              <div class="relative z-10">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-3">
                      <div>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Report #{{ report.id }}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Reported by: {{ report.reporterName || 'Unknown' }}</p>
                      </div>
                      <span [class]="getStatusClass(report.status)">{{ report.status }}</span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div class="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700/50">
                        <p class="text-xs text-yellow-600 dark:text-yellow-400 font-medium uppercase tracking-wider">Reported User</p>
                        <p class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ report.reportedUserName || 'Unknown' }}</p>
                      </div>

                      <div class="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p class="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">Reason</p>
                        <p class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ report.reason }}</p>
                      </div>
                    </div>

                    <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                      <p class="text-gray-900 dark:text-gray-100 text-sm">{{ report.description }}</p>
                    </div>

                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Created: {{ report.createdAt | date:'short' }}</p>
                  </div>

                  <!-- Actions for Pending Reports -->
                  @if (report.status === ReportStatus.PENDING) {
                    <div class="ml-4 flex flex-col space-y-2">
                      <app-button
                          variant="primary"
                          size="sm"
                          (onClick)="updateStatus(report.id, ReportStatus.RESOLVED)">Resolve</app-button>
                      <app-button
                          variant="secondary"
                          size="sm"
                          (onClick)="updateStatus(report.id, ReportStatus.DISMISSED)">Dismiss</app-button>
                    </div>
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 p-12 text-center">
              <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-gray-500 dark:text-gray-400 font-medium text-lg">No reports found</p>
              <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">There are no reports in the system yet</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: []
})
export class AdminReportsComponent implements OnInit {
  reports: ReportWithNames[] = [];
  loading = false;
  ReportStatus = ReportStatus;

  constructor(
      private reportService: ReportService,
      private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.reportService.getAllReports().subscribe({
      next: (reports) => {
        this.reports = reports;

        console.log('All reports:', reports);
        console.log('First report:', reports[0]);

        // Fetch names for reporter and reported user
        this.reports.forEach((report, index) => {
          console.log(`Report ${index}:`, report);
          console.log(`Reporter:`, report.reporter);
          console.log(`Reported User:`, report.reportedUser);

          // Get reporter name
          let reporterId = report.reporter?.id || (report as any).reporterId || (report.reporter as any);
          console.log(`Reporter ID:`, reporterId);

          if (reporterId) {
            this.authService.getUserById(reporterId).subscribe({
              next: (user) => {
                console.log(`Got reporter for ${reporterId}:`, user);
                report.reporterName = user.name;
              },
              error: (error) => {
                console.error(`Error fetching reporter ${reporterId}:`, error);
                report.reporterName = 'Unknown';
              }
            });
          } else {
            report.reporterName = 'Unknown';
          }

          // Get reported user name
          let reportedUserId = report.reportedUser?.id || (report as any).reportedUserId || (report.reportedUser as any);
          console.log(`Reported User ID:`, reportedUserId);

          if (reportedUserId) {
            this.authService.getUserById(reportedUserId).subscribe({
              next: (user) => {
                console.log(`Got reported user for ${reportedUserId}:`, user);
                report.reportedUserName = user.name;
              },
              error: (error) => {
                console.error(`Error fetching reported user ${reportedUserId}:`, error);
                report.reportedUserName = 'Unknown';
              }
            });
          } else {
            report.reportedUserName = 'Unknown';
          }
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.loading = false;
      }
    });
  }

  updateStatus(reportId: string, status: ReportStatus): void {
    this.reportService.updateReportStatus(reportId, status).subscribe({
      next: () => this.loadReports(),
      error: (error) => {
        console.error('Error updating report status:', error);
      }
    });
  }

  getStatusClass(status: ReportStatus): string {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
    switch (status) {
      case ReportStatus.PENDING:
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400`;
      case ReportStatus.RESOLVED:
        return `${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400`;
      case ReportStatus.DISMISSED:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300`;
    }
  }
}