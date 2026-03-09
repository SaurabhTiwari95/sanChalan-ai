import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthLayoutComponent } from '../../../../shared/components/auth-layout/auth-layout.component';
import { CyberInputComponent } from '../../../../shared/components/cyber-input/cyber-input.component';
import { CyberButtonComponent } from '../../../../shared/components/cyber-button/cyber-button.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
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
        <!-- Header -->
        <div class="space-y-2">
          <h2 class="font-rajdhani text-4xl md:text-5xl font-bold tracking-tight uppercase text-white">
            New <span class="text-electric-violet">Password</span>
          </h2>
          <p class="font-outfit text-neutral-400 text-lg">
            Create a strong password for your account
          </p>
        </div>

        <!-- No token warning -->
        <div *ngIf="!token" class="glass-card text-center space-y-4">
          <div class="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div>
            <h3 class="font-rajdhani text-xl font-semibold text-white">Invalid Reset Link</h3>
            <p class="text-neutral-400 mt-2">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>
          <app-cyber-button
            variant="primary"
            [fullWidth]="true"
            testId="request-new-link-btn"
            (onClick)="goToForgotPassword()"
          >
            Request New Link
          </app-cyber-button>
        </div>

        <!-- Success state -->
        <div *ngIf="resetSuccess" class="glass-card text-center space-y-4">
          <div class="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div>
            <h3 class="font-rajdhani text-xl font-semibold text-white">Password Reset!</h3>
            <p class="text-neutral-400 mt-2">
              Your password has been successfully reset. You can now login with your new password.
            </p>
          </div>
          <app-cyber-button
            variant="primary"
            [fullWidth]="true"
            testId="go-to-login-btn"
            (onClick)="goToLogin()"
          >
            Go to Login
          </app-cyber-button>
        </div>

        <!-- Form -->
        <form *ngIf="token && !resetSuccess" [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <app-cyber-input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            formControlName="password"
            testId="reset-password-input"
            [error]="getError('password')"
          ></app-cyber-input>

          <app-cyber-input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            formControlName="confirmPassword"
            testId="reset-confirm-password-input"
            [error]="getError('confirmPassword')"
          ></app-cyber-input>

          <app-cyber-button
            type="submit"
            variant="primary"
            [fullWidth]="true"
            [loading]="isLoading"
            [disabled]="resetForm.invalid"
            testId="reset-submit-btn"
          >
            Reset Password
          </app-cyber-button>
        </form>

        <!-- Login link -->
        <p *ngIf="token && !resetSuccess" class="text-center text-neutral-400 font-outfit">
          Remember your password?
          <a 
            routerLink="/login"
            class="text-neon-cyan hover:text-white transition-colors ml-1"
            data-testid="login-link"
          >
            Sign in
          </a>
        </p>
      </div>
    </app-auth-layout>
  `
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  resetSuccess = false;
  token = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  getError(field: string): string {
    const control = this.resetForm.get(field);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return `${field === 'confirmPassword' ? 'Confirm password' : 'Password'} is required`;
      if (control.errors['minlength']) return `Password must be at least ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['passwordMismatch']) return 'Passwords do not match';
    }
    return '';
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token) return;

    this.isLoading = true;
    const { password, confirmPassword } = this.resetForm.value;
    
    this.authService.resetPassword(this.token, password, confirmPassword).subscribe({
      next: (response) => {
        this.resetSuccess = true;
        this.toastService.success('Password reset successfully!');
      },
      error: (error) => {
        this.isLoading = false;
        const message = error.error?.message || 'Failed to reset password. Please try again.';
        this.toastService.error(message);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
