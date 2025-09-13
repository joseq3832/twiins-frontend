import { Injectable } from '@angular/core';

export interface AppConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  environment: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = {
      apiBaseUrl: this.getEnvVar('API_BASE_URL', 'http://localhost/api/v1'),
      apiTimeout: parseInt(this.getEnvVar('API_TIMEOUT', '30000'), 10),
      environment: this.getEnvVar('ENVIRONMENT', 'development'),
    };
  }

  private getEnvVar(key: string, defaultValue: string): string {
    // En Angular, las variables de entorno se manejan durante el build
    // Para desarrollo, usamos valores por defecto
    const envVars: { [key: string]: string } = {
      API_BASE_URL: 'http://localhost/api',
      API_TIMEOUT: '30000',
      ENVIRONMENT: 'development',
    };

    return envVars[key] || defaultValue;
  }

  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  get apiTimeout(): number {
    return this.config.apiTimeout;
  }

  get environment(): string {
    return this.config.environment;
  }

  get isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  get isProduction(): boolean {
    return this.config.environment === 'production';
  }
}
