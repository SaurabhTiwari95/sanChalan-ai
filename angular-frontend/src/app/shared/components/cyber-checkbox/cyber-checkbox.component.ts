import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-cyber-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CyberCheckboxComponent),
      multi: true
    }
  ],
  template: `
    <label class="flex items-center gap-3 cursor-pointer group" [attr.data-testid]="testId">
      <div class="relative w-5 h-5 border-2 transition-all duration-200" [ngClass]="{'border-white/30': !checked, 'border-neon-cyan': checked, 'bg-neon-cyan': checked}">
        <svg *ngIf="checked" class="absolute inset-0 w-full h-full p-0.5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <input type="checkbox" [checked]="checked" (change)="onCheckboxChange($event)" class="absolute inset-0 opacity-0 cursor-pointer" />
      </div>
      <span class="text-sm text-neutral-400 group-hover:text-white transition-colors">{{ label }}</span>
    </label>
  `
})
export class CyberCheckboxComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() testId: string = '';

  checked: boolean = false;

  onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: boolean): void {
    this.checked = value || false;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onCheckboxChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;
    this.onChange(this.checked);
    this.onTouched();
  }
}
