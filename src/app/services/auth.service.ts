import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  ApiError,
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  User,
} from '../models/api.models';
import { ConfigService } from './config.service';
import { TokenData, TokenManagerService } from './token-manager.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private tokenManager = inject(TokenManagerService);

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    this.checkStoredAuth();

    this.setupTokenManagerSubscriptions();
  }

  private checkStoredAuth(): void {
    const token = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const expiresIn = localStorage.getItem('expires_in');

    if (token && refreshToken && expiresIn) {
      this.isAuthenticatedSubject.next(true);

      this.getCurrentUser().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);

          const tokenData: TokenData = {
            accessToken: token,
            refreshToken: refreshToken,
            expiresIn: parseInt(expiresIn, 10),
          };

          this.tokenManager.startAutoRefresh(tokenData);
        },
        error: () => {
          this.logout();
        },
      });
    }
  }

  /**
   * Iniciar sesión
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.config.apiBaseUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        this.storeTokens(response);
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);

        this.startAutoRefresh(response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Renovar token de acceso
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refresh_token: refreshToken };
    return this.http.post<AuthResponse>(`${this.config.apiBaseUrl}/auth/refresh`, request).pipe(
      tap((response) => {
        this.storeTokens(response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): Observable<any> {
    return this.http.post(`${this.config.apiBaseUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearTokens();
      }),
      catchError((error) => {
        this.clearTokens();
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener información del usuario actual
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<{ user: User }>(`${this.config.apiBaseUrl}/auth/me`).pipe(
      map((response) => response.user),
      catchError(this.handleError)
    );
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtener token de acceso
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Almacenar tokens en localStorage
   */
  private storeTokens(authResponse: AuthResponse): void {
    localStorage.setItem('access_token', authResponse.access_token);
    localStorage.setItem('refresh_token', authResponse.refresh_token);
    localStorage.setItem('token_type', authResponse.token_type);
    localStorage.setItem('expires_in', authResponse.expires_in.toString());
  }

  /**
   * Limpiar tokens del localStorage
   */
  private clearTokens(): void {
    this.tokenManager.cleanup();

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('expires_in');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Configurar suscripciones al TokenManager
   */
  private setupTokenManagerSubscriptions(): void {
    this.tokenManager.tokenRefreshed$.subscribe(() => {
      this.isAuthenticatedSubject.next(true);
    });

    this.tokenManager.refreshError$.subscribe((error) => {
      if (error) {
        this.clearTokens();
      }
    });
  }

  /**
   * Iniciar renovación automática de tokens
   */
  private startAutoRefresh(authResponse: AuthResponse): void {
    const tokenData: TokenData = {
      accessToken: authResponse.access_token,
      refreshToken: authResponse.refresh_token,
      expiresIn: authResponse.expires_in,
    };

    this.tokenManager.startAutoRefresh(tokenData);
  }

  /**
   * Manejar errores de HTTP
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      const apiError = error.error as ApiError;
      errorMessage = apiError.message || `Error ${error.status}: ${error.statusText}`;
    }

    if (error.status === 401) {
      this.clearTokens();
    }

    return throwError(() => new Error(errorMessage));
  };
}
