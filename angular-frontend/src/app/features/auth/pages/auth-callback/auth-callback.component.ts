import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-deep-void flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="w-16 h-16 mx-auto">
          <svg class="animate-spin w-full h-full text-neon-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 class="font-rajdhani text-2xl font-bold text-white">Authenticating...</h2>
        <p class="font-outfit text-neutral-400">Please wait while we verify your account</p>
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  private hasProcessed = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Prevent double processing
    if (this.hasProcessed) return;
    this.hasProcessed = true;

    this.processCallback();
  }

  private processCallback(): void {
    // Extract session_id from URL fragment
    const hash = window.location.hash;
    const sessionIdMatch = hash.match(/session_id=([^&]+)/);

    if (!sessionIdMatch) {
      this.toastService.error('Invalid authentication callback');
      this.router.navigate(['/login']);
      return;
    }

    const sessionId = sessionIdMatch[1];

    // Process the session
    this.authService.processGoogleSession(sessionId).subscribe({
      next: (response) => {
        this.toastService.success('Welcome back!');
        // Clear the hash and navigate
        window.history.replaceState({}, document.title, window.location.pathname);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Google auth error:', error);
        this.toastService.error('Authentication failed. Please try again.');
        this.router.navigate(['/login']);
      }
    });
  }
}
