import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full overflow-hidden bg-deep-void">
      <!-- Left Panel - Form -->
      <div class="flex flex-col justify-center px-8 md:px-16 lg:px-20 xl:px-28 relative z-10 bg-black/40 backdrop-blur-md border-r border-white/5">
        <div class="w-full max-w-md mx-auto">
          <ng-content></ng-content>
        </div>
      </div>
      
      <!-- Right Panel - Visual -->
      <div class="relative hidden lg:flex items-center justify-center bg-black overflow-hidden">
        <!-- Background gradient -->
        <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20"></div>
        
        <!-- Animated background image -->
        <div 
          class="absolute inset-0 bg-cover bg-center animate-scale-breathe opacity-60"
          [style.backgroundImage]="'url(' + heroImage + ')'"
        ></div>
        
        <!-- Overlay gradient -->
        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50"></div>
        
        <!-- Floating elements -->
        <div class="absolute top-20 left-10 w-32 h-32 border border-neon-cyan/20 rounded-full animate-float opacity-30"></div>
        <div class="absolute bottom-32 right-20 w-20 h-20 border border-electric-violet/20 rounded-full animate-float opacity-30" style="animation-delay: -3s;"></div>
        
        <!-- Brand text -->
        <div class="relative z-10 text-center px-8">
          <h1 class="font-rajdhani text-5xl md:text-7xl font-bold tracking-tight uppercase text-white mb-4">
            <span class="text-neon-cyan">Auth</span>Forge
          </h1>
          <p class="font-outfit text-lg text-neutral-400 max-w-md mx-auto">
            Secure authentication for the future. Built with cutting-edge technology.
          </p>
        </div>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {
  @Input() heroImage: string = 'https://images.unsplash.com/photo-1771599940657-f9f151abed45?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwyfHxob2xvZ3JhcGhpYyUyMGdlb21ldHJpYyUyMGFic3RyYWN0JTIwc2hhcGUlMjBkYXJrfGVufDB8fHx8MTc3MzA1NTExNXww&ixlib=rb-4.1.0&q=85';
}
