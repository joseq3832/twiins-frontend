import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface TokenData {
  token: string;
  expiresAt?: number;
}

export interface UserData {
  id: string;
  email?: string;
  name?: string;
}

export interface TabSyncMessage {
  type: 'TOKEN_REFRESHED' | 'TOKEN_EXPIRED' | 'LOGOUT' | 'LOGIN';
  timestamp: number;
  data?: TokenData | UserData;
}

@Injectable({
  providedIn: 'root',
})
export class TabSyncService {
  private readonly STORAGE_KEY = 'tab_sync_message';
  private messageSubject = new BehaviorSubject<TabSyncMessage | null>(null);

  public messages$ = this.messageSubject
    .asObservable()
    .pipe(filter((message) => message !== null)) as Observable<TabSyncMessage>;

  constructor() {
    this.setupStorageListener();
  }

  /**
   * Envía un mensaje a todas las pestañas abiertas
   */
  sendMessage(type: TabSyncMessage['type'], data?: TokenData | UserData): void {
    const message: TabSyncMessage = {
      type,
      timestamp: Date.now(),
      data,
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(message));

    setTimeout(() => {
      localStorage.removeItem(this.STORAGE_KEY);
    }, 100);
  }

  /**
   * Notifica que el token fue renovado
   */
  notifyTokenRefreshed(tokenData: TokenData): void {
    this.sendMessage('TOKEN_REFRESHED', tokenData);
  }

  /**
   * Notifica que el token expiró
   */
  notifyTokenExpired(): void {
    this.sendMessage('TOKEN_EXPIRED');
  }

  /**
   * Notifica logout a otras pestañas
   */
  notifyLogout(): void {
    this.sendMessage('LOGOUT');
  }

  /**
   * Notifica login a otras pestañas
   */
  notifyLogin(userData: UserData): void {
    this.sendMessage('LOGIN', userData);
  }

  /**
   * Configura el listener para cambios en localStorage
   */
  private setupStorageListener(): void {
    fromEvent<StorageEvent>(window, 'storage')
      .pipe(
        filter((event) => event.key === this.STORAGE_KEY && event.newValue !== null),
        map((event) => {
          try {
            return JSON.parse(event.newValue!) as TabSyncMessage;
          } catch {
            return null;
          }
        }),
        filter((message) => message !== null)
      )
      .subscribe((message) => {
        this.messageSubject.next(message);
      });
  }
}

/**
 * Servicio para detectar cuando la aplicación está en background/foreground
 */
@Injectable({
  providedIn: 'root',
})
export class VisibilityService {
  private visibilitySubject = new BehaviorSubject<boolean>(!document.hidden);
  public visibility$ = this.visibilitySubject.asObservable();

  private lastActiveTime = Date.now();
  private readonly INACTIVE_THRESHOLD = 30 * 60 * 1000;

  constructor() {
    this.setupVisibilityListener();
    this.setupActivityTracking();
  }

  /**
   * Verifica si la aplicación está visible
   */
  isVisible(): boolean {
    return this.visibilitySubject.value;
  }

  /**
   * Verifica si la aplicación ha estado inactiva por mucho tiempo
   */
  isInactiveForLong(): boolean {
    return Date.now() - this.lastActiveTime > this.INACTIVE_THRESHOLD;
  }

  /**
   * Obtiene el tiempo de inactividad en milisegundos
   */
  getInactiveTime(): number {
    return Date.now() - this.lastActiveTime;
  }

  /**
   * Resetea el tiempo de actividad
   */
  resetActivityTime(): void {
    this.lastActiveTime = Date.now();
  }

  /**
   * Configura el listener para cambios de visibilidad
   */
  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      const isVisible = !document.hidden;
      this.visibilitySubject.next(isVisible);

      if (isVisible) {
        this.resetActivityTime();
      }
    });
  }

  /**
   * Configura el tracking de actividad del usuario
   */
  private setupActivityTracking(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const resetActivity = () => {
      this.resetActivityTime();
    };

    events.forEach((event) => {
      document.addEventListener(event, resetActivity, { passive: true });
    });
  }
}

/**
 * Servicio para manejar reconexión de red
 */
@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public online$ = this.onlineSubject.asObservable();

  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor() {
    this.setupNetworkListeners();
  }

  /**
   * Verifica si hay conexión a internet
   */
  isOnline(): boolean {
    return this.onlineSubject.value;
  }

  /**
   * Obtiene el número de intentos de reconexión
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  /**
   * Resetea el contador de intentos de reconexión
   */
  resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
  }

  /**
   * Incrementa el contador de intentos de reconexión
   */
  incrementReconnectAttempts(): void {
    this.reconnectAttempts++;
  }

  /**
   * Verifica si se han agotado los intentos de reconexión
   */
  hasExceededReconnectAttempts(): boolean {
    return this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS;
  }

  /**
   * Configura los listeners para eventos de red
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.onlineSubject.next(true);
      this.resetReconnectAttempts();
    });

    window.addEventListener('offline', () => {
      this.onlineSubject.next(false);
    });
  }
}
