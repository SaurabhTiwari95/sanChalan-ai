import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CyberButtonComponent } from '../../../../shared/components/cyber-button/cyber-button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CyberButtonComponent],
  template: `
    <div class="min-h-screen bg-deep-void" data-testid="dashboard-page">
      <div class="noise-overlay"></div>

      <header class="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3">
              <h1 class="font-rajdhani text-2xl font-bold tracking-tight uppercase">
                <span class="text-neon-cyan">Auth</span><span class="text-white">Forge</span>
              </h1>
            </div>

            <div class="flex items-center gap-4">
              <div class="flex items-center gap-3">
                @if (user?.picture) {
                  <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-neon-cyan/30">
                    <img [src]="user!.picture" [alt]="user!.name" class="w-full h-full object-cover" />
                  </div>
                } @else {
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-electric-violet flex items-center justify-center">
                    <span class="font-rajdhani font-bold text-black">{{ getInitials() }}</span>
                  </div>
                }
                <div class="hidden sm:block">
                  <p class="font-outfit text-sm text-white">{{ user?.name }}</p>
                  <p class="font-outfit text-xs text-neutral-400">{{ user?.email }}</p>
                </div>
              </div>

              <app-cyber-button
                variant="secondary"
                testId="logout-btn"
                [loading]="isLoggingOut"
                (onClick)="logout()">
                <span class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span class="hidden sm:inline">Logout</span>
                </span>
              </app-cyber-button>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="mb-12">
          <h2 class="font-rajdhani text-4xl md:text-5xl font-bold tracking-tight uppercase text-white mb-2">
            Welcome, <span class="text-neon-cyan">{{ getFirstName() }}</span>
          </h2>
          <p class="font-outfit text-lg text-neutral-400">
            You're successfully authenticated. Your session is secure.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div class="glass-card group hover:border-neon-cyan/30 transition-all duration-300">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-neon-cyan/10 flex items-center justify-center group-hover:bg-neon-cyan/20 transition-colors">
                <svg class="w-6 h-6 text-neon-cyan" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <p class="font-outfit text-sm text-neutral-400 uppercase tracking-wider">Security Status</p>
                <p class="font-rajdhani text-xl font-bold text-green-400">Protected</p>
              </div>
            </div>
          </div>

          <div class="glass-card group hover:border-electric-violet/30 transition-all duration-300">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-electric-violet/10 flex items-center justify-center group-hover:bg-electric-violet/20 transition-colors">
                <svg class="w-6 h-6 text-electric-violet" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <p class="font-outfit text-sm text-neutral-400 uppercase tracking-wider">Auth Provider</p>
                <p class="font-rajdhani text-xl font-bold text-white capitalize">{{ user?.auth_provider || 'Local' }}</p>
              </div>
            </div>
          </div>

          <div class="glass-card group hover:border-neon-cyan/30 transition-all duration-300">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-neon-cyan/10 flex items-center justify-center group-hover:bg-neon-cyan/20 transition-colors">
                <svg class="w-6 h-6 text-neon-cyan" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div>
                <p class="font-outfit text-sm text-neutral-400 uppercase tracking-wider">Member Since</p>
                <p class="font-rajdhani text-xl font-bold text-white">{{ formatDate(user?.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="glass-card">
          <h3 class="font-rajdhani text-2xl font-bold text-white mb-6 uppercase tracking-wider">Account Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1">
              <p class="font-outfit text-sm text-neutral-400 uppercase tracking-wider">User ID</p>
              <p class="font-mono text-neon-cyan break-all">{{ user?.user_id }}</p>
            </div>
            <div class="space-y-1">
              <p class="font-outfit text-sm text-neutral-400 uppercase tracking-wider">Full Name</p>
              <p class="font-outfit text-white text-lg">{{ user?.name }}</p>
            </div>
            <div class="space-y-1">
              <p class="font-outfit text-sm text-neutral-400 uppercase tracking-wider">Email Address</p>
              <p class="font-outfit text-white text-lg">{{ user?.email }}</p>
            </div>
            <div class="space-y-1">
              <p class="font-outfit text-sm text-neutral-400 uppercase tracking-wider">Last Updated</p>
              <p class="font-outfit text-white text-lg">{{ formatDate(user?.updated_at) }}</p>
            </div>
          </div>
        </div>
      </main>

      <footer class="border-t border-white/10 bg-black/20 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p class="text-center font-outfit text-sm text-neutral-500">
            AuthForge — Built with Angular 18 + Node.js
          </p>
        </div>
      </footer>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  user: User | null = null;
  isLoggingOut = false;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  getInitials(): string {
    if (!this.user?.name) return '?';
    return this.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getFirstName(): string {
    if (!this.user?.name) return 'User';
    const parts = this.user.name.split(' ');
    return parts[0] || 'User';
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  logout(): void {
    this.isLoggingOut = true;
    this.authService.logout().subscribe({
      next: () => {
        this.toastService.success('Logged out successfully');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isLoggingOut = false;
        this.toastService.error('Failed to logout');
      },
      complete: () => {
        this.isLoggingOut = false;
      }
    });
  }
}
