import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-cyber-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CyberInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative">
      <label *ngIf="label" [for]="inputId" class="cyber-label">{{ label }}</label>
      <div class="relative">
        <input
          [id]="inputId"
          [type]="showPassword ? 'text' : type"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          [attr.data-testid]="testId"
          (input)="onInput($event)"
          (blur)="onTouched()"
          class="cyber-input pr-10"
          [class.border-red-500]="error"
          [class.focus:border-red-500]="error"
        />
        <button
          *ngIf="type === 'password'"
          type="button"
          (click)="togglePassword()"
          class="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors p-2"
          [attr.data-testid]="testId + '-toggle'"
        >
          <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        </button>
      </div>
      <p *ngIf="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
    </div>
  `
})
export class CyberInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() error: string = '';
  @Input() testId: string = '';
  @Input() disabled: boolean = false;

  value: string = '';
  showPassword: boolean = false;
  inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
