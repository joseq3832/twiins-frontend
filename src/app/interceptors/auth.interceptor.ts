/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import type {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, type Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);

  // Agregar token de autorización si está disponible
  const authRequest = addAuthHeader(request, authService);

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es un error 401 y no es una petición de login/register/refresh
      if (error.status === 401 && !isAuthRequest(request)) {
        return handle401Error(authRequest, next, authService);
      }

      return throwError(() => error);
    })
  );
};

/**
 * Agregar header de autorización a la petición
 */
function addAuthHeader(request: HttpRequest<any>, authService: AuthService): HttpRequest<any> {
  const token = authService.getAccessToken();

  if (token && !isAuthRequest(request)) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return request;
}

/**
 * Verificar si es una petición de autenticación
 */
function isAuthRequest(request: HttpRequest<any>): boolean {
  const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
  return authEndpoints.some((endpoint) => request.url.includes(endpoint));
}

/**
 * Manejar error 401 (no autorizado)
 */
function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();

    if (refreshToken) {
      return authService.refreshToken().pipe(
        switchMap((tokenResponse: any) => {
          isRefreshing = false;
          refreshTokenSubject.next(tokenResponse.access_token);

          // Reintentar la petición original con el nuevo token
          const newAuthRequest = addAuthHeader(request, authService);
          return next(newAuthRequest);
        }),
        catchError((error) => {
          isRefreshing = false;
          // Si falla el refresh, hacer logout
          authService.logout().subscribe();
          return throwError(() => error);
        })
      );
    } else {
      // No hay refresh token, hacer logout
      authService.logout().subscribe();
      return throwError(() => new Error('No refresh token available'));
    }
  } else {
    // Si ya se está refrescando el token, esperar a que termine
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap(() => {
        const newAuthRequest = addAuthHeader(request, authService);
        return next(newAuthRequest);
      })
    );
  }
}
