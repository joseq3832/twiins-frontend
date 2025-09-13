import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Edit, Eye, LucideAngularModule, Trash2 } from 'lucide-angular';
import {
  AdvancedDataTableComponent,
  type PageEvent,
  type SortEvent,
  type TableAction,
  type TableColumn,
} from '../components/advanced-data-table/advanced-data-table.component';
import {
  AdvancedFiltersComponent,
  type FilterField,
} from '../components/advanced-filters/advanced-filters.component';
import { ConfirmationModalComponent } from '../components/confirmation-modal/confirmation-modal.component';
import { EmployeeCreateModalComponent } from '../components/employee-create-modal/employee-create-modal.component';
import { EmployeeEditModalComponent } from '../components/employee-edit-modal/employee-edit-modal.component';
import { EmployeeViewModalComponent } from '../components/employee-view-modal/employee-view-modal.component';
import type {
  CreateEmployeeRequest,
  Employee,
  EmployeeQueryParams,
  PaginatedResponse,
  UpdateEmployeeRequest,
} from '../models/api.models';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    AdvancedFiltersComponent,
    AdvancedDataTableComponent,
    ConfirmationModalComponent,
    EmployeeEditModalComponent,
    EmployeeCreateModalComponent,
    EmployeeViewModalComponent,
  ],
  templateUrl: './employee-list.html',
})
export class EmployeeList implements OnInit {
  readonly Eye = Eye;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  data: PaginatedResponse<Employee> | null = null;
  loading = false;
  error: string | null = null;
  currentFilters: EmployeeQueryParams = { page: 1, limit: 20 };
  currentSort: SortEvent | null = null;

  // Modal state
  showDeleteModal = false;
  showViewModal = false;
  employeeToDelete: Employee | null = null;
  employeeToView: Employee | null = null;
  showEditModal = false;
  employeeToEdit: Employee | null = null;
  isSubmittingEdit = false;
  showCreateModal = false;
  isSubmittingCreate = false;

  // Configuración de filtros
  filterFields: FilterField[] = [
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'position', label: 'Cargo', type: 'text' },
    { key: 'hire_date', label: 'Fecha de Contratación', type: 'date' },
  ];

  // Relaciones disponibles
  availableRelations = [
    { key: 'department', label: 'Departamento' },
    { key: 'manager', label: 'Supervisor' },
    { key: 'projects', label: 'Proyectos' },
  ];

  sortableFields: FilterField[] = [
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'position', label: 'Cargo', type: 'text' },
    { key: 'hire_date', label: 'Fecha de Contratación', type: 'date' },
  ];

  selectableFields: FilterField[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'position', label: 'Cargo', type: 'text' },
    { key: 'hire_date', label: 'Fecha de Contratación', type: 'date' },
    { key: 'immediate_family', label: 'Familia Inmediata', type: 'text' },
  ];

  // Configuración de columnas de la tabla
  tableColumns: TableColumn<Employee>[] = [
    { key: 'id', label: 'ID', sortable: true, type: 'number', width: '80px' },
    { key: 'name', label: 'Nombre', sortable: true, type: 'text' },
    { key: 'email', label: 'Email', sortable: true, type: 'email' },
    { key: 'position', label: 'Cargo', sortable: true, type: 'text' },
    {
      key: 'hire_date',
      label: 'Fecha de Contratación',
      sortable: true,
      type: 'date',
      formatter: (value: unknown) => {
        const dateValue = typeof value === 'string' ? value : String(value);
        return new Date(dateValue).toLocaleDateString('es-ES');
      },
    },
    {
      key: 'immediate_family',
      label: 'Familia',
      sortable: false,
      type: 'custom',
      align: 'center',
      formatter: (value: unknown) => {
        const familyArray = Array.isArray(value) ? value : [];
        return familyArray.length > 0 ? `${familyArray.length} miembro(s)` : '0 miembros';
      },
    },
    {
      key: 'created_at',
      label: 'Fecha de Creación',
      sortable: true,
      type: 'date',
      formatter: (value: unknown) => {
        const dateValue = typeof value === 'string' ? value : String(value);
        return new Date(dateValue).toLocaleDateString('es-ES');
      },
    },
  ];

  visibleColumns: TableColumn<Employee>[] = [];

  // Acciones de la tabla
  tableActions: TableAction<Employee>[] = [
    {
      label: 'Ver',
      icon: 'eye',
      class: 'text-blue-600 hover:text-blue-800 mr-2',
      action: (employee: Employee) => this.viewEmployee(employee),
    },
    {
      label: 'Editar',
      icon: 'edit',
      class: 'text-green-600 hover:text-green-800 mr-2',
      action: (employee: Employee) => this.editEmployee(employee),
    },
    {
      label: 'Eliminar',
      icon: 'trash-2',
      class: 'text-red-600 hover:text-red-800',
      action: (employee: Employee) => this.deleteEmployee(employee),
    },
  ];

  getIconComponent(iconName: string): typeof Eye | typeof Edit | typeof Trash2 | null {
    switch (iconName) {
      case 'eye':
        return this.Eye;
      case 'edit':
        return this.Edit;
      case 'trash-2':
        return this.Trash2;
      default:
        return null;
    }
  }

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.visibleColumns = [...this.tableColumns];
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = null;

    const params: EmployeeQueryParams = {
      ...this.currentFilters,
      include: 'immediateFamily',
    };

    this.employeeService.getEmployees(params).subscribe({
      next: (response: PaginatedResponse<Employee>) => {
        this.data = response;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los empleados. Por favor, intenta de nuevo.';
        this.loading = false;
        console.error('Error loading employees:', error);
      },
    });
  }

  onFiltersChange(filters: EmployeeQueryParams): void {
    this.currentFilters = { ...filters, page: 1, limit: this.currentFilters.limit };
    this.loadEmployees();
  }

  onSortChange(sort: SortEvent): void {
    this.currentSort = sort;
    this.currentFilters.sort = sort.direction === 'desc' ? `-${sort.field}` : sort.field;
    this.loadEmployees();
  }

  onPageChange(pageEvent: PageEvent): void {
    this.currentFilters.page = pageEvent.page;
    this.currentFilters.limit = pageEvent.limit;
    this.loadEmployees();
  }

  onPageSizeChange(pageSize: number): void {
    this.currentFilters.limit = pageSize;
    this.currentFilters.page = 1;
    this.loadEmployees();
  }

  onRetry(): void {
    this.loadEmployees();
  }

  // Acciones de empleados
  viewEmployee(employee: Employee) {
    this.employeeToView = employee;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.employeeToView = null;
  }

  editEmployee(employee: Employee): void {
    this.employeeToEdit = employee;
    this.showEditModal = true;
  }

  onSaveEmployee(updateData: UpdateEmployeeRequest): void {
    if (this.employeeToEdit) {
      this.isSubmittingEdit = true;
      this.employeeService.updateEmployee(this.employeeToEdit.id, updateData).subscribe({
        next: () => {
          this.loadEmployees();
          this.closeEditModal();
        },
        error: (error) => {
          console.error('Error updating employee:', error);
          alert('Error al actualizar el empleado. Por favor, intenta de nuevo.');
          this.isSubmittingEdit = false;
        },
      });
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.employeeToEdit = null;
    this.isSubmittingEdit = false;
  }

  // Create modal methods
  openCreateModal() {
    this.showCreateModal = true;
  }

  onCreateEmployee(employeeData: Partial<Employee>) {
    const createRequest: CreateEmployeeRequest = {
      name: employeeData.name!,
      email: employeeData.email!,
      position: employeeData.position!,
      hire_date: employeeData.hire_date!,
      immediate_family: employeeData.immediate_family || [],
    };

    this.isSubmittingCreate = true;

    const subscription = this.employeeService.createEmployee(createRequest);

    subscription.subscribe({
      next: () => {
        this.isSubmittingCreate = false;
        this.closeCreateModal();
        this.loadEmployees();
      },
      error: (error) => {
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url,
        });
        this.isSubmittingCreate = false;
      },
    });
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.isSubmittingCreate = false;
  }

  deleteEmployee(employee: Employee): void {
    this.employeeToDelete = employee;
    this.showDeleteModal = true;
  }

  onConfirmDelete(): void {
    if (this.employeeToDelete) {
      this.employeeService.deleteEmployee(this.employeeToDelete.id).subscribe({
        next: () => {
          this.loadEmployees();
          this.closeDeleteModal();
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          alert('Error al eliminar el empleado. Por favor, intenta de nuevo.');
          this.closeDeleteModal();
        },
      });
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.employeeToDelete = null;
  }
}
