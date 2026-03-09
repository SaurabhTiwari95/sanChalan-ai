import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cyber-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [attr.data-testid]="testId"
      (click)="onClick.emit($event)"
      [ngClass]="buttonClasses"
      class="relative overflow-hidden transition-all duration-300 font-rajdhani font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span *ngIf="loading" class="absolute inset-0 flex items-center justify-center">
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </span>
      <span [class.opacity-0]="loading">
        <ng-content></ng-content>
      </span>
    </button>
  `
})
export class CyberButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'google' = 'primary';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() testId: string = '';
  @Input() fullWidth: boolean = false;

  @Output() onClick = new EventEmitter<Event>();

  get buttonClasses(): string {
    const base = this.fullWidth ? 'w-full' : '';
    
    switch (this.variant) {
      case 'primary':
        return `${base} bg-white text-black py-3 px-8 hover:bg-neon-cyan hover:text-black`;
      case 'secondary':
        return `${base} border border-white/20 text-white py-3 px-8 hover:bg-white/10 hover:border-white/50`;
      case 'google':
        return `${base} flex items-center justify-center gap-3 bg-neutral-800 hover:bg-neutral-700 text-white py-3 px-6 border border-white/10 rounded-md`;
      default:
        return base;
    }
  }
}
