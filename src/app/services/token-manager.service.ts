import { Injectable, inject } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { AuthService } from './auth.service';
import { TabSyncService } from './tab-sync.service';

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root',
})
export class TokenManagerService {
  private authService = inject(AuthService);
  private tabSyncService = inject(TabSyncService);

  private refreshTimer?: Subscription;
  private currentTokenData?: TokenData;
  private isRefreshing = false;

  private readonly REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000;

  public tokenRefreshed$ = new Subject<void>();
  public refreshError$ = new Subject<string>();

  constructor() {
    this.setupTabSync();
  }

  startAutoRefresh(tokenData: TokenData): void {
    this.currentTokenData = tokenData;
    this.scheduleRefresh();
  }

  private scheduleRefresh(): void {
    if (!this.currentTokenData) return;

    this.clearRefreshTimer();

    const expiryTime = Date.now() + this.currentTokenData.expiresIn * 1000;
    const refreshTime = expiryTime - this.REFRESH_BEFORE_EXPIRY_MS;
    const delay = Math.max(0, refreshTime - Date.now());

    this.refreshTimer = timer(delay).subscribe(() => {
      this.performTokenRefresh();
    });
  }

  private async performTokenRefresh(): Promise<void> {
    if (this.isRefreshing) return;

    this.isRefreshing = true;

    try {
      await this.authService.refreshToken().toPromise();

      this.tokenRefreshed$.next();
      this.tabSyncService.notifyTokenRefreshed(null);
    } catch (_error) {
      this.refreshError$.next('Error al renovar token');
    } finally {
      this.isRefreshing = false;
    }
  }

  private setupTabSync(): void {
    this.tabSyncService.messages$.subscribe((message) => {
      if (message.type === 'TOKEN_REFRESHED') {
        this.tokenRefreshed$.next();
      }
    });
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
      this.refreshTimer = undefined;
    }
  }

  cleanup(): void {
    this.clearRefreshTimer();
  }
}
