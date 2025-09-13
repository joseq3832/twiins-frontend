import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from '../../models/api.models';

@Component({
  selector: 'app-employee-view-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Información del Empleado</h2>
          <button
            type="button"
            (click)="onClose()"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6" *ngIf="employee">
          <!-- Información Personal -->
          <div class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Información Personal
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <p class="text-gray-900 font-mono">{{ employee.id }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <p class="text-gray-900 font-semibold">{{ employee.name }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p class="text-gray-900">
                  <a [href]="'mailto:' + employee.email" class="text-blue-600 hover:text-blue-800 underline">
                    {{ employee.email }}
                  </a>
                </p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <p class="text-gray-900">{{ employee.position }}</p>
              </div>
            </div>
          </div>

          <!-- Información Laboral -->
          <div class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
              </svg>
              Información Laboral
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Contratación</label>
                <p class="text-gray-900">{{ formatDate(employee.hire_date) }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Tiempo en la Empresa</label>
                <p class="text-gray-900">{{ calculateWorkTime(employee.hire_date) }}</p>
              </div>
            </div>
          </div>

          <!-- Familia Inmediata -->
          <div class="mb-6" *ngIf="employee.immediate_family && employee.immediate_family.length > 0">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              Familia Inmediata ({{ employee.immediate_family.length }} miembro(s))
            </h3>
            <div class="space-y-3">
              <div 
                *ngFor="let family of employee.immediate_family" 
                class="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-semibold text-gray-900">{{ family.family_name }}</p>
                    <p class="text-sm text-gray-600">{{ family.relationship }}</p>
                    <p class="text-sm text-gray-500" *ngIf="family.date_of_birth">
                      Nacimiento: {{ formatDate(family.date_of_birth) }}
                    </p>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {{ family.relationship }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Sin Familia Registrada -->
          <div class="mb-6" *ngIf="!employee.immediate_family || employee.immediate_family.length === 0">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              Familia Inmediata
            </h3>
            <div class="bg-gray-50 p-4 rounded-lg text-center">
              <p class="text-gray-500">No hay información de familia registrada</p>
            </div>
          </div>

          <!-- Información del Sistema -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Información del Sistema
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Creación</label>
                <p class="text-gray-900 text-sm">{{ formatDateTime(employee.created_at) }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Última Actualización</label>
                <p class="text-gray-900 text-sm">{{ formatDateTime(employee.updated_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end p-6 border-t border-gray-200">
          <button
            type="button"
            (click)="onClose()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class EmployeeViewModalComponent {
  @Input() show = false;
  @Input() employee: Employee | null = null;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  calculateWorkTime(hireDateString: string): string {
    const hireDate = new Date(hireDateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hireDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;

    let result = '';
    if (years > 0) {
      result += `${years} año${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
      if (result) result += ', ';
      result += `${months} mes${months > 1 ? 'es' : ''}`;
    }
    if (days > 0 && years === 0) {
      if (result) result += ', ';
      result += `${days} día${days > 1 ? 's' : ''}`;
    }

    return result || '0 días';
  }
}
