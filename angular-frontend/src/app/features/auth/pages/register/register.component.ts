import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthLayoutComponent } from '../../../../shared/components/auth-layout/auth-layout.component';
import { CyberInputComponent } from '../../../../shared/components/cyber-input/cyber-input.component';
import { CyberButtonComponent } from '../../../../shared/components/cyber-button/cyber-button.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-register',
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
    <app-auth-layout>
      <div class="space-y-8">
        <!-- Header -->
        <div class="space-y-2">
          <h2 class="font-rajdhani text-4xl md:text-5xl font-bold tracking-tight uppercase text-white">
            Create <span class="text-electric-violet">Account</span>
          </h2>
          <p class="font-outfit text-neutral-400 text-lg">
            Join us and experience the future of authentication
          </p>
        </div>

        <!-- Google OAuth -->
        <app-cyber-button
          variant="google"
          [fullWidth]="true"
          testId="google-register-btn"
          (onClick)="registerWithGoogle()"
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
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <app-cyber-input
            label="Full Name"
            type="text"
            placeholder="Enter your name"
            formControlName="name"
            testId="register-name-input"
            [error]="getError('name')"
          ></app-cyber-input>

          <app-cyber-input
            label="Email"
            type="email"
            placeholder="Enter your email"
            formControlName="email"
            testId="register-email-input"
            [error]="getError('email')"
          ></app-cyber-input>

          <app-cyber-input
            label="Password"
            type="password"
            placeholder="Create a password"
            formControlName="password"
            testId="register-password-input"
            [error]="getError('password')"
          ></app-cyber-input>

          <app-cyber-input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            formControlName="confirmPassword"
            testId="register-confirm-password-input"
            [error]="getError('confirmPassword')"
          ></app-cyber-input>

          <app-cyber-button
            type="submit"
            variant="primary"
            [fullWidth]="true"
            [loading]="isLoading"
            [disabled]="registerForm.invalid"
            testId="register-submit-btn"
          >
            Create Account
          </app-cyber-button>
        </form>

        <!-- Login link -->
        <p class="text-center text-neutral-400 font-outfit">
          Already have an account?
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
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
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
    const control = this.registerForm.get(field);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return `${field === 'confirmPassword' ? 'Confirm password' : field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      if (control.errors['email']) return 'Please enter a valid email';
      if (control.errors['minlength']) return `Must be at least ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['maxlength']) return `Must be less than ${control.errors['maxlength'].requiredLength} characters`;
      if (control.errors['passwordMismatch']) return 'Passwords do not match';
    }
    return '';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.toastService.success('Account created successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        const message = error.error?.message || error.error?.errors?.[0]?.msg || 'Registration failed. Please try again.';
        this.toastService.error(message);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  registerWithGoogle(): void {
    this.authService.googleLogin();
  }
}
