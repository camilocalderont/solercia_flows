import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-mouse-effect',
  standalone: true,
  template: `
    <div class="mouse-effect-container">
      <div class="mouse-glow"></div>
    </div>
  `,
  styles: [`
    .mouse-effect-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
    }

    .mouse-glow {
      position: absolute;
      width: 100%;
      height: 100%;
      background: radial-gradient(
        200px circle at var(--mouse-x) var(--mouse-y),
        rgba(255, 255, 255, 0.03),
        transparent 55%
      );
      opacity: 1;
      transition: all 0.1s ease;
    }
  `]
})
export class MouseEffectComponent implements OnInit {

  ngOnInit() {
    this.initMouseEffect();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.handleMouseMove(e);
  }

  private initMouseEffect() {
    // Inicializar la posición del mouse
    const glow = document.querySelector('.mouse-glow') as HTMLElement;
    if (glow) {
      glow.style.setProperty('--mouse-x', '50%');
      glow.style.setProperty('--mouse-y', '50%');
    }
  }

  private handleMouseMove(e: MouseEvent) {
    const glow = document.querySelector('.mouse-glow') as HTMLElement;
    if (glow) {
      const x = e.clientX;
      const y = e.clientY;
      glow.style.setProperty('--mouse-x', `${x}px`);
      glow.style.setProperty('--mouse-y', `${y}px`);
    }
  }
}
