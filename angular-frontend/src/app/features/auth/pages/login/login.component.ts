import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthLayoutComponent } from '../../../../shared/components/auth-layout/auth-layout.component';
import { CyberInputComponent } from '../../../../shared/components/cyber-input/cyber-input.component';
import { CyberButtonComponent } from '../../../../shared/components/cyber-button/cyber-button.component';
import { CyberCheckboxComponent } from '../../../../shared/components/cyber-checkbox/cyber-checkbox.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    AuthLayoutComponent,
    CyberInputComponent,
    CyberButtonComponent,
    CyberCheckboxComponent
  ],
  template: `
    <app-auth-layout>
      <div class="space-y-8">
        <!-- Header -->
        <div class="space-y-2">
          <h2 class="font-rajdhani text-4xl md:text-5xl font-bold tracking-tight uppercase text-white">
            Welcome <span class="text-neon-cyan">Back</span>
          </h2>
          <p class="font-outfit text-neutral-400 text-lg">
            Enter your credentials to access your account
          </p>
        </div>

        <!-- Google OAuth -->
        <app-cyber-button
          variant="google"
          [fullWidth]="true"
          testId="google-login-btn"
          (onClick)="loginWithGoogle()"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </app-cyber-button>

        <!-- Divider -->
        <div class="flex items-center gap-4">
          <div class="flex-1 h-px bg-white/10"></div>
          <span class="text-neutral-500 text-sm uppercase tracking-widest font-outfit">or</span>
          <div class="flex-1 h-px bg-white/10"></div>
        </div>

        <!-- Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <app-cyber-input
            label="Email"
            type="email"
            placeholder="Enter your email"
            formControlName="email"
            testId="login-email-input"
            [error]="getError('email')"
          ></app-cyber-input>

          <app-cyber-input
            label="Password"
            type="password"
            placeholder="Enter your password"
            formControlName="password"
            testId="login-password-input"
            [error]="getError('password')"
          ></app-cyber-input>

          <!-- Remember me & Forgot password -->
          <div class="flex items-center justify-between">
            <app-cyber-checkbox
              label="Remember me"
              formControlName="rememberMe"
              testId="login-remember-checkbox"
            ></app-cyber-checkbox>
            <a 
              routerLink="/forgot-password"
              class="text-sm text-neon-cyan hover:text-white transition-colors font-outfit"
              data-testid="forgot-password-link"
            >
              Forgot password?
            </a>
          </div>

          <app-cyber-button
            type="submit"
            variant="primary"
            [fullWidth]="true"
            [loading]="isLoading"
            [disabled]="loginForm.invalid"
            testId="login-submit-btn"
          >
            Sign In
          </app-cyber-button>
        </form>

        <!-- Register link -->
        <p class="text-center text-neutral-400 font-outfit">
          Don't have an account?
          <a 
            routerLink="/register"
            class="text-neon-cyan hover:text-white transition-colors ml-1"
            data-testid="register-link"
          >
            Create one
          </a>
        </p>
      </div>
    </app-auth-layout>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  getError(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      if (control.errors['email']) return 'Please enter a valid email';
      if (control.errors['minlength']) return `Password must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.toastService.success('Login successful!');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        const message = error.error?.message || 'Login failed. Please try again.';
        this.toastService.error(message);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  loginWithGoogle(): void {
    this.authService.googleLogin();
  }
}
