/**
 * Ejemplo CORRECTO de componente Angular 20 para solercia-web / boki-front.
 *
 * Patrones demostrados:
 * - Componente standalone (sin NgModule)
 * - Signals para estado reactivo (signal, computed, effect)
 * - Inyeccion con inject() en lugar de constructor
 * - input() / output() basados en funciones
 * - Control flow nativo (@if, @for)
 * - Lazy loading en rutas
 * - Tailwind CSS con variables de marca Solercia
 * - DestroyRef para limpieza de recursos
 */

import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// -- Interfaces --

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
}

interface ApiSuccessResponse<T> {
  status: string;
  data: T;
  message?: string;
}

// -- Componente --

@Component({
  selector: 'app-lista-servicios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-screen bg-[var(--solercia-bg-dark)] p-8">
      <!-- Encabezado -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-[var(--solercia-accent)]">
          Servicios
        </h1>
        <span class="text-[var(--solercia-gray-medium)] text-sm">
          {{ totalActivos() }} activos de {{ totalServicios() }}
        </span>
      </div>

      <!-- Estado de carga -->
      @if (cargando()) {
        <div class="flex items-center justify-center py-16">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--solercia-accent)]"></div>
          <span class="ml-4 text-[var(--solercia-gray-medium)]">Cargando servicios...</span>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6">
          <p class="text-red-400">{{ error() }}</p>
          <button
            (click)="cargarServicios()"
            class="mt-2 text-sm text-[var(--solercia-accent)] hover:underline">
            Reintentar
          </button>
        </div>
      }

      <!-- Lista de servicios -->
      @if (!cargando() && !error()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (servicio of serviciosFiltrados(); track servicio.id) {
            <article
              class="bg-[var(--solercia-gray-dark)] rounded-xl p-6 border border-[var(--solercia-gray-medium)]/20 hover:border-[var(--solercia-accent)]/50 transition-colors cursor-pointer"
              (click)="seleccionarServicio(servicio)">
              <h3 class="text-lg font-semibold text-white mb-2">
                {{ servicio.nombre }}
              </h3>
              <p class="text-[var(--solercia-gray-medium)] text-sm mb-4">
                {{ servicio.descripcion }}
              </p>
              <div class="flex items-center justify-between">
                <span class="text-[var(--solercia-accent)] font-bold">
                  $ {{ servicio.precio | number:'1.0-0' }}
                </span>
                @if (servicio.activo) {
                  <span class="bg-[var(--solercia-secondary)]/20 text-[var(--solercia-secondary)] text-xs px-2 py-1 rounded-full">
                    Activo
                  </span>
                } @else {
                  <span class="bg-[var(--solercia-orange)]/20 text-[var(--solercia-orange)] text-xs px-2 py-1 rounded-full">
                    Inactivo
                  </span>
                }
              </div>
            </article>
          } @empty {
            <div class="col-span-full text-center py-12">
              <p class="text-[var(--solercia-gray-medium)] text-lg">
                No hay servicios disponibles
              </p>
              <a
                routerLink="/dashboard/servicios/crear"
                class="inline-block mt-4 bg-[var(--solercia-primary)] text-white px-6 py-2 rounded-lg hover:bg-[var(--solercia-secondary)] transition-colors">
                Crear primer servicio
              </a>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class ListaServiciosComponent {
  // -- Inyeccion de dependencias con inject() --
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  // -- Entradas con input() --
  readonly categoriaId = input<number | null>(null); // Filtro opcional por categoria
  readonly soloActivos = input(false);                // Mostrar solo activos

  // -- Salidas con output() --
  readonly servicioSeleccionado = output<Servicio>();

  // -- Estado reactivo con signals --
  readonly servicios = signal<Servicio[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  // -- Estado derivado con computed() --
  readonly totalServicios = computed(() => this.servicios().length);

  readonly totalActivos = computed(
    () => this.servicios().filter(s => s.activo).length
  );

  readonly serviciosFiltrados = computed(() => {
    let resultado = this.servicios();

    // Filtrar por estado activo si se solicita
    if (this.soloActivos()) {
      resultado = resultado.filter(s => s.activo);
    }

    return resultado;
  });

  // -- Efectos --

  /**
   * Efecto que carga los servicios cuando cambia la categoriaId.
   * Reemplaza ngOnInit + ngOnChanges.
   */
  private readonly cargarEffect = effect(() => {
    // Leer el signal para que Angular rastree la dependencia
    const catId = this.categoriaId();
    this.cargarServicios(catId ?? undefined);
  });

  // -- Metodos publicos --

  async cargarServicios(categoriaId?: number): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const url = categoriaId
        ? `/api/v1/servicios?categoriaId=${categoriaId}`
        : '/api/v1/servicios';

      const respuesta = await firstValueFrom(
        this.http.get<ApiSuccessResponse<Servicio[]>>(url)
      );

      this.servicios.set(respuesta.data);
    } catch (err) {
      this.error.set('Error al cargar los servicios. Intente nuevamente.');
      console.error('Error cargando servicios:', err);
    } finally {
      this.cargando.set(false);
    }
  }

  seleccionarServicio(servicio: Servicio): void {
    this.servicioSeleccionado.emit(servicio);
  }
}

// -- Configuracion de ruta con lazy loading --

/**
 * Este componente se registra en el router con loadComponent
 * para habilitar code splitting automatico:
 *
 * // En app.routes.ts
 * {
 *   path: 'servicios',
 *   loadComponent: () =>
 *     import('./pages/lista-servicios/lista-servicios.component')
 *       .then(m => m.ListaServiciosComponent),
 *   title: 'Servicios'
 * }
 */
