import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee } from '../../models/api.models';

@Component({
  selector: 'app-employee-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Añadir Nuevo Empleado</h2>
          <button
            type="button"
            (click)="onCancel()"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Nombre -->
            <div class="md:col-span-2">
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                id="name"
                type="text"
                formControlName="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-500]="employeeForm.get('name')?.invalid && employeeForm.get('name')?.touched"
                placeholder="Ingrese el nombre completo"
              />
              <div *ngIf="employeeForm.get('name')?.invalid && employeeForm.get('name')?.touched" class="mt-1 flex items-center text-red-600 text-sm">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span *ngIf="employeeForm.get('name')?.errors?.['required']">El nombre es requerido</span>
                <span *ngIf="employeeForm.get('name')?.errors?.['minlength']">El nombre debe tener al menos 2 caracteres</span>
              </div>
            </div>

            <!-- Email -->
            <div class="md:col-span-2">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-500]="employeeForm.get('email')?.invalid && employeeForm.get('email')?.touched"
                placeholder="ejemplo@empresa.com"
              />
              <div *ngIf="employeeForm.get('email')?.invalid && employeeForm.get('email')?.touched" class="mt-1 flex items-center text-red-600 text-sm">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span *ngIf="employeeForm.get('email')?.errors?.['required']">El email es requerido</span>
                <span *ngIf="employeeForm.get('email')?.errors?.['email']">Ingrese un email válido</span>
              </div>
            </div>

            <!-- Cargo -->
            <div>
              <label for="position" class="block text-sm font-medium text-gray-700 mb-1">
                Cargo *
              </label>
              <input
                id="position"
                type="text"
                formControlName="position"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-500]="employeeForm.get('position')?.invalid && employeeForm.get('position')?.touched"
                placeholder="Desarrollador, Gerente, etc."
              />
              <div *ngIf="employeeForm.get('position')?.invalid && employeeForm.get('position')?.touched" class="mt-1 flex items-center text-red-600 text-sm">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span *ngIf="employeeForm.get('position')?.errors?.['required']">El cargo es requerido</span>
              </div>
            </div>

            <!-- Fecha de contratación -->
            <div>
              <label for="hire_date" class="block text-sm font-medium text-gray-700 mb-1">
                Fecha de contratación *
              </label>
              <input
                id="hire_date"
                type="date"
                formControlName="hire_date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-500]="employeeForm.get('hire_date')?.invalid && employeeForm.get('hire_date')?.touched"
              />
              <div *ngIf="employeeForm.get('hire_date')?.invalid && employeeForm.get('hire_date')?.touched" class="mt-1 flex items-center text-red-600 text-sm">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span *ngIf="employeeForm.get('hire_date')?.errors?.['required']">La fecha de contratación es requerida</span>
              </div>
            </div>
          </div>

          <!-- Sección de Familiares -->
          <div class="mt-6 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Familia Inmediata
              </h3>
              <button
                type="button"
                (click)="addFamilyMember()"
                class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Agregar Familiar
              </button>
            </div>

            <!-- Lista de Familiares -->
            <div formArrayName="immediate_family" class="space-y-4">
              <div *ngFor="let familyGroup of familyArray.controls; let i = index" [formGroupName]="i" class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-sm font-medium text-gray-700">Familiar {{ i + 1 }}</h4>
                  <button
                    type="button"
                    (click)="removeFamilyMember(i)"
                    class="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <!-- Nombre del Familiar -->
                  <div>
                    <label [for]="'family_name_' + i" class="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      [id]="'family_name_' + i"
                      type="text"
                      formControlName="family_name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      [class.border-red-500]="familyGroup.get('family_name')?.invalid && familyGroup.get('family_name')?.touched"
                      placeholder="Nombre completo"
                    />
                    <div *ngIf="familyGroup.get('family_name')?.invalid && familyGroup.get('family_name')?.touched" class="mt-1 text-red-600 text-xs">
                      <span *ngIf="familyGroup.get('family_name')?.errors?.['required']">Requerido</span>
                      <span *ngIf="familyGroup.get('family_name')?.errors?.['minlength']">Mínimo 2 caracteres</span>
                    </div>
                  </div>

                  <!-- Parentesco -->
                  <div>
                    <label [for]="'relationship_' + i" class="block text-sm font-medium text-gray-700 mb-1">
                      Parentesco *
                    </label>
                    <select
                      [id]="'relationship_' + i"
                      formControlName="relationship"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      [class.border-red-500]="familyGroup.get('relationship')?.invalid && familyGroup.get('relationship')?.touched"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Cónyuge">Cónyuge</option>
                      <option value="Hijo/a">Hijo/a</option>
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Hermano/a">Hermano/a</option>
                      <option value="Otro">Otro</option>
                    </select>
                    <div *ngIf="familyGroup.get('relationship')?.invalid && familyGroup.get('relationship')?.touched" class="mt-1 text-red-600 text-xs">
                      <span *ngIf="familyGroup.get('relationship')?.errors?.['required']">Requerido</span>
                    </div>
                  </div>

                  <!-- Fecha de Nacimiento -->
                  <div>
                    <label [for]="'date_of_birth_' + i" class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Nacimiento *
                    </label>
                    <input
                      [id]="'date_of_birth_' + i"
                      type="date"
                      formControlName="date_of_birth"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      [class.border-red-500]="familyGroup.get('date_of_birth')?.invalid && familyGroup.get('date_of_birth')?.touched"
                    />
                    <div *ngIf="familyGroup.get('date_of_birth')?.invalid && familyGroup.get('date_of_birth')?.touched" class="mt-1 text-red-600 text-xs">
                      <span *ngIf="familyGroup.get('date_of_birth')?.errors?.['required']">Requerido</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mensaje cuando no hay familiares -->
              <div *ngIf="familyArray.length === 0" class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <p class="text-sm">No hay familiares agregados</p>
                <p class="text-xs mt-1">Haz clic en "Agregar Familiar" para añadir información de familia</p>
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              (click)="onCancel()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="employeeForm.invalid || isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isSubmitting ? 'Creando...' : 'Crear Empleado' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [],
})
export class EmployeeCreateModalComponent implements OnInit, OnChanges {
  @Input() show = false;
  @Input() isSubmitting = false;
  @Output() save = new EventEmitter<Partial<Employee>>();
  @Output() cancel = new EventEmitter<void>();

  employeeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.employeeForm = this.createForm();
  }

  ngOnInit() {
    // Reset form when modal opens
    if (this.show) {
      this.employeeForm.reset();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      position: ['', [Validators.required]],
      hire_date: ['', [Validators.required]],
      immediate_family: this.fb.array([]),
    });
  }

  get familyArray(): FormArray {
    return this.employeeForm.get('immediate_family') as FormArray;
  }

  createFamilyMember(): FormGroup {
    return this.fb.group({
      family_name: ['', [Validators.required, Validators.minLength(2)]],
      relationship: ['', [Validators.required]],
      date_of_birth: ['', [Validators.required]],
    });
  }

  addFamilyMember(): void {
    this.familyArray.push(this.createFamilyMember());
  }

  removeFamilyMember(index: number): void {
    this.familyArray.removeAt(index);
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.value;

      // Prepare employee data for creation
      const newEmployeeData: Partial<Employee> = {
        name: formValue.name,
        email: formValue.email,
        position: formValue.position,
        hire_date: formValue.hire_date,
        immediate_family: formValue.immediate_family || [],
      };

      this.save.emit(newEmployeeData);
    } else {
    }
  }

  onCancel() {
    this.employeeForm.reset();
    this.cancel.emit();
  }

  // Reset form when modal is closed
  ngOnChanges() {
    if (!this.show) {
      this.employeeForm.reset();
    }
  }
}
