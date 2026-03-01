---
name: frontend-angular
description: >
  Estandar para desarrollo frontend Angular 20 en solercia-web y boki-front: standalone components, signals, Tailwind, zoneless.
  Trigger: When creating Angular components, services, pages, or modifying the frontend in solercia-web or boki-front.
metadata:
  author: solercia
  version: "1.0"
---

## When to Use

Activa este skill cuando:
- Se crea o modifica un componente, servicio, pipe o directiva en `solercia-web/` o `boki-front/`.
- Se agrega una nueva pagina o ruta en cualquiera de los dos frontends.
- Se trabaja con estilos Tailwind o variables CSS de la marca Solercia.
- Se configura `HttpClient`, interceptores, guards o el router de Angular.
- Se necesita crear interfaces para consumir la API de boki-api.

---

## Standalone Components (REQUIRED)

Todos los componentes DEBEN ser standalone. Angular 20 los genera standalone por defecto, por lo que `standalone: true` es opcional pero se puede incluir para claridad.

```typescript
// Componente standalone con imports declarados
@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mi-componente.component.html',
  styleUrl: './mi-componente.component.css'
})
export class MiComponenteComponent {}
```

Reglas:
- **NO** crear `NgModule` para agrupar componentes. Cada componente se importa directamente.
- Declarar todos los componentes, directivas y pipes usados en el template dentro del array `imports`.
- Usar `templateUrl` y `styleUrl` separados (no inline) para componentes con mas de 5 lineas de template.

---

## Signals for State (REQUIRED)

Usar `signal()`, `computed()` y `effect()` para todo el estado reactivo del componente.

```typescript
import { signal, computed, effect } from '@angular/core';

// Estado mutable
readonly isOpen = signal(false);
readonly items = signal<Item[]>([]);

// Estado derivado (solo lectura, se recalcula automaticamente)
readonly totalItems = computed(() => this.items().length);
readonly hasItems = computed(() => this.items().length > 0);

// Actualizar estado
this.isOpen.set(true);
this.items.update(prev => [...prev, nuevoItem]);

// Efectos secundarios (localStorage, logs, llamadas API)
private readonly guardarEffect = effect(() => {
  localStorage.setItem('items', JSON.stringify(this.items()));
});
```

### input() y output() basados en funciones

```typescript
import { input, output, model } from '@angular/core';

// Entradas
readonly titulo = input.required<string>();       // Obligatorio
readonly deshabilitado = input(false);             // Con valor por defecto

// Salidas
readonly seleccionado = output<Item>();            // Emision de eventos

// Two-way binding
readonly activo = model(false);                    // [(activo)]="valor"
```

### Reemplazar lifecycle hooks con signals

```typescript
// En lugar de ngOnInit + ngOnChanges, usar effect()
readonly userId = input.required<string>();
readonly usuario = signal<Usuario | null>(null);

private cargarUsuarioEffect = effect(() => {
  // Se ejecuta automaticamente cuando userId() cambia
  this.cargarUsuario(this.userId());
});

// Para limpieza, usar DestroyRef
private readonly destroyRef = inject(DestroyRef);

constructor() {
  const sub = miObservable$.subscribe();
  this.destroyRef.onDestroy(() => sub.unsubscribe());
}
```

---

## Zoneless Change Detection

Ambos proyectos usan (o deben migrar a) deteccion de cambios sin Zone.js.

**solercia-web** ya lo tiene configurado:
```typescript
// solercia-web/src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient()
  ]
};
```

Requisitos para zoneless:
- Usar `ChangeDetectionStrategy.OnPush` en todos los componentes (o depender de signals que notifican automaticamente).
- Usar `signal()` para estado -- Angular detecta cambios automaticamente cuando un signal cambia.
- Usar `AsyncPipe` para observables en templates.
- **NO** usar `ChangeDetectorRef.detectChanges()` ni `markForCheck()` manualmente. Los signals eliminan esa necesidad.

---

## Tailwind CSS

Usar clases de Tailwind para todo el estilado. Evitar CSS personalizado a menos que sea absolutamente necesario.

```html
<!-- Layout responsive con Tailwind -->
<div class="flex flex-col items-center justify-center min-h-screen bg-[var(--solercia-bg-dark)]">
  <h1 class="text-3xl font-bold text-[var(--solercia-accent)] mb-4">
    Titulo
  </h1>
  <p class="text-[var(--solercia-gray-medium)] text-lg">
    Descripcion del contenido
  </p>
</div>
```

Reglas:
- Preferir clases utilitarias de Tailwind sobre CSS personalizado.
- Usar las variables CSS de Solercia con la sintaxis `var(--solercia-*)` dentro de clases arbitrarias de Tailwind: `text-[var(--solercia-primary)]`.
- Para componentes reutilizables, extraer combinaciones frecuentes con `@apply` en el archivo CSS del componente.

---

## Project Structure

### solercia-web (sitio web publico)
```
solercia-web/src/app/
  app.ts                          # Componente raiz
  app.config.ts                   # Configuracion de providers
  app.routes.ts                   # Rutas principales (lazy loaded)
  pages/                          # Paginas completas (una por ruta)
    home/
      home.component.ts
      home.component.html
      home.component.css
    privacy-policy/
      privacy-policy.component.ts
  shared/
    atoms/                        # Componentes atomicos (logo, particulas, etc.)
      logo/
      particles-background/
      mouse-effect/
    components/                   # Componentes compuestos (footer, chatbot, etc.)
      footer/
      chatbot-widget/
```

### boki-front (panel de administracion)
```
boki-front/src/app/
  app.component.ts                # Componente raiz
  app.config.ts                   # Configuracion de providers + interceptores
  app.routes.ts                   # Rutas con guards de autenticacion
  auth/                           # Modulo de autenticacion
    login/
    register/
    services/auth.service.ts
    auth.routes.ts
  core/                           # Servicios e interceptores globales
    guards/
    interceptors/
    services/
  dashboard/                      # Layout y paginas del dashboard
    dashboard-layout/
    main/
    user-dropdown/
  views/                          # Vistas de CRUD por entidad
    company/
    category/
    faqs/
    plans/
    forms/                        # Formularios de creacion/edicion
      create-company/
      create-category/
      create-faqs/
  services/                       # Servicios HTTP por entidad
    company.service.ts
    category.service.ts
    faqs.service.ts
    plan.service.ts
  shared/
    components/                   # Componentes UI reutilizables (theme system)
      data-grid/
      dropdown/
      modal-theme/
      button-theme/
      form-input-theme/
    interfaces/                   # Interfaces TypeScript
      api.interface.ts
      auth.interface.ts
      company.interface.ts
    enums/
    pipes/
    dialogs/
```

### Convenciones de nombres

| Tipo | Patron de nombre | Ejemplo |
|------|------------------|---------|
| Componente pagina | `nombre.component.ts` | `home.component.ts` |
| Componente atomo | `nombre.component.ts` en `shared/atoms/` | `logo.component.ts` |
| Servicio | `nombre.service.ts` | `faqs.service.ts` |
| Interfaz | `nombre.interface.ts` | `api.interface.ts` |
| Guard | `nombre.guard.ts` | `auth.guard.ts` |
| Interceptor | `nombre.interceptor.ts` | `auth.interceptor.ts` |
| Pipe | `nombre.pipe.ts` | `truncate-text-pipe.ts` |

---

## Lazy Loading

Todas las rutas DEBEN usar lazy loading con `loadComponent` o `loadChildren`.

```typescript
// solercia-web/src/app/app.routes.ts
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'politica-privacidad',
    loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy.component')
        .then(m => m.PrivacyPolicyComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

// boki-front: rutas hijas con loadChildren para modulos de feature
{
  path: 'auth',
  loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
}
```

Reglas:
- **NO** importar componentes de pagina directamente en el array de rutas.
- Usar `loadComponent` para paginas individuales.
- Usar `loadChildren` para grupos de rutas relacionadas (como `auth`).
- Aplicar `canActivate` guards a rutas protegidas.

---

## HttpClient

### Configuracion

```typescript
// solercia-web: basico
provideHttpClient()

// boki-front: con interceptor de autenticacion
provideHttpClient(
  withInterceptors([authInterceptor])
)
```

### Inyeccion en servicios

```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MiServicioService {
  // Inyeccion con inject() -- NO usar constructor
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}`;

  obtenerItems(): Observable<ApiSuccessResponse<Item[]>> {
    return this.http.get<ApiSuccessResponse<Item[]>>(`${this.baseUrl}/items`).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }
}
```

### Interfaces para la API de boki-api

La API responde con este formato estandarizado:

```typescript
// Respuesta exitosa
interface ApiSuccessResponse<T> {
  status: string;
  data: T;
  message?: string;
}

// Respuesta de error
interface ApiErrorResponse {
  status: string;
  message: string;
  errors: Array<{
    code: string;     // Ej: "EMAIL_YA_EXISTE"
    message: string;  // Mensaje en espanol
    field: string;    // Campo que causo el error
  }>;
}
```

---

## Brand Colors

Variables CSS definidas en `solercia-web/src/styles.css`:

```css
:root {
  /* Colores primarios */
  --solercia-primary: #1E40AF;      /* Azul tecnologico */
  --solercia-accent: #48d9c6;       /* Verde intermedio (titulos) */
  --solercia-secondary: #059669;    /* Verde innovacion */
  --solercia-orange: #EA580C;       /* Naranja digital */

  /* Grises corporativos */
  --solercia-gray-dark: #374151;    /* Gris oscuro */
  --solercia-gray-medium: #6B7280; /* Gris medio */
  --solercia-gray-light: #F3F4F6;  /* Gris claro */

  /* Fondos */
  --solercia-bg-dark: #111827;      /* Fondo oscuro principal */
  --solercia-bg-darker: #000000;    /* Negro absoluto */
}
```

Uso en templates con Tailwind:
```html
<button class="bg-[var(--solercia-primary)] hover:bg-[var(--solercia-secondary)] text-white px-6 py-3 rounded-lg transition-colors">
  Accion Principal
</button>

<div class="border border-[var(--solercia-accent)] bg-[var(--solercia-bg-dark)] p-4 rounded-xl">
  <h2 class="text-[var(--solercia-accent)] text-xl font-bold">Titulo</h2>
  <p class="text-[var(--solercia-gray-medium)]">Contenido descriptivo</p>
</div>
```

---

## Anti-Patterns

### 1. NO usar NgModules

```typescript
// MAL -- No crear modulos en Angular 20
@NgModule({
  declarations: [MiComponente],
  imports: [CommonModule],
  exports: [MiComponente]
})
export class MiModulo {}

// BIEN -- Componente standalone
@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [CommonModule],
  template: `<p>Contenido</p>`
})
export class MiComponente {}
```

### 2. NO usar decoradores @Input/@Output

```typescript
// MAL -- Decoradores obsoletos
@Component({ ... })
export class MiComponente {
  @Input() titulo: string = '';
  @Output() cerrar = new EventEmitter<void>();
}

// BIEN -- Funciones input() y output()
@Component({ ... })
export class MiComponente {
  readonly titulo = input.required<string>();
  readonly cerrar = output<void>();
}
```

### 3. NO usar inyeccion por constructor

```typescript
// MAL -- Inyeccion por constructor
export class MiServicio {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
}

// BIEN -- Inyeccion con inject()
export class MiServicio {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
}
```

### 4. NO usar lifecycle hooks

```typescript
// MAL -- ngOnInit, ngOnDestroy
export class MiComponente implements OnInit, OnDestroy {
  ngOnInit() {
    this.cargarDatos();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

// BIEN -- effect() y DestroyRef
export class MiComponente {
  private readonly destroyRef = inject(DestroyRef);
  private readonly datos = signal<Dato[]>([]);

  private cargarEffect = effect(() => {
    this.cargarDatos();
  });

  constructor() {
    const sub = miObservable$.subscribe();
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
```

### 5. NO usar ChangeDetectorRef manualmente

```typescript
// MAL -- Forzar deteccion de cambios
constructor(private cdr: ChangeDetectorRef) {}
actualizarVista() {
  this.valor = 'nuevo';
  this.cdr.detectChanges();
}

// BIEN -- Los signals notifican automaticamente
readonly valor = signal('');
actualizarVista() {
  this.valor.set('nuevo'); // Angular detecta el cambio solo
}
```

### 6. NO usar *ngIf/*ngFor (control flow antiguo)

```html
<!-- MAL -- Directivas estructurales -->
<div *ngIf="cargando">Cargando...</div>
<div *ngFor="let item of items">{{ item.nombre }}</div>

<!-- BIEN -- Control flow nativo de Angular 20 -->
@if (cargando()) {
  <div>Cargando...</div>
}

@for (item of items(); track item.id) {
  <div>{{ item.nombre }}</div>
} @empty {
  <p>No hay elementos</p>
}
```

---

## Quick Reference

| Concepto | Angular 20 Correcto | Incorrecto (evitar) |
|----------|---------------------|---------------------|
| Componentes | `standalone: true` (implicito) | `@NgModule({ declarations })` |
| Estado | `signal()`, `computed()` | Propiedades mutables planas |
| Entradas | `input()`, `input.required()` | `@Input()` |
| Salidas | `output()` | `@Output() + EventEmitter` |
| Two-way binding | `model()` | `@Input() + @Output()` combo |
| Inyeccion | `inject(Servicio)` | `constructor(private s: Servicio)` |
| Lifecycle | `effect()`, `DestroyRef` | `ngOnInit`, `ngOnDestroy` |
| Condicionales | `@if / @else` | `*ngIf` |
| Iteraciones | `@for (track item.id)` | `*ngFor` |
| Switch | `@switch / @case` | `ngSwitch` |
| Change Detection | Zoneless + Signals | Zone.js + `detectChanges()` |
| Rutas | `loadComponent()` | Importar componente directo |
| Estilado | Tailwind + CSS vars | CSS custom extenso |
| HttpClient | `inject(HttpClient)` | Constructor injection |

---

## Commands

```bash
# === solercia-web ===
cd solercia-web

# Servidor de desarrollo (http://localhost:4200)
ng serve
# o
npm start

# Generar componente de pagina
ng generate component pages/nombre-pagina

# Generar componente compartido (atomo)
ng generate component shared/atoms/nombre-atomo

# Generar componente compartido (compuesto)
ng generate component shared/components/nombre-componente

# Generar servicio
ng generate service services/nombre-servicio

# Build de produccion
npm run build

# Tests
npm test

# Build con script (incluye instrucciones Docker)
./build-web.sh

# === boki-front ===
cd boki-front

# Servidor de desarrollo
ng serve

# Generar vista CRUD
ng generate component views/nombre-entidad

# Generar formulario
ng generate component views/forms/create-nombre-entidad

# Generar servicio HTTP
ng generate service services/nombre-entidad

# Build de produccion
npm run build
```
