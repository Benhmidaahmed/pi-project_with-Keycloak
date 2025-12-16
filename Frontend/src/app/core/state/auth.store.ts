import { Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  // ============================================================================
  // Private Signals
  // ============================================================================
  private readonly currentUserSignal = signal<User | null>(null);
  private readonly tokenSignal = signal<string | null>(null);
  private readonly initializedSignal = signal(false); // <-- NEW

  // ============================================================================
  // Public Computed Signals
  // ============================================================================
  public readonly currentUser = computed(() => this.currentUserSignal());
  public readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  public readonly isAdmin = computed(() => this.currentUserSignal()?.role === UserRole.ADMIN);
  public readonly isDriver = computed(() => this.currentUserSignal()?.role === UserRole.DRIVER);
  public readonly isPassenger = computed(() => this.currentUserSignal()?.role === UserRole.PASSENGER);
  public readonly token = computed(() => this.tokenSignal());
  public readonly initialized = computed(() => this.initializedSignal()); // <-- NEW

  // ============================================================================
  // Constructor
  // ============================================================================
  constructor(private router: Router) {
    this.initializeFromStorage();

    effect(() => {
      const user = this.currentUserSignal();
      const token = this.tokenSignal();
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (token) localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    });
  }

  // ============================================================================
  // State Update Methods
  // ============================================================================
  setAuthenticatedUser(user: User, token: string): void {
    this.currentUserSignal.set(user);
    this.tokenSignal.set(token);
  }

  updateUserRole(role: UserRole): void {
    const user = this.currentUserSignal();
    if (user) this.currentUserSignal.set({ ...user, role });
  }

  updateUser(user: User): void {
    this.currentUserSignal.set(user);
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  // ============================================================================
  // Utilities
  // ============================================================================
  private initializeFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');

    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        if (user.createdAt) user.createdAt = new Date(user.createdAt);
        this.currentUserSignal.set(user);
        if (storedToken) this.tokenSignal.set(storedToken);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }

    this.initializedSignal.set(true);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }
}
