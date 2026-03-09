import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthLayoutComponent } from '../../../../shared/components/auth-layout/auth-layout.component';
import { CyberInputComponent } from '../../../../shared/components/cyber-input/cyber-input.component';
import { CyberButtonComponent } from '../../../../shared/components/cyber-button/cyber-button.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    AuthLayoutComponent,
    CyberInputComponent,
    CyberButtonComponent
  ],
  template: `
    <app-auth-layout [heroImage]="'https://images.unsplash.com/photo-1762278804729-13d330fad71a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwYWJzdHJhY3QlMjBuZW9uJTIwYmFja2dyb3VuZCUyMGRhcmslMjAzZHxlbnwwfHx8fDE3NzMwNTUxMTN8MA&ixlib=rb-4.1.0&q=85'">
      <div class="space-y-8">
        <!-- Back link -->
        <a 
          routerLink="/login"
          class="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          data-testid="back-to-login-link"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to login
        </a>

        <!-- Header -->
        <div class="space-y-2">
          <h2 class="font-rajdhani text-4xl md:text-5xl font-bold tracking-tight uppercase text-white">
            Reset <span class="text-neon-cyan">Password</span>
          </h2>
          <p class="font-outfit text-neutral-400 text-lg">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <!-- Success state -->
        <div *ngIf="emailSent" class="space-y-6">
          <div class="glass-card text-center space-y-4">
            <div class="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <svg class="w-8 h-8 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div>
              <h3 class="font-rajdhani text-xl font-semibold text-white">Check your email</h3>
              <p class="text-neutral-400 mt-2">
                If an account exists for <span class="text-neon-cyan">{{ submittedEmail }}</span>, you will receive a password reset link.
              </p>
            </div>
            
            <!-- Demo token display (remove in production) -->
            <div *ngIf="demoToken" class="mt-4 p-4 bg-neutral-800/50 rounded-lg border border-yellow-500/30">
              <p class="text-yellow-400 text-sm mb-2">Demo Mode (Email not configured)</p>
              <p class="text-xs text-neutral-400 break-all">Reset Token: {{ demoToken }}</p>
              <app-cyber-button
                variant="secondary"
                [fullWidth]="true"
                testId="use-demo-token-btn"
                (onClick)="useToken()"
                class="mt-3"
              >
                Use Token to Reset
              </app-cyber-button>
            </div>
          </div>
          
          <app-cyber-button
            variant="secondary"
            [fullWidth]="true"
            testId="resend-email-btn"
            (onClick)="resetForm()"
          >
            Send another link
          </app-cyber-button>
        </div>

        <!-- Form -->
        <form *ngIf="!emailSent" [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <app-cyber-input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            formControlName="email"
            testId="forgot-email-input"
            [error]="getError('email')"
          ></app-cyber-input>

          <app-cyber-button
            type="submit"
            variant="primary"
            [fullWidth]="true"
            [loading]="isLoading"
            [disabled]="forgotForm.invalid"
            testId="forgot-submit-btn"
          >
            Send Reset Link
          </app-cyber-button>
        </form>
      </div>
    </app-auth-layout>
  `
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  emailSent = false;
  submittedEmail = '';
  demoToken = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  getError(field: string): string {
    const control = this.forgotForm.get(field);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Email is required';
      if (control.errors['email']) return 'Please enter a valid email';
    }
    return '';
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    this.submittedEmail = this.forgotForm.value.email;
    
    this.authService.forgotPassword(this.submittedEmail).subscribe({
      next: (response) => {
        this.emailSent = true;
        this.demoToken = response.demo_reset_token || '';
        this.toastService.success('Reset link sent!');
      },
      error: (error) => {
        this.isLoading = false;
        const message = error.error?.message || 'Failed to send reset link. Please try again.';
        this.toastService.error(message);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.emailSent = false;
    this.demoToken = '';
    this.forgotForm.reset();
  }

  useToken(): void {
    if (this.demoToken) {
      this.router.navigate(['/reset-password'], { queryParams: { token: this.demoToken } });
    }
  }
}
