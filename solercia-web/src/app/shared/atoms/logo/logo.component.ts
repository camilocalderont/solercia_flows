import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="fixed inset-0 flex items-center justify-center z-10">
      <div class="text-center">
        <!-- Logo Image -->
        <div class="flex justify-center">
          <img 
            src="logo_solercia.png" 
            alt="Solercia Logo" 
            class="w-80 h-80 md:w-[32rem] md:h-[32rem] lg:w-[40rem] lg:h-[40rem] object-contain logo-image"
          />
        </div>
        
        <!-- Rotating Text with Typewriter Effect -->
        <p class="text-white font-sans text-xl md:text-2xl lg:text-3xl tracking-wide px-4 font-normal typewriter-text" 
           [style.width]="textWidth + '%'">
          {{ currentPhrase }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    /* Solo CSS que no se puede hacer con Tailwind */
    .logo-image {
      filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.4));
    }
    
    .typewriter-text {
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      white-space: nowrap;
      border-right: 3px solid white;
      transition: width 0.1s ease;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .logo-image {
        filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.3));
      }
      
      .typewriter-text {
        font-size: 1.125rem;
      }
    }
  `]
})
export class LogoComponent implements OnInit, OnDestroy {
  phrases = [
    "Próximamente estaremos disponibles",
    "Muy pronto llegaremos al mercado", 
    "Estamos preparando algo increíble 💫"
  ];
  
  currentPhrase = this.phrases[0];
  currentIndex = 0;
  textWidth = 0;
  private intervalId: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.startAnimation();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startAnimation() {
    this.animateText();
  }

  private animateText() {
    // Empezar escribiendo (0% a 100%)
    this.textWidth = 0;
    this.cdr.detectChanges();
    
    let width = 0;
    const writeInterval = setInterval(() => {
      width += 2;
      this.textWidth = width;
      this.cdr.detectChanges();
      
      if (width >= 100) {
        clearInterval(writeInterval);
        
        setTimeout(() => {
          const deleteInterval = setInterval(() => {
            width -= 2;
            this.textWidth = width;
            this.cdr.detectChanges();
            
            if (width <= 0) {
              clearInterval(deleteInterval);
              
              this.currentIndex = (this.currentIndex + 1) % this.phrases.length;
              this.currentPhrase = this.phrases[this.currentIndex];
              this.cdr.detectChanges();
              
              setTimeout(() => {
                this.animateText();
              }, 500);
            }
          }, 50); // Velocidad de borrado
        }, 1000); // Tiempo de espera
      }
    }, 50); // Velocidad de escritura
  }
}
