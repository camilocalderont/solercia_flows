/**
 * Ejemplo CORRECTO de servicio Angular 20 para boki-front / solercia-web.
 *
 * Patrones demostrados:
 * - Injectable con providedIn: 'root'
 * - Inyeccion con inject() en lugar de constructor
 * - Signals para estado reactivo del servicio
 * - Manejo de errores estandarizado compatible con boki-api
 * - Tipado fuerte con interfaces de la API
 * - Metodos CRUD completos
 */

import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

// -- Interfaces para la API de boki-api --

/** Respuesta exitosa estandarizada del backend */
interface ApiSuccessResponse<T> {
  status: string;
  data: T;
  message?: string;
}

/** Error personalizado con metadatos del backend */
interface CustomError extends Error {
  code: string;
  status?: number;
  originalError?: unknown;
}

/** Entidad de ejemplo: Categoria de servicio */
interface Categoria {
  InId: number;
  VcNombre: string;
  VcDescripcion: string;
  BlActivo: boolean;
  DtCreatedAt: string;
  DtUpdatedAt: string;
}

/** DTO para crear una categoria */
interface CrearCategoriaDto {
  VcNombre: string;
  VcDescripcion: string;
}

/** DTO para actualizar una categoria */
interface ActualizarCategoriaDto {
  VcNombre?: string;
  VcDescripcion?: string;
  BlActivo?: boolean;
}

// -- Servicio --

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  // -- Inyeccion con inject() --
  private readonly http = inject(HttpClient);

  // -- Configuracion --
  private readonly baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}`;
  private readonly endpoint = `${this.baseUrl}/category-services`;

  // -- Estado reactivo del servicio --
  // Los signals en servicios permiten compartir estado entre componentes

  /** Lista de categorias cacheadas */
  readonly categorias = signal<Categoria[]>([]);

  /** Indicador de operacion en progreso */
  readonly cargando = signal(false);

  /** Ultimo error ocurrido */
  readonly error = signal<string | null>(null);

  /** Total de categorias activas (estado derivado) */
  readonly totalActivas = computed(
    () => this.categorias().filter(c => c.BlActivo).length
  );

  /** Indica si hay datos cargados */
  readonly tieneDatos = computed(() => this.categorias().length > 0);

  // -- Metodos CRUD --

  /**
   * Obtiene todas las categorias del backend.
   * Actualiza el signal interno y retorna el Observable para suscripcion adicional.
   */
  obtenerTodas(): Observable<ApiSuccessResponse<Categoria[]>> {
    this.cargando.set(true);
    this.error.set(null);

    return this.http
      .get<ApiSuccessResponse<Categoria[]>>(this.endpoint)
      .pipe(
        tap((respuesta) => {
          this.categorias.set(respuesta.data);
          this.cargando.set(false);
        }),
        catchError((error: HttpErrorResponse) => {
          this.cargando.set(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtiene una categoria por su ID.
   */
  obtenerPorId(id: number): Observable<ApiSuccessResponse<Categoria>> {
    return this.http
      .get<ApiSuccessResponse<Categoria>>(`${this.endpoint}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  /**
   * Crea una nueva categoria.
   * Actualiza la lista local despues de crear exitosamente.
   */
  crear(datos: CrearCategoriaDto): Observable<ApiSuccessResponse<Categoria>> {
    this.cargando.set(true);

    return this.http
      .post<ApiSuccessResponse<Categoria>>(this.endpoint, datos)
      .pipe(
        tap((respuesta) => {
          // Agregar la nueva categoria a la lista local
          this.categorias.update(lista => [...lista, respuesta.data]);
          this.cargando.set(false);
        }),
        catchError((error: HttpErrorResponse) => {
          this.cargando.set(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Actualiza una categoria existente.
   * Actualiza la lista local despues de modificar exitosamente.
   */
  actualizar(
    id: number,
    datos: ActualizarCategoriaDto
  ): Observable<ApiSuccessResponse<Categoria>> {
    this.cargando.set(true);

    return this.http
      .put<ApiSuccessResponse<Categoria>>(`${this.endpoint}/${id}`, datos)
      .pipe(
        tap((respuesta) => {
          // Reemplazar la categoria actualizada en la lista local
          this.categorias.update(lista =>
            lista.map(cat => (cat.InId === id ? respuesta.data : cat))
          );
          this.cargando.set(false);
        }),
        catchError((error: HttpErrorResponse) => {
          this.cargando.set(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Elimina una categoria por ID.
   * Remueve la categoria de la lista local despues de eliminar.
   */
  eliminar(id: number): Observable<ApiSuccessResponse<void>> {
    this.cargando.set(true);

    return this.http
      .delete<ApiSuccessResponse<void>>(`${this.endpoint}/${id}`)
      .pipe(
        tap(() => {
          this.categorias.update(lista =>
            lista.filter(cat => cat.InId !== id)
          );
          this.cargando.set(false);
        }),
        catchError((error: HttpErrorResponse) => {
          this.cargando.set(false);
          return this.handleError(error);
        })
      );
  }

  // -- Metodos utilitarios --

  /**
   * Limpia el estado del servicio.
   * Util al cerrar sesion o cambiar de contexto.
   */
  limpiarEstado(): void {
    this.categorias.set([]);
    this.error.set(null);
    this.cargando.set(false);
  }

  // -- Manejo de errores --

  /**
   * Transforma errores HTTP en errores personalizados.
   * Compatible con el formato de respuesta de boki-api.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    let errorCode = 'UNKNOWN_ERROR';

    // Error estructurado del backend (formato boki-api)
    if (error.error?.errors?.length > 0) {
      const backendError = error.error.errors[0];
      errorMessage = backendError.message;
      errorCode = backendError.code;
    }
    // Errores HTTP comunes
    else if (error.status === 400) {
      errorMessage = 'Datos invalidos enviados';
      errorCode = 'INVALID_DATA';
    } else if (error.status === 401) {
      errorMessage = 'No autorizado. Inicie sesion nuevamente';
      errorCode = 'UNAUTHORIZED';
    } else if (error.status === 403) {
      errorMessage = 'No tiene permisos para esta accion';
      errorCode = 'FORBIDDEN';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado';
      errorCode = 'NOT_FOUND';
    } else if (error.status === 409) {
      errorMessage = 'El recurso ya existe';
      errorCode = 'CONFLICT';
    } else if (error.status === 0) {
      errorMessage = 'Error de conexion con el servidor';
      errorCode = 'NETWORK_ERROR';
    } else if (error.status >= 500) {
      errorMessage = 'Error interno del servidor';
      errorCode = 'SERVER_ERROR';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    // Actualizar el signal de error para que los componentes reaccionen
    this.error.set(errorMessage);

    // Crear error personalizado con metadatos
    const customError: CustomError = new Error(errorMessage) as CustomError;
    customError.code = errorCode;
    customError.status = error.status;
    customError.originalError = error;

    return throwError(() => customError);
  }
}
