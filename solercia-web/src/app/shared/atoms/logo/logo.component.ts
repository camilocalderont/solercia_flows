import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [],
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.css']
})
export class LogoComponent implements OnInit, OnDestroy {
  phrases = [
    // Frases originales de Solercia
    "Transformando empresas con Inteligencia Artificial",
    "Desarrollando el futuro del software empresarial",
    "Boki AI: Tu asistente inteligente está en camino",
    "Servicios en la nube para sector público y privado",
    "Automatización inteligente para Colombia 🇨🇴",
    "Software personalizado con tecnología de vanguardia",
    "La revolución digital llega a tu organización",
    "Preparando soluciones SaaS que cambiarán tu forma de trabajar",
    "Innovación tecnológica desde Bogotá para el mundo 🚀"
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
