import { Component } from '@angular/core';
import { ParticlesBackgroundComponent } from './shared/atoms/particles-background/particles-background.component';
import { LogoComponent } from './shared/atoms/logo/logo.component';
import { MouseEffectComponent } from './shared/atoms/mouse-effect/mouse-effect.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ParticlesBackgroundComponent,
    LogoComponent,
    MouseEffectComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Solercia';
}
