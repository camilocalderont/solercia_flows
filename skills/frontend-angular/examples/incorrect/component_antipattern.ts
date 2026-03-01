/**
 * Ejemplo INCORRECTO -- Anti-patrones que NO se deben usar en Angular 20.
 *
 * Este archivo muestra los errores mas comunes que se deben evitar.
 * Cada anti-patron tiene un comentario explicando por que es incorrecto
 * y cual es la alternativa correcta.
 */

// =============================================================
// ANTI-PATRON 1: Usar NgModule para agrupar componentes
// CORRECCION: Cada componente debe ser standalone
// =============================================================

import { NgModule, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

// MAL: Declarar un modulo para componentes
// En Angular 20 los modulos son innecesarios. Cada componente se importa directamente.
@NgModule({
  declarations: [
    ServicioCardComponent,   // MAL: declarar componentes en modulo
    ServicioListaComponent,
  ],
  imports: [CommonModule],
  exports: [
    ServicioCardComponent,   // MAL: exportar desde modulo
    ServicioListaComponent,
  ],
})
export class ServiciosModule {}

// =============================================================
// ANTI-PATRON 2: Usar decoradores @Input/@Output
// CORRECCION: Usar funciones input() y output()
// =============================================================

@Component({
  selector: 'app-servicio-card',
  // MAL: No es standalone (depende del NgModule arriba)
  template: `
    <!-- MAL: Usar *ngIf en lugar de @if -->
    <div *ngIf="servicio" class="card">
      <h3>{{ servicio.nombre }}</h3>
      <p>{{ servicio.descripcion }}</p>

      <!-- MAL: Usar *ngFor en lugar de @for -->
      <ul>
        <li *ngFor="let tag of servicio.tags">{{ tag }}</li>
      </ul>

      <button (click)="onSeleccionar()">Seleccionar</button>
    </div>
  `,
})
export class ServicioCardComponent {
  // MAL: Decorador @Input -- usar input() o input.required() en su lugar
  @Input() servicio: any;

  // MAL: Decorador @Output con EventEmitter -- usar output() en su lugar
  @Output() seleccionado = new EventEmitter<any>();

  onSeleccionar(): void {
    this.seleccionado.emit(this.servicio);
  }
}

// =============================================================
// ANTI-PATRON 3: Inyeccion por constructor
// CORRECCION: Usar inject()
// =============================================================

// =============================================================
// ANTI-PATRON 4: Lifecycle hooks (ngOnInit, ngOnDestroy)
// CORRECCION: Usar effect() y DestroyRef
// =============================================================

// =============================================================
// ANTI-PATRON 5: ChangeDetectorRef.detectChanges()
// CORRECCION: Usar signals que notifican automaticamente
// =============================================================

@Component({
  selector: 'app-servicio-lista',
  // MAL: No es standalone
  template: `
    <!-- MAL: *ngIf y *ngFor en lugar de @if y @for -->
    <div *ngIf="cargando">Cargando...</div>

    <div *ngIf="error" class="error">
      {{ error }}
    </div>

    <div *ngFor="let servicio of servicios">
      <app-servicio-card
        [servicio]="servicio"
        (seleccionado)="onServicioSeleccionado($event)">
      </app-servicio-card>
    </div>
  `,
})
export class ServicioListaComponent implements OnInit, OnDestroy {
  // MAL: Propiedades mutables planas en lugar de signals
  servicios: any[] = [];
  cargando = false;
  error: string | null = null;

  // MAL: Suscripcion manual que hay que limpiar
  private subscription: Subscription | null = null;

  // MAL: Inyeccion por constructor en lugar de inject()
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // MAL: ngOnInit para cargar datos -- usar effect() en su lugar
  ngOnInit(): void {
    this.cargarServicios();
  }

  // MAL: ngOnDestroy para limpiar -- usar DestroyRef en su lugar
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cargarServicios(): void {
    this.cargando = true;

    // MAL: Suscripcion manual sin manejo de limpieza automatico
    this.subscription = this.http
      .get<any>('/api/v1/servicios')
      .subscribe({
        next: (response) => {
          this.servicios = response.data;
          this.cargando = false;

          // MAL: Forzar deteccion de cambios manualmente
          // Con signals y zoneless esto no es necesario
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Error al cargar servicios';
          this.cargando = false;

          // MAL: Forzar deteccion de cambios manualmente
          this.cdr.detectChanges();
        },
      });
  }

  onServicioSeleccionado(servicio: any): void {
    // MAL: Usar console.log para depuracion en produccion
    console.log('Servicio seleccionado:', servicio);
  }
}

// =============================================================
// ANTI-PATRON 6: Importar componentes directamente en rutas
// CORRECCION: Usar loadComponent() con lazy loading
// =============================================================

// MAL: Importar el componente al inicio del archivo de rutas
// import { ServicioListaComponent } from './servicio-lista.component';
//
// const routes = [
//   {
//     path: 'servicios',
//     component: ServicioListaComponent  // MAL: Sin lazy loading
//   }
// ];
//
// BIEN:
// const routes = [
//   {
//     path: 'servicios',
//     loadComponent: () =>
//       import('./servicio-lista.component')
//         .then(m => m.ServicioListaComponent)
//   }
// ];

// =============================================================
// ANTI-PATRON 7: Servicio con inyeccion por constructor
// CORRECCION: Usar inject()
// =============================================================

// MAL: Servicio con constructor injection
// @Injectable({ providedIn: 'root' })
// export class ServicioService {
//   constructor(private http: HttpClient) {}  // MAL
//
//   // BIEN:
//   // private readonly http = inject(HttpClient);
// }

// =============================================================
// RESUMEN DE CORRECCIONES
// =============================================================
//
// | Anti-patron                     | Correccion Angular 20              |
// |---------------------------------|------------------------------------|
// | @NgModule                       | standalone: true (implicito)       |
// | @Input() / @Output()            | input() / output()                 |
// | constructor(private svc: T)     | inject(T)                          |
// | ngOnInit / ngOnChanges          | effect()                           |
// | ngOnDestroy                     | DestroyRef + inject()              |
// | ChangeDetectorRef.detectChanges | signal() (notificacion automatica) |
// | *ngIf / *ngFor                  | @if / @for                         |
// | component: MiComponente        | loadComponent: () => import(...)   |
// | Propiedades planas mutables     | signal(), computed()               |
// | EventEmitter                    | output()                           |
