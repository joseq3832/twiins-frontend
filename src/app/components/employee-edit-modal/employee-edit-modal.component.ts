import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertCircle, LucideAngularModule, Save, X } from 'lucide-angular';
import type { Employee, ImmediateFamily, UpdateEmployeeRequest } from '../../models/api.models';

interface FamilyFormData {
  id?: number;
  family_name: string;
  relationship: string;
  date_of_birth: string;
}

@Component({
  selector: 'app-employee-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Background overlay -->
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="onCancel()"></div>
        
        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <!-- Header -->
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Editar Empleado
              </h3>
              <button
                type="button"
                (click)="onCancel()"
                class="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <lucide-icon [img]="X" class="h-6 w-6"></lucide-icon>
              </button>
            </div>
          </div>
          
          <!-- Form Content -->
          <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()" class="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <!-- Nombre -->
              <div class="sm:col-span-2">
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="name"
                  formControlName="name"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  [class.border-red-300]="employeeForm.get('name')?.invalid && employeeForm.get('name')?.touched"
                  placeholder="Ingrese el nombre completo"
                />
                <div *ngIf="employeeForm.get('name')?.invalid && employeeForm.get('name')?.touched" class="mt-1 flex items-center text-sm text-red-600">
                  <lucide-icon [img]="AlertCircle" class="h-4 w-4 mr-1"></lucide-icon>
                  <span *ngIf="employeeForm.get('name')?.errors?.['required']">El nombre es requerido</span>
                  <span *ngIf="employeeForm.get('name')?.errors?.['minlength']">El nombre debe tener al menos 2 caracteres</span>
                </div>
              </div>

              <!-- Email -->
              <div class="sm:col-span-2">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  id="email"
                  formControlName="email"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  [class.border-red-300]="employeeForm.get('email')?.invalid && employeeForm.get('email')?.touched"
                  placeholder="ejemplo@empresa.com"
                />
                <div *ngIf="employeeForm.get('email')?.invalid && employeeForm.get('email')?.touched" class="mt-1 flex items-center text-sm text-red-600">
                  <lucide-icon [img]="AlertCircle" class="h-4 w-4 mr-1"></lucide-icon>
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
                  type="text"
                  id="position"
                  formControlName="position"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  [class.border-red-300]="employeeForm.get('position')?.invalid && employeeForm.get('position')?.touched"
                  placeholder="Desarrollador, Gerente, etc."
                />
                <div *ngIf="employeeForm.get('position')?.invalid && employeeForm.get('position')?.touched" class="mt-1 flex items-center text-sm text-red-600">
                  <lucide-icon [img]="AlertCircle" class="h-4 w-4 mr-1"></lucide-icon>
                  <span *ngIf="employeeForm.get('position')?.errors?.['required']">El cargo es requerido</span>
                </div>
              </div>

              <!-- Fecha de contratación -->
              <div>
                <label for="hire_date" class="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de contratación *
                </label>
                <input
                  type="date"
                  id="hire_date"
                  formControlName="hire_date"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  [class.border-red-300]="employeeForm.get('hire_date')?.invalid && employeeForm.get('hire_date')?.touched"
                />
                <div *ngIf="employeeForm.get('hire_date')?.invalid && employeeForm.get('hire_date')?.touched" class="mt-1 flex items-center text-sm text-red-600">
                  <lucide-icon [img]="AlertCircle" class="h-4 w-4 mr-1"></lucide-icon>
                  <span *ngIf="employeeForm.get('hire_date')?.errors?.['required']">La fecha de contratación es requerida</span>
                </div>
              </div>
            </div>

            <!-- Sección de Familiares -->
            <div class="mt-8">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-lg font-medium text-gray-900">Familiares Inmediatos</h4>
                <button
                  type="button"
                  (click)="addFamilyMember()"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Agregar Familiar
                </button>
              </div>

              <div formArrayName="immediate_family" class="space-y-4">
                <div *ngFor="let familyControl of familyArray.controls; let i = index" [formGroupName]="i" class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div class="flex items-center justify-between mb-3">
                    <h5 class="text-sm font-medium text-gray-700">Familiar {{ i + 1 }}</h5>
                    <button
                      type="button"
                      (click)="removeFamilyMember(i)"
                      class="text-red-600 hover:text-red-800 focus:outline-none"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <!-- Nombre del familiar -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        formControlName="family_name"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        [class.border-red-500]="familyControl.get('family_name')?.invalid && familyControl.get('family_name')?.touched"
                        placeholder="Nombre del familiar"
                      />
                      <div *ngIf="familyControl.get('family_name')?.invalid && familyControl.get('family_name')?.touched" class="mt-1 flex items-center text-red-600 text-sm">
                        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                        <span *ngIf="familyControl.get('family_name')?.errors?.['required']">El nombre es requerido</span>
                        <span *ngIf="familyControl.get('family_name')?.errors?.['minlength']">Mínimo 2 caracteres</span>
                      </div>
                    </div>

                    <!-- Relación -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Relación *
                      </label>
                      <select
                        formControlName="relationship"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        [class.border-red-500]="familyControl.get('relationship')?.invalid && familyControl.get('relationship')?.touched"
                      >
                        <option value="">Seleccionar relación</option>
                        <option value="Cónyuge">Cónyuge</option>
                        <option value="Hijo/a">Hijo/a</option>
                        <option value="Padre">Padre</option>
                        <option value="Madre">Madre</option>
                        <option value="Hermano/a">Hermano/a</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <div *ngIf="familyControl.get('relationship')?.invalid && familyControl.get('relationship')?.touched" class="mt-1 flex items-center text-red-600 text-sm">
                        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                        <span *ngIf="familyControl.get('relationship')?.errors?.['required']">La relación es requerida</span>
                      </div>
                    </div>

                    <!-- Fecha de nacimiento -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de nacimiento *
                      </label>
                      <input
                        type="date"
                        formControlName="date_of_birth"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        [class.border-red-500]="familyControl.get('date_of_birth')?.invalid && familyControl.get('date_of_birth')?.touched"
                      />
                      <div *ngIf="familyControl.get('date_of_birth')?.invalid && familyControl.get('date_of_birth')?.touched" class="mt-1 flex items-center text-red-600 text-sm">
                        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                        <span *ngIf="familyControl.get('date_of_birth')?.errors?.['required']">La fecha es requerida</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Mensaje cuando no hay familiares -->
                <div *ngIf="familyArray.length === 0" class="text-center py-8 text-gray-500">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p class="mt-2">No se han agregado familiares</p>
                  <p class="text-sm">Haz clic en "Agregar Familiar" para comenzar</p>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                (click)="onCancel()"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="employeeForm.invalid || isSubmitting"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <lucide-icon [img]="Save" class="h-4 w-4 mr-2"></lucide-icon>
                {{ isSubmitting ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class EmployeeEditModalComponent implements OnInit, OnChanges {
  readonly X = X;
  readonly Save = Save;
  readonly AlertCircle = AlertCircle;

  @Input() isOpen = false;
  @Input() employee: Employee | null = null;
  @Input() isSubmitting = false;

  @Output() save = new EventEmitter<UpdateEmployeeRequest>();
  @Output() cancel = new EventEmitter<void>();

  employeeForm: FormGroup;
  private originalFamilyMembers: ImmediateFamily[] = [];
  private deletedFamilyMembers: (ImmediateFamily & { _delete: boolean })[] = [];
  private modifiedFamilyMembers: Set<number> = new Set();

  constructor(private fb: FormBuilder) {
    this.employeeForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employee'] && this.employee) {
      this.initializeForm();
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
      id: [null],
      family_name: ['', [Validators.required, Validators.minLength(2)]],
      relationship: ['', [Validators.required]],
      date_of_birth: ['', [Validators.required]],
    });
  }

  addFamilyMember(): void {
    this.familyArray.push(this.createFamilyMember());
  }

  removeFamilyMember(index: number): void {
    const familyControl = this.familyArray.at(index);
    const familyId = familyControl.get('id')?.value;

    // Si el familiar tiene un id, significa que existe en la base de datos
    // y necesitamos marcarlo para eliminación
    if (familyId && this.originalFamilyMembers[familyId]) {
      const originalMember = this.originalFamilyMembers.find((m) => m.id === familyId);
      if (originalMember) {
        this.deletedFamilyMembers.push({ ...originalMember, _delete: true });
      }
    }

    // Remover del FormArray
    this.familyArray.removeAt(index);
  }

  private isFamilyMemberModified(familyData: FamilyFormData, originalIndex: number): boolean {
    if (!this.originalFamilyMembers[originalIndex]) {
      return false; // Es un familiar nuevo
    }

    const original = this.originalFamilyMembers[originalIndex];
    return (
      familyData.family_name !== original.family_name ||
      familyData.relationship !== original.relationship ||
      familyData.date_of_birth !==
        (original.date_of_birth ? new Date(original.date_of_birth).toISOString().split('T')[0] : '')
    );
  }

  private initializeForm(): void {
    if (this.employee) {
      // Formatear la fecha para el input date
      const hireDate = this.employee.hire_date
        ? new Date(this.employee.hire_date).toISOString().split('T')[0]
        : '';

      this.employeeForm.patchValue({
        name: this.employee.name || '',
        email: this.employee.email || '',
        position: this.employee.position || '',
        hire_date: hireDate,
      });

      // Guardar familiares originales y limpiar arrays
      this.originalFamilyMembers = this.employee.immediate_family
        ? [...this.employee.immediate_family]
        : [];
      this.deletedFamilyMembers = [];
      this.modifiedFamilyMembers.clear();

      // Limpiar el FormArray de familiares
      while (this.familyArray.length !== 0) {
        this.familyArray.removeAt(0);
      }

      // Agregar familiares existentes
      if (this.employee.immediate_family && this.employee.immediate_family.length > 0) {
        this.employee.immediate_family.forEach((family, index) => {
          const familyGroup = this.fb.group({
            id: [family.id || null],
            family_name: [family.family_name || '', [Validators.required, Validators.minLength(2)]],
            relationship: [family.relationship || '', [Validators.required]],
            date_of_birth: [
              family.date_of_birth
                ? new Date(family.date_of_birth).toISOString().split('T')[0]
                : '',
              [Validators.required],
            ],
          });

          // Agregar listener para detectar cambios en familiares existentes
          if (family.id) {
            familyGroup.valueChanges.subscribe(() => {
              this.modifiedFamilyMembers.add(index);
            });
          }

          this.familyArray.push(familyGroup);
        });
      }
    }
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.value;

      // Construir el array de familiares con el formato correcto
      const familyMembers = [];

      // Procesar familiares del formulario
      if (formValue.immediate_family) {
        formValue.immediate_family.forEach((family: FamilyFormData, _index: number) => {
          // Si es un familiar nuevo (sin id)
          if (!family.id) {
            const familyData: Omit<
              ImmediateFamily,
              'id' | 'employee_id' | 'created_at' | 'updated_at'
            > = {
              family_name: family.family_name,
              relationship: family.relationship,
              date_of_birth: family.date_of_birth,
            };
            familyMembers.push(familyData);
          } else {
            // Es un familiar existente, verificar si fue modificado
            const originalIndex = this.originalFamilyMembers.findIndex(
              (orig) => orig.id === family.id
            );
            if (originalIndex !== -1 && this.isFamilyMemberModified(family, originalIndex)) {
              const familyData: Partial<ImmediateFamily> = {
                id: family.id,
                family_name: family.family_name,
                relationship: family.relationship,
                date_of_birth: family.date_of_birth,
              };
              familyMembers.push(familyData);
            }
          }
        });
      }

      // Agregar familiares marcados para eliminación
      familyMembers.push(...(this.deletedFamilyMembers as ImmediateFamily[]));

      const updateData: UpdateEmployeeRequest = {
        name: formValue.name,
        email: formValue.email,
        position: formValue.position,
        hire_date: formValue.hire_date,
        immediate_family: familyMembers,
      };

      this.save.emit(updateData);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.employeeForm.controls).forEach((key) => {
        this.employeeForm.get(key)?.markAsTouched();
      });

      // Marcar campos de familiares como touched
      this.familyArray.controls.forEach((control) => {
        Object.keys((control as FormGroup).controls).forEach((key) => {
          control.get(key)?.markAsTouched();
        });
      });
    }
  }

  onCancel(): void {
    this.employeeForm.reset();
    this.cancel.emit();
  }
}
