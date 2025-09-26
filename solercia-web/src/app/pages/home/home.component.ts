import { Component } from '@angular/core';
import { ParticlesBackgroundComponent } from '../../shared/atoms/particles-background/particles-background.component';
import { LogoComponent } from '../../shared/atoms/logo/logo.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ParticlesBackgroundComponent,
    LogoComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  title = 'Solercia';
}
